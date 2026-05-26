import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

const { width } = Dimensions.get('window');
const SEAT_SIZE = (width - 80) / 5;

export default function SeatsScreen() {
  const { t }      = useTranslation();
  const router     = useRouter();
  const { selectedSchedule, selectedSeats, toggleSeat } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const { data, isLoading } = useQuery({
    queryKey: ['seats', selectedSchedule?.id],
    queryFn: () => scheduleService.getSeats(selectedSchedule.id).then(r => r.data.data),
    enabled: !!selectedSchedule?.id,
    refetchInterval: 15000, // Poll every 15s for realtime updates
  });

  const seats: any[] = data?.seats ?? [];
  const rows = seats.reduce((acc: Record<number, any[]>, s) => {
    if (!acc[s.row_number]) acc[s.row_number] = [];
    acc[s.row_number].push(s);
    return acc;
  }, {});

  const getSeatColor = (seat: any) => {
    if (seat.is_booked || seat.is_held) return theme.seatOccupied ?? theme.danger;
    if (selectedSeats.find(s => s.id === seat.id)) return theme.seatSelected ?? theme.accent;
    if (seat.seat_type === 'vip') return theme.seatVip ?? theme.primary;
    return theme.seatAvailable ?? theme.success;
  };

  const getSeatTextColor = (seat: any) => {
    if (selectedSeats.find(s => s.id === seat.id)) return '#1A1A1A';
    return '#fff';
  };

  const totalPrice = selectedSchedule
    ? selectedSeats.length * Number(
        selectedSchedule.bus_type === 'VIP'    ? selectedSchedule.price_vip :
        selectedSchedule.bus_type === 'Luxury' ? (selectedSchedule.price_luxury ?? selectedSchedule.price_vip) :
        selectedSchedule.price_standard
      )
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#007A33','#005522']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('booking.title')}</Text>
        <Text style={styles.subtitle}>{t('booking.subtitle')}</Text>
        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: theme.seatAvailable ?? theme.success, label: t('booking.legend_available') },
            { color: theme.seatOccupied ?? theme.danger,  label: t('booking.legend_occupied') },
            { color: theme.seatSelected ?? theme.accent,  label: t('booking.legend_selected') },
            { color: theme.seatVip ?? theme.primary,       label: t('booking.legend_vip') },
          ].map(({ color, label }) => (
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

        {/* Driver seat */}
        <View style={styles.driverRow}>
          <View style={[styles.seat, { backgroundColor: theme.muted, opacity: 0.4 }]}>
            <Text style={styles.seatText}>D</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} size="large" />
        ) : (
          Object.entries(rows).map(([rowNum, rowSeats]) => (
            <View key={rowNum} style={styles.seatRow}>
              <Text style={styles.rowNum}>{rowNum}</Text>
              {/* Left pair (A, B) */}
              <View style={styles.seatPair}>
                {rowSeats.filter(s => ['A','B'].includes(s.seat_number.slice(-1))).map(seat => (
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
                    {seat.seat_type === 'vip' && (
                      <Text style={styles.vipStar}>★</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {/* Aisle */}
              <View style={styles.aisle} />
              {/* Right pair (C, D) */}
              <View style={styles.seatPair}>
                {rowSeats.filter(s => ['C','D'].includes(s.seat_number.slice(-1))).map(seat => (
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
                    {seat.seat_type === 'vip' && (
                      <Text style={styles.vipStar}>★</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.selectedInfo}>
              💺 {selectedSeats.map(s => s.seat_number).join(', ')}
            </Text>
            <Text style={styles.totalPrice}>
              {totalPrice.toLocaleString()} XAF
            </Text>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(main)/booking/summary')} activeOpacity={0.85}>
            <LinearGradient colors={['#007A33','#00A344']} style={styles.continueBtnInner}>
              <Text style={styles.continueBtnText}>{t('booking.continue')} →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: theme.background },
  header:         { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn:        { marginBottom: 10 },
  backText:       { fontSize: 26, color: '#fff' },
  title:          { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitle:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 14 },
  legend:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 14, height: 14, borderRadius: 4 },
  legendText:     { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  seatArea:       { flex: 1 },
  seatContent:    { padding: 20, alignItems: 'center' },
  busFront:       { width: '80%', height: 36, backgroundColor: '#1A1F36', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  busFrontText:   { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  driverRow:      { flexDirection: 'row', justifyContent: 'flex-end', width: '80%', marginBottom: 8 },
  seatRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '80%', gap: 4 },
  rowNum:         { width: 20, fontSize: 11, color: theme.muted, textAlign: 'center' },
  seatPair:       { flexDirection: 'row', gap: 6 },
  aisle:          { flex: 1 },
  seat:           { width: SEAT_SIZE * 0.85, height: SEAT_SIZE * 0.85, borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  seatText:       { fontSize: 10, fontWeight: '700' },
  vipStar:        { position: 'absolute', top: 1, right: 2, fontSize: 8, color: '#FCD116' },
  bottomBar:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 34, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  selectedInfo:   { fontSize: 14, fontWeight: '700', color: theme.text },
  totalPrice:     { fontSize: 22, fontWeight: '800', color: theme.primary },
  continueBtn:    { borderRadius: 14, overflow: 'hidden' },
  continueBtnInner: { paddingHorizontal: 28, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  continueBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
