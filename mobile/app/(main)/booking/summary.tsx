import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { bookingService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';

export default function BookingSummaryScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { user } = useAuthStore();
  const { selectedSchedule, selectedSeats, fromCity, toCity, travelDate, setBookingRef } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const pricePerSeat = selectedSchedule
    ? Number(selectedSchedule.bus_type === 'VIP' ? selectedSchedule.price_vip :
      selectedSchedule.bus_type === 'Luxury' ? (selectedSchedule.price_luxury ?? selectedSchedule.price_vip) :
      selectedSchedule.price_standard)
    : 0;
  const total = pricePerSeat * selectedSeats.length;
  // Strip shift suffix (e.g. '2026-05-27Tnight' -> '2026-05-27')
  const displayDate = travelDate?.length > 10 ? travelDate.slice(0, 10) : travelDate;

  const { mutate: confirmBooking, isPending } = useMutation({
   mutationFn: () => bookingService.create({
  schedule_id: selectedSchedule?.id,
  seat_ids: selectedSeats.map(s => s.id),
  payment_method: 'mtn_momo',
  passengers: selectedSeats.map(() => ({ name: user?.full_name ?? '' })),
}),
    onSuccess: (res) => {
      const { booking, payment } = res.data.data;
      setBookingRef(booking.booking_ref, payment.id);
      router.push('/(main)/payment/method');
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? t('errors.server') });
    },
  });

  const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { color: theme.primary, fontSize: 18, fontWeight: '800' }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('booking.summary_title')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Journey Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗺️ Journey Details</Text>
          <View style={styles.journeyVisual}>
            <View style={styles.journeyCity}>
              <Text style={styles.journeyCityName}>{fromCity?.name}</Text>
              <Text style={styles.journeyBranch}>{selectedSchedule?.origin_branch}</Text>
            </View>
            <View style={styles.journeyMiddle}>
              <Text style={styles.journeyTime}>{selectedSchedule?.departure_time?.slice(0,5)}</Text>
              <View style={styles.journeyLine}><View style={styles.journeyBus}><Text>🚌</Text></View></View>
              <Text style={styles.journeyDuration}>
                {selectedSchedule?.estimated_duration_minutes
                  ? `${Math.floor(selectedSchedule.estimated_duration_minutes/60)}h${selectedSchedule.estimated_duration_minutes%60 > 0 ? selectedSchedule.estimated_duration_minutes%60+'m' : ''}`
                  : ''}
              </Text>
            </View>
            <View style={[styles.journeyCity, { alignItems: 'flex-end' }]}>
              <Text style={styles.journeyCityName}>{toCity?.name}</Text>
              <Text style={styles.journeyBranch}>{selectedSchedule?.dest_branch}</Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Trip Information</Text>
          <Row label={t('booking.travel_date')}    value={displayDate} />
          <Row label={t('booking.departure_time')} value={selectedSchedule?.departure_time?.slice(0,5) ?? '--'} />
          <Row label="Company"                     value={selectedSchedule?.company_name ?? ''} />
          <Row label="Bus Type"                    value={selectedSchedule?.bus_type ?? ''} />
          <Row label="Plate No."                   value={selectedSchedule?.plate_number ?? ''} />
          {/* Bus Signature — most important for finding the bus at the park */}
          <View style={styles.sigRow}>
            <Text style={styles.sigRowLabel}>🏷️ Your Bus ID</Text>
            <View style={styles.sigBox}>
              <Text style={styles.sigBoxText}>{selectedSchedule?.bus_signature ?? selectedSchedule?.plate_number ?? '--'}</Text>
            </View>
          </View>
          <Text style={styles.sigHint}>Show this ID at the park to find your bus</Text>
        </View>

        {/* Seats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💺 Selected Seats</Text>
          <View style={styles.seatsWrap}>
            {selectedSeats.map(s => (
              <View key={s.id} style={[styles.seatChip, s.seat_type === 'vip' && styles.vipChip]}>
                <Text style={[styles.seatChipText, s.seat_type === 'vip' && styles.vipChipText]}>
                  {s.seat_number} {s.seat_type === 'vip' ? '★' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Price Breakdown</Text>
          <Row label={t('booking.price_per_seat')} value={`${pricePerSeat.toLocaleString()} XAF`} />
          <Row label="Seats"                        value={String(selectedSeats.length)} />
          <View style={styles.divider} />
          <Row label={t('booking.total')}           value={`${total.toLocaleString()} XAF`} bold />
        </View>

        {/* Passenger */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Passenger</Text>
          <Row label="Name"  value={user?.full_name ?? ''} />
          <Row label="Phone" value={user?.phone ?? ''} />
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{t('booking.total')}</Text>
          <Text style={styles.footerTotal}>{total.toLocaleString()} XAF</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, isPending && { opacity: 0.7 }]}
          onPress={() => {
            if (!user) {
              Toast.show({ type: 'info', text1: 'Login Required', text2: 'Please login to confirm your booking.' });
              router.push('/(auth)/login');
              return;
            }
            confirmBooking();
          }}
          disabled={Boolean(isPending)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={theme.gradientPrimary} style={styles.confirmBtnInner}>
            <Text style={styles.confirmBtnText}>
              {isPending ? t('common.loading') : t('booking.confirm_booking')} →
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: theme.background },
  header:           { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn:          { marginBottom: 12 },
  backText:         { fontSize: 26, color: '#fff' },
  title:            { fontSize: 24, fontWeight: '800', color: '#fff' },
  scroll:           { padding: 16, gap: 14, paddingBottom: 120 },
  card:             { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  cardTitle:        { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 16 },
  row:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  rowLabel:         { fontSize: 14, color: theme.textLight },
  rowValue:         { fontSize: 14, fontWeight: '600', color: theme.text },
  journeyVisual:    { flexDirection: 'row', alignItems: 'center' },
  journeyCity:      { flex: 1 },
  journeyCityName:  { fontSize: 18, fontWeight: '800', color: theme.text },
  journeyBranch:    { fontSize: 11, color: theme.muted, marginTop: 4 },
  journeyMiddle:    { flex: 1, alignItems: 'center' },
  journeyTime:      { fontSize: 13, fontWeight: '700', color: theme.primary },
  journeyLine:      { width: '100%', height: 2, backgroundColor: theme.border, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  journeyBus:       { backgroundColor: theme.card, padding: 2 },
  journeyDuration:  { fontSize: 11, color: theme.muted },
  seatsWrap:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seatChip:         { backgroundColor: theme.success + '15', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  vipChip:          { backgroundColor: theme.primary + '15' },
  seatChipText:     { fontSize: 14, fontWeight: '700', color: theme.primary },
  vipChipText:      { color: theme.primary },
  divider:          { height: 1, backgroundColor: theme.border, marginVertical: 8 },
  sigRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  sigRowLabel:      { fontSize: 14, color: theme.text, fontWeight: '600' },
  sigBox:           { backgroundColor: '#1A1F36', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  sigBoxText:       { fontSize: 18, fontWeight: '900', color: '#FCD116', letterSpacing: 2 },
  sigHint:          { fontSize: 11, color: theme.muted, marginTop: 8, fontStyle: 'italic', textAlign: 'center' },
  footer:           { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 34, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.1, shadowRadius:12, elevation:20 },
  footerLabel:      { fontSize: 12, color: theme.muted },
  footerTotal:      { fontSize: 24, fontWeight: '800', color: theme.primary },
  confirmBtn:       { borderRadius: 16, overflow: 'hidden' },
  confirmBtnInner:  { paddingHorizontal: 28, paddingVertical: 16 },
  confirmBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});