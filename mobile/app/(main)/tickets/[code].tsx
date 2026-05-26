import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { bookingService } from '../../../services/endpoints';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function TicketDetailScreen() {
  const { code }  = useLocalSearchParams<{ code: string }>();
  const { t }     = useTranslation();
  const router    = useRouter();
  const theme     = useThemeColor();
  const styles    = getStyles(theme);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-detail', code],
    queryFn:  () => bookingService.getByRef(code!).then(r => r.data.data),
    enabled:  !!code,
  });

  if (isLoading || !booking) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 48 }}>🎫</Text>
        <Text style={{ color: theme.muted, fontSize: 16, marginTop: 12 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  const ticket  = booking.tickets?.[0];
  const seat    = booking.seats?.[0];
  const payment = booking.payment;
  const isValid = booking.status === 'confirmed' && payment?.status === 'approved';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My CamerBus ticket: ${booking.booking_ref}\nRoute: ${booking.origin_city} → ${booking.dest_city}\nDate: ${booking.travel_date} at ${booking.departure_time?.slice(0,5)}\nSeat: ${seat?.seat_number}`,
      });
    } catch {}
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ticket.title')}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isValid ? theme.success + '20' : theme.danger + '20' }]}>
          <Text style={[styles.statusText, { color: isValid ? theme.success : theme.danger }]}>
            {isValid ? '✅ ' + t('ticket.status_valid') : booking.status.toUpperCase()}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* QR Code Card */}
        {isValid && ticket ? (
          <View style={styles.qrCard}>
            <View style={styles.qrInstructions}>
              <Text style={styles.qrInstructionsText}>{t('ticket.qr_instruction')}</Text>
            </View>
            <View style={styles.qrWrap}>
              <QRCode
                value={ticket.ticket_code}
                size={220}
                color="#1A1F36"
                backgroundColor="#fff"
                logo={undefined}
              />
            </View>
            <Text style={styles.ticketCode}>{ticket.ticket_code}</Text>
            {/* Dotted separator */}
            <View style={styles.dottedLine} />
          </View>
        ) : (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingIcon}>⏳</Text>
            <Text style={styles.pendingText}>
              {payment?.status === 'pending' ? t('payment.pending_title') : 'Ticket not yet generated'}
            </Text>
          </View>
        )}

        {/* Journey Details */}
        <View style={styles.detailCard}>
          <View style={styles.routeRow}>
            <View>
              <Text style={styles.city}>{booking.origin_city}</Text>
              <Text style={styles.branch}>{booking.origin_branch}</Text>
            </View>
            <View style={styles.routeMid}>
              <Text style={styles.time}>{booking.departure_time?.slice(0,5)}</Text>
              <Text style={styles.arrow}>✈️</Text>
              <Text style={styles.date}>{booking.travel_date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.city}>{booking.dest_city}</Text>
              <Text style={styles.branch}>{booking.dest_branch}</Text>
            </View>
          </View>
        </View>

        {/* Ticket Info */}
        <View style={styles.infoCard}>
          <Row label={t('ticket.passenger')}  value={booking.passenger_name ?? '—'} />
          <Row label={t('ticket.company')}    value={booking.company_name} />
          <Row label={t('ticket.bus')}        value={`${booking.bus_type} · ${booking.plate_number}`} />
          <Row label={t('ticket.seat')}       value={seat?.seat_number ?? '—'} />
          <Row label={t('ticket.date')}       value={booking.travel_date} />
          <Row label={t('ticket.time')}       value={booking.departure_time?.slice(0,5) ?? '—'} />
          <Row label={t('booking.booking_ref')} value={booking.booking_ref} />
        </View>

        {/* Share */}
        {isValid && (
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={styles.shareBtnText}>📤 Share Ticket</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: theme.background },
  loading:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  header:          { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
  backBtn:         { marginBottom: 8 },
  backText:        { fontSize: 26, color: '#fff' },
  headerTitle:     { fontSize: 24, fontWeight: '800', color: '#fff' },
  statusBadge:     { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusText:      { fontSize: 13, fontWeight: '800' },
  scroll:          { padding: 16, gap: 14, paddingBottom: 100 },
  qrCard:          { backgroundColor: theme.card, borderRadius: 24, overflow: 'hidden', shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:20, elevation:8 },
  qrInstructions:  { backgroundColor: theme.primary, padding: 14 },
  qrInstructionsText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  qrWrap:          { alignItems: 'center', padding: 28 },
  ticketCode:      { textAlign: 'center', fontSize: 16, fontWeight: '800', color: theme.text, letterSpacing: 3, paddingBottom: 20 },
  dottedLine:      { borderTopWidth: 2, borderStyle: 'dashed', borderColor: theme.border, marginHorizontal: 20, marginBottom: 16 },
  pendingCard:     { backgroundColor: theme.card, borderRadius: 20, padding: 32, alignItems: 'center', gap: 12, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  pendingIcon:     { fontSize: 52 },
  pendingText:     { fontSize: 16, color: theme.muted, textAlign: 'center', fontWeight: '600' },
  detailCard:      { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  routeRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  city:            { fontSize: 18, fontWeight: '800', color: theme.text },
  branch:          { fontSize: 11, color: theme.muted, marginTop: 3 },
  routeMid:        { alignItems: 'center', gap: 4 },
  time:            { fontSize: 16, fontWeight: '700', color: theme.primary },
  arrow:           { fontSize: 22 },
  date:            { fontSize: 12, color: theme.muted },
  infoCard:        { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  row:             { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  rowLabel:        { fontSize: 13, color: theme.muted, fontWeight: '500' },
  rowValue:        { fontSize: 13, fontWeight: '700', color: theme.text, textAlign: 'right', flex: 1, marginLeft: 12 },
  shareBtn:        { backgroundColor: theme.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: theme.primary },
  shareBtnText:    { fontSize: 16, fontWeight: '700', color: theme.primary },
});
