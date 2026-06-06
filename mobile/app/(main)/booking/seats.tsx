import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

const { width } = Dimensions.get('window');

// ── Static layout constants (bus-type-independent) ─────────────────────────
const SEAT_SIZE = 40;   // px — each seat square
const SEAT_GAP  = 6;    // px — gap between seats in a group
const AISLE_W   = 28;   // px — fixed aisle between left & right sections
const H_PAD     = 16;   // px — horizontal padding inside bus body
// RIGHT section is always 2 seats wide
const RIGHT_W   = SEAT_SIZE * 2 + SEAT_GAP;  // 86 px
// LEFT_W, BUS_CONTENT_W, BUS_BODY_W are computed inside the component
// because they depend on bus type (VIP=1 seat, Coaster=2, Standard=3)

export default function SeatsScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { selectedSchedule, selectedSeats, toggleSeat } = useBookingStore();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);

  const { data, isLoading } = useQuery({
    queryKey: ['seats', selectedSchedule?.id],
    queryFn: () =>
      scheduleService.getSeats(selectedSchedule.id).then(r => r.data?.data ?? null),
    enabled: !!selectedSchedule?.id,
    refetchInterval: 15000,
  });

  const seats: any[] = data?.seats ?? [];

  // ── Layout helpers ────────────────────────────────────────────────────────
  const isDoorRowNum = (r: number) => r === 4 || r === 12;
  const getLeftCount = (rowSeats: any[], isDoor: boolean): number =>
    isDoor
      ? rowSeats.length                       // door row  → all go left
      : Math.max(0, rowSeats.length - 2);     // normal    → all except the 2 right seats

  // ── Bus type flags ────────────────────────────────────────────────────────
  const busType = data?.bus_type ?? selectedSchedule?.bus_type ?? '';
  const isVipBus =
    data?.company_class === 'vip' ||
    ['VIP', 'Luxury'].includes(busType);

  // ── Price ─────────────────────────────────────────────────────────────────
  const flatPrice: number = (() => {
    if (data?.flat_price) return Number(data.flat_price);
    if (!selectedSchedule) return 0;
    return isVipBus
      ? Number(selectedSchedule.price_vip)
      : Number(selectedSchedule.price_standard);
  })();
  const totalPrice = selectedSeats.length * flatPrice;

  // ── Group seats by row ────────────────────────────────────────────────────
  const rowMap = seats.reduce((acc: Record<number, any[]>, s) => {
    if (!acc[s.row_number]) acc[s.row_number] = [];
    acc[s.row_number].push(s);
    return acc;
  }, {});

  const allRowNums = Object.keys(rowMap).map(Number).sort((a, b) => a - b);
  const maxRow     = allRowNums.length ? Math.max(...allRowNums) : 0;

  // ── Dynamic widths (computed AFTER rowMap) ────────────────────────────────
  const maxLeftCount: number = allRowNums
    .filter(r => r !== 0 && r !== maxRow)
    .reduce((mx, r) => Math.max(mx, getLeftCount(rowMap[r] ?? [], isDoorRowNum(r))), 1);

  const LEFT_W        = SEAT_SIZE * maxLeftCount + SEAT_GAP * Math.max(0, maxLeftCount - 1);
  const BUS_CONTENT_W = LEFT_W + AISLE_W + RIGHT_W;
  const BUS_BODY_W    = BUS_CONTENT_W + H_PAD * 2;

  // ── Seat colours ──────────────────────────────────────────────────────────
  const getSeatBg = (seat: any) => {
    if (seat.is_booked || seat.is_held)            return theme.seatOccupied  ?? '#E74C3C';
    if (selectedSeats.find(s => s.id === seat.id)) return theme.seatSelected  ?? '#F1C40F';
    if (isVipBus)                                  return theme.seatVip       ?? theme.primary;
    return theme.seatAvailable ?? '#6CB4E4';
  };
  const getSeatFg = (seat: any) =>
    selectedSeats.find(s => s.id === seat.id) ? '#1A1A1A' : '#fff';

  // ── Render a single seat ──────────────────────────────────────────────────
  const renderSeat = (seat: any) => (
    <TouchableOpacity
      key={seat.id}
      style={[styles.seat, { backgroundColor: getSeatBg(seat) }]}
      onPress={() => !seat.is_booked && !seat.is_held && toggleSeat(seat)}
      disabled={Boolean(seat.is_booked || seat.is_held)}
      activeOpacity={0.75}
    >
      <Text style={[styles.seatText, { color: getSeatFg(seat) }]}>
        {seat.seat_number}
      </Text>
      {isVipBus && !seat.is_booked && !seat.is_held && (
        <Text style={styles.vipStar}>★</Text>
      )}
    </TouchableOpacity>
  );

  // ── Render door placeholder ───────────────────────────────────────────────
  const renderDoor = () => (
    <View style={styles.doorBox}>
      <Text style={styles.doorText}>Door</Text>
    </View>
  );

  // ── Legend ────────────────────────────────────────────────────────────────
  const legendItems = [
    {
      color: isVipBus ? (theme.seatVip ?? theme.primary) : (theme.seatAvailable ?? '#6CB4E4'),
      label: t('booking.legend_available'),
    },
    { color: theme.seatOccupied ?? '#E74C3C', label: t('booking.legend_occupied') },
    { color: theme.seatSelected ?? '#F1C40F', label: t('booking.legend_selected') },
  ];

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('booking.title')}</Text>
          <View style={[styles.classBadge, isVipBus ? styles.classBadgeVip : styles.classBadgeStd]}>
            <Text style={styles.classBadgeText}>
              {isVipBus ? '⭐ VIP' : '🚌 Standard'}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {t('booking.subtitle')} · {flatPrice.toLocaleString()} XAF / seat
        </Text>
        <View style={styles.legend}>
          {legendItems.map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Seat map */}
      <ScrollView
        style={styles.seatArea}
        contentContainerStyle={styles.seatContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} size="large" />
        ) : (
          <View style={[styles.busBody, { width: BUS_BODY_W }]}>

            {/* ══ DRIVER ROW ══════════════════════════════════════════════
                [Driver]  ←── flex spacer ──→  [1]  [2]
            ═══════════════════════════════════════════════════════════════ */}
            <View style={[styles.driverRow, { width: BUS_CONTENT_W }]}>
              {/* Driver seat — fixed left */}
              <View style={[styles.seat, styles.driverSeat]}>
                <Text style={[styles.seatText, { color: '#fff', fontSize: 9 }]}>Driver</Text>
              </View>

              {/* Flexible gap pushes row-0 seats to the right */}
              <View style={{ flex: 1 }} />

              {/* Row-0 passenger seats (1 & 2) — fixed right */}
              <View style={styles.rowGroup}>
                {(rowMap[0] ?? [])
                  .sort((a: any, b: any) => Number(a.seat_number) - Number(b.seat_number))
                  .map((seat: any) => renderSeat(seat))}
              </View>
            </View>

            {/* ── Horizontal rule below driver ── */}
            <View style={styles.divider} />

            {/* ══ REGULAR / DOOR / REAR ROWS ══════════════════════════════ */}
            {allRowNums
              .filter(r => r !== 0)
              .map(rn => {
                const sorted = [...(rowMap[rn] ?? [])].sort(
                  (a, b) => Number(a.seat_number) - Number(b.seat_number)
                );

                /* ── REAR ROW: all seats centred in one strip ── */
                if (rn === maxRow) {
                  return (
                    <View key={rn}>
                      <View style={styles.rearLabel}>
                        <Text style={styles.rearLabelText}>rear row</Text>
                      </View>
                      <View style={styles.rearRow}>
                        {sorted.map(seat => renderSeat(seat))}
                      </View>
                    </View>
                  );
                }

                /* ── DOOR ROW: all seats on left, Door on right ── */
                const isDoorRow = isDoorRowNum(rn);

                if (isDoorRow) {
                  const dLeft = sorted;   // all seats go on left for door rows
                  return (
                    <View key={rn} style={[styles.seatRow, { width: BUS_CONTENT_W }]}>
                      <View style={[styles.leftSection, { width: LEFT_W }]}>
                        <View style={styles.rowGroup}>
                          {dLeft.map(seat => renderSeat(seat))}
                        </View>
                      </View>
                      <View style={styles.aisleSpacer} />
                      <View style={styles.rightSection}>
                        {renderDoor()}
                      </View>
                    </View>
                  );
                }

                /* ── NORMAL ROW: (n-2) seats on left, 2 seats on right ── */
                const leftCount  = getLeftCount(sorted, false);
                const leftSeats  = sorted.slice(0, leftCount);
                const rightSeats = sorted.slice(leftCount);

                return (
                  <View key={rn} style={[styles.seatRow, { width: BUS_CONTENT_W }]}>
                    <View style={[styles.leftSection, { width: LEFT_W }]}>
                      <View style={styles.rowGroup}>
                        {leftSeats.map(seat => renderSeat(seat))}
                      </View>
                    </View>
                    <View style={styles.aisleSpacer} />
                    <View style={styles.rightSection}>
                      <View style={styles.rowGroup}>
                        {rightSeats.map(seat => renderSeat(seat))}
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom confirm bar */}
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
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push('/(main)/booking/summary')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={theme.gradientPrimary} style={styles.continueBtnInner}>
              <Text style={styles.continueBtnText}>{t('booking.continue')} →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (theme: any) =>
  StyleSheet.create({
    container:      { flex: 1, backgroundColor: theme.background },

    /* ── Header ── */
    header:         { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
    backBtn:        { marginBottom: 10 },
    backText:       { fontSize: 26, color: '#fff' },
    titleRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    title:          { fontSize: 22, fontWeight: '800', color: '#fff' },
    classBadge:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    classBadgeVip:  { backgroundColor: '#FCD116' },
    classBadgeStd:  { backgroundColor: 'rgba(255,255,255,0.2)' },
    classBadgeText: { fontSize: 11, fontWeight: '800', color: '#1A1A1A' },
    subtitle:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
    legend:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot:      { width: 14, height: 14, borderRadius: 4 },
    legendText:     { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

    /* ── Scroll area ── */
    seatArea:       { flex: 1 },
    seatContent:    { alignItems: 'center', paddingTop: 20, paddingBottom: 20 },

    /* ── Bus body card ── */
    busBody: {
      // width is set inline (BUS_BODY_W, computed dynamically)
      backgroundColor: theme.card ?? '#F0F4FF',
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: H_PAD,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },

    /* ── Driver row ── */
    driverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      // width set inline (BUS_CONTENT_W)
      marginBottom: 6,
    },
    driverSeat: {
      backgroundColor: '#1A4080',
      width: SEAT_SIZE + 14,        // slightly wider to fit "Driver" label
      paddingHorizontal: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border ?? '#D0D8E8',
      marginVertical: 8,
    },

    /* ── Regular rows ── */
    seatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      // width set inline (BUS_CONTENT_W, dynamic per bus type)
      marginBottom: SEAT_GAP,
    },

    /* Fixed-width left section — width set inline (LEFT_W, dynamic per bus type) */
    leftSection: {
      // width set inline
      flexDirection: 'row',
      alignItems: 'center',
    },

    /* Fixed-width aisle gap */
    aisleSpacer: {
      width: AISLE_W,               // 28 px
    },

    /* Fixed-width right section — always holds 2 seats */
    rightSection: {
      width: RIGHT_W,               // 86 px  (2 × 40 + 1 × 6)
      flexDirection: 'row',
      alignItems: 'center',
    },

    /* Inline horizontal group of seats */
    rowGroup: {
      flexDirection: 'row',
      gap: SEAT_GAP,
    },

    /* ── Individual seat ── */
    seat: {
      width: SEAT_SIZE,
      height: SEAT_SIZE,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seatText:  { fontSize: 11, fontWeight: '700' },
    vipStar:   { position: 'absolute', top: 2, right: 3, fontSize: 8, color: '#FCD116' },

    /* ── Door placeholder ── */
    doorBox: {
      width: RIGHT_W,               // same width as 2-seat right section
      height: SEAT_SIZE,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.border ?? '#B0BDD0',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background ?? '#F8FAFF',
    },
    doorText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.muted ?? '#8899AA',
      letterSpacing: 0.5,
    },

    /* ── Rear (last) row ── */
    rearLabel: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 4,
    },
    rearLabelText: {
      fontSize: 11,
      color: theme.muted ?? '#8899AA',
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    rearRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: SEAT_GAP,
    },

    /* ── Bottom confirm bar ── */
    bottomBar: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      backgroundColor: theme.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 34,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 20,
    },
    selectedInfo:    { fontSize: 14, fontWeight: '700', color: theme.text },
    priceRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
    totalPrice:      { fontSize: 22, fontWeight: '800', color: theme.primary },
    vipLabel: {
      backgroundColor: '#FCD116',
      paddingHorizontal: 8, paddingVertical: 2,
      borderRadius: 10, fontSize: 11, fontWeight: '800', color: '#1A1A1A',
    },
    continueBtn:      { borderRadius: 14, overflow: 'hidden' },
    continueBtnInner: { paddingHorizontal: 28, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    continueBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
