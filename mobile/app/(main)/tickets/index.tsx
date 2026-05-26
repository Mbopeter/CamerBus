import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/endpoints';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

const getStatusColor = (theme: any, status: string) => {
  return {
    confirmed: theme.success,
    pending:   theme.warning,
    cancelled: theme.danger,
    completed: theme.primary,
  }[status] || theme.muted;
};

export default function TicketsScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { user } = useAuthStore();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn:  () => bookingService.getByUser(user!.id).then(r => r.data.data),
    enabled:  !!user,
  });

  const bookings: any[] = data ?? [];

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <Text style={styles.title}>{t('ticket.my_tickets')}</Text>
        <Text style={styles.subtitle}>Your travel bookings</Text>
      </LinearGradient>

      <FlatList
        data={bookings}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}
        renderItem={({ item: bk }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => router.push(`/(main)/tickets/${bk.booking_ref}` as any)} activeOpacity={0.85}>
            {/* Status badge */}
            <View style={styles.cardTop}>
              <Text style={styles.refText}>{bk.booking_ref}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(theme, bk.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(theme, bk.status) }]}>
                  {bk.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Route */}
            <View style={styles.routeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.city}>{bk.origin_city}</Text>
                <Text style={styles.branch}>{bk.origin_branch}</Text>
              </View>
              <View style={styles.routeArrowWrap}>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.travelDate}>{bk.travel_date}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.city}>{bk.dest_city}</Text>
                <Text style={styles.branch}>{bk.dest_branch}</Text>
              </View>
            </View>

            {/* Meta */}
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>🚌 {bk.company_name}</Text>
              <Text style={styles.metaText}>⏰ {bk.departure_time?.slice(0,5)}</Text>
              <Text style={styles.metaText}>💰 {Number(bk.total_amount).toLocaleString()} XAF</Text>
            </View>

            {bk.status === 'confirmed' && (
              <View style={styles.qrHint}>
                <Text style={styles.qrHintText}>🎫 Tap to view QR Ticket</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🎫</Text>
            <Text style={styles.emptyTitle}>{t('ticket.no_tickets')}</Text>
            <Text style={styles.emptySub}>{t('ticket.no_tickets_subtitle')}</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={() => router.push('/(main)/home')}>
              <LinearGradient colors={theme.gradientPrimary} style={styles.bookBtnInner}>
                <Text style={styles.bookBtnText}>Book a Trip →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: theme.background },
  header:         { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  title:          { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle:       { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  list:           { padding: 16, gap: 14, paddingBottom: 100 },
  card:           { backgroundColor: theme.card, borderRadius: 20, padding: 18, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:12, elevation:5 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  refText:        { fontSize: 13, fontWeight: '700', color: theme.muted, letterSpacing: 1 },
  statusBadge:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusText:     { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  routeRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  city:           { fontSize: 17, fontWeight: '800', color: theme.text },
  branch:         { fontSize: 11, color: theme.muted, marginTop: 3 },
  routeArrowWrap: { flex: 1, alignItems: 'center' },
  routeArrow:     { fontSize: 20, color: theme.primary, fontWeight: '800' },
  travelDate:     { fontSize: 11, color: theme.muted, marginTop: 4 },
  cardMeta:       { flexDirection: 'row', gap: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border, flexWrap: 'wrap' },
  metaText:       { fontSize: 12, color: theme.textLight, fontWeight: '600' },
  qrHint:         { backgroundColor: theme.primary + '15', borderRadius: 10, padding: 10, marginTop: 10, alignItems: 'center' },
  qrHintText:     { fontSize: 13, color: theme.primary, fontWeight: '700' },
  empty:          { alignItems: 'center', marginTop: 80, gap: 14 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: theme.text },
  emptySub:       { fontSize: 14, color: theme.muted, textAlign: 'center' },
  bookBtn:        { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  bookBtnInner:   { paddingHorizontal: 32, paddingVertical: 14 },
  bookBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});
