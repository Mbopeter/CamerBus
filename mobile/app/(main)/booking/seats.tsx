import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

const { width } = Dimensions.get('window');
const SEAT_SIZE = (width - 60) / 7;

export default function SeatsScreen() {
  const { t }      = useTranslation();
  const router     = useRouter();
  const { selectedSchedule, selectedSeats, toggleSeat } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const { data, isLoading } = useQuery({
    queryKey: ['seats', selectedSchedule?.id],
    queryFn: () => scheduleService.getSeats(selectedSchedule.id).then(r => r.data?.data ?? null),
    enabled: !!selectedSchedule?.id,
    refetchInterval: 15000,
  });

  const seats: any[] = data?.seats ?? [];

  // ── Single flat price per bus ───────────────────────────────────────
  // The backend now resolves ONE price based on bus_type (no per-seat mixing).
  // Fallback: derive from selectedSchedule fields if flat_price not yet present.
  const isVipBus = data?.company_class === 'vip' ||
    ['VIP', 'Luxury'].includes(data?.bus_type ?? selectedSchedule?.bus_type ?? '');

  const flatPrice: number = (() => {
    if (data?.flat_price) return Number(data.flat_price);
    if (!selectedSchedule) return 0;
    return isVipBus
      ? Number(selectedSchedule.price_vip)
      : Number(selectedSchedule.price_standard);
  })();

  const totalPrice = selectedSeats.length * flatPrice;

  // ── Seat layout grouping ────────────────────────────────────────────
  const rows = seats.reduce((acc: Record<number, any[]>, s) => {
    if (!acc[s.row_number]) acc[s.row_number] = [];
    acc[s.row_number].push(s);
    return acc;
  }, {});

  // ── Seat colour ─────────────────────────────────────────────────────
  // All seats on the same bus share one colour (VIP gold or Standard green).
  // The only visual states are: available / occupied / selected.
  const getSeatColor = (seat: any) => {
    if (seat.is_booked || seat.is_held)         return theme.seatOccupied ?? theme.danger;
    if (selectedSeats.find(s => s.id === seat.id)) return theme.seatSelected ?? theme.accent;
    if (isVipBus)                               return theme.seatVip ?? theme.primary;
    return theme.seatAvailable ?? theme.success;
  };

  const getSeatTextColor = (seat: any) => {
    if (selectedSeats.find(s => s.id === seat.id)) return '#1A1A1A';
    return '#fff';
  };

  // ── Legend items — only show VIP legend on a VIP bus ───────────────
  const legendItems = [
    { color: isVipBus ? (theme.seatVip ?? theme.primary) : (theme.seatAvailable ?? theme.success),
      label: t('booking.legend_available') },
    { color: theme.seatOccupied ?? theme.danger,  label: t('booking.legend_occupied') },
    { color: theme.seatSelected ?? theme.accent,  label: t('booking.legend_selected') },
    ...(isVipBus ? [{ color: theme.seatVip ?? theme.primary, label: t('booking.legend_vip') }] : []),
  ];

  const renderSeat = (seat: any) => (
    <TouchableOpacity
      key={seat.id}
      style={[styles.seat, { backgroundColor: getSeatColor(seat) }]}
      onPress={() => !seat.is_booked && !seat.is_held && toggleSeat(seat)}
      disabled={Boolean(seat.is_booked || seat.is_held)}
      activeOpacity={0.75}
    >
      <Text style={[styles.seatText, { color: getSeatTextColor(seat) }]}>
        {seat.seat_number}
      </Text>
      {/* Only show ★ star on VIP buses */}
      {isVipBus && !seat.is_booked && !seat.is_held && (
        <Text style={styles.vipStar}>★</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('booking.title')}</Text>
          {/* Bus class badge */}
          <View style={[styles.classBadge, isVipBus ? styles.classBadgeVip : styles.classBadgeStd]}>
            <Text style={styles.classBadgeText}>
              {isVipBus ? '⭐ VIP' : '🚌 Standard'}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {t('booking.subtitle')} · {flatPrice.toLocaleString()} XAF / seat
        </Text>
        {/* Legend */}
        <View style={styles.legend}>
          {legendItems.map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.seatArea} contentContainerStyle={styles.seatContent} showsVerticalScrollIndicator={false}>
        {/* Bus front indicator */}
        <View style={styles.busFront}>
          <Text style={styles.busFrontText}>🚌 FRONT</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} size="large" />
        ) : (() => {
          const allRows = Object.entries(rows).sort((a, b) => Number(a[0]) - Number(b[0]));

          return (
            <>
              {/* ── Driver row ── */}
              <View style={styles.driverRow}>
                <Text style={styles.rowNum}></Text>
                <View style={[styles.seatPair, { flex: 1 }]}>
                  <View style={[styles.seat, { backgroundColor: theme.muted, opacity: 0.4 }]}>
                    <Text style={styles.seatText}>DRV</Text>
                  </View>
                </View>
                <View style={styles.aisle} />
                <View style={styles.seatPair}>
                  {rows[0] ? rows[0].sort((a: any, b: any) => Number(a.seat_number) - Number(b.seat_number)).map((seat: any) => renderSeat(seat)) : null}
                </View>
              </View>

              {allRows.map(([rowNum, rowSeats]) => {
                const sorted = [...(rowSeats as any[])].sort((a, b) => Number(a.seat_number) - Number(b.seat_number));
                const rn     = Number(rowNum);

                if (rn === 0) return null; // handled in driverRow

                // Determine the maximum row dynamically so we know when to render a full back row
                const maxRow = Math.max(...allRows.map(r => Number(r[0])));

                const isDoorRow = rn === 4 || rn === 12;
                const isBackRow = rn === maxRow;

                if (isBackRow) {
                  return (
                    <View key={rowNum} style={styles.seatRow}>
                      <Text style={styles.rowNum}>{rowNum}</Text>
                      <View style={[styles.seatPair, { flex: 1, justifyContent: 'center', gap: 6 }]}>
                        {sorted.map(seat => renderSeat(seat))}
                      </View>
                    </View>
                  );
                }

                // Dynamic left/right split based on bus type
                let leftCount = 3; // default Standard (3 left, 2 right)
                if (isVipBus) {
                  leftCount = 1; // VIP (1 left, 2 right)
                } else if (data?.bus_type === 'Coaster' || data?.bus_type === 'Minibus' || selectedSchedule?.bus_type === 'Coaster' || selectedSchedule?.bus_type === 'Minibus') {
                  leftCount = 2; // Coaster (2 left, 2 right)
                }

                // If it's a door row, put all available seats on the left so the right side shows the door
                if (isDoorRow) {
                  leftCount = sorted.length;
                }

                // Failsafe: if the backend generated a legacy 5-seat layout for a VIP bus, 
                // adjust leftCount so we don't accidentally drop seats.
                if (!isDoorRow && sorted.length > leftCount + 2) {
                  leftCount = sorted.length - 2;
                }

                const leftSeats  = sorted.slice(0, leftCount);
                const rightSeats = sorted.slice(leftCount);

                return (
                  <View key={rowNum} style={styles.seatRow}>
                    <Text style={styles.rowNum}>{rowNum}</Text>
                    <View style={styles.seatPair}>
                      {leftSeats.map(seat => renderSeat(seat))}
                    </View>
                    <View style={styles.aisle} />
                    <View style={[styles.seatPair, { width: SEAT_SIZE * 0.9 * 2 + 6, justifyContent: 'center' }]}>
                      {rightSeats.length > 0 ? (
                        rightSeats.map(seat => renderSeat(seat))
                      ) : isDoorRow ? (
                        <View style={styles.doorIndicator}>
                          <Text style={styles.doorText}>DOOR</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </>
          );
        })()}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.selectedInfo}>
              💺 {selectedSeats.map(s => s.seat_number).join(', ')}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.totalPrice}>{totalPrice.toLocaleString()} XAF</Text>
              {isVipBus && <Text style={styles.vipLabel}>VIP</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(main)/booking/summary')} activeOpacity={0.85}>
            <LinearGradient colors={theme.gradientPrimary} style={styles.continueBtnInner}>
              <Text style={styles.continueBtnText}>{t('booking.continue')} →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: theme.background },
  header:           { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn:          { marginBottom: 10 },
  backText:         { fontSize: 26, color: '#fff' },
  titleRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  title:            { fontSize: 22, fontWeight: '800', color: '#fff' },
  classBadge:       { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  classBadgeVip:    { backgroundColor: '#FCD116' },
  classBadgeStd:    { backgroundColor: 'rgba(255,255,255,0.2)' },
  classBadgeText:   { fontSize: 11, fontWeight: '800', color: '#1A1A1A' },
  subtitle:         { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  legend:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:        { width: 14, height: 14, borderRadius: 4 },
  legendText:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  seatArea:         { flex: 1 },
  seatContent:      { paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 0, alignItems: 'center' },
  busFront:         { width: '90%', height: 36, backgroundColor: '#1A1F36', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  busFrontText:     { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  driverRow:        { flexDirection: 'row', alignItems: 'center', width: '90%', marginBottom: 12, paddingRight: 4 },
  seatRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '90%', gap: 4 },
  rowNum:           { width: 20, fontSize: 11, color: theme.muted, textAlign: 'center' },
  seatPair:         { flexDirection: 'row', gap: 6 },
  aisle:            { flex: 1 },
  doorIndicator:    { width: SEAT_SIZE * 1.8, height: SEAT_SIZE * 0.85, borderRadius: 8, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card },
  doorText:         { fontSize: 10, fontWeight: '700', color: theme.muted, letterSpacing: 1 },
  seat:             { width: SEAT_SIZE * 0.9, height: SEAT_SIZE * 0.9, borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  seatText:         { fontSize: 10, fontWeight: '700' },
  vipStar:          { position: 'absolute', top: 1, right: 2, fontSize: 8, color: '#FCD116' },
  bottomBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 34, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  selectedInfo:     { fontSize: 14, fontWeight: '700', color: theme.text },
  priceRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalPrice:       { fontSize: 22, fontWeight: '800', color: theme.primary },
  vipLabel:         { backgroundColor: '#FCD116', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 11, fontWeight: '800', color: '#1A1A1A' },
  continueBtn:      { borderRadius: 14, overflow: 'hidden' },
  continueBtnInner: { paddingHorizontal: 28, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  continueBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
