import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/endpoints';
import { useAuthStore } from '../../../store/useAuthStore';
import { getCompanyLogo } from '../../../utils/companyLogos';
import { Image } from 'react-native';
import { ArrowRight, Clock, Wallet, Ticket as TicketIcon } from 'lucide-react-native';
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

  const renderTicketItem = useCallback(({ item: bk }: { item: any }) => (
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
          <ArrowRight size={20} color={theme.primary} />
          <Text style={styles.travelDate}>{bk.travel_date}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.city}>{bk.dest_city}</Text>
          <Text style={styles.branch}>{bk.dest_branch}</Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.cardMeta}>
        <View style={styles.metaCompanyRow}>
          <Image source={getCompanyLogo(bk.company_name)} style={styles.companyLogo} resizeMode="contain" />
          <Text style={styles.metaText}>{bk.company_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Clock size={12} color={theme.textLight} />
          <Text style={styles.metaText}>{bk.departure_time?.slice(0,5)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Wallet size={12} color={theme.textLight} />
          <Text style={styles.metaText}>{Number(bk.total_amount).toLocaleString()} XAF</Text>
        </View>
      </View>

        <View style={styles.qrHint}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TicketIcon size={14} color={theme.primary} />
            <Text style={styles.qrHintText}>Tap to view QR Ticket</Text>
          </View>
          <ArrowRight size={14} color={theme.primary} />
        </View>
    </TouchableOpacity>
  ), [router, styles, theme]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <Text style={styles.title}>{t('ticket.my_tickets')}</Text>
        <Text style={styles.subtitle}>Your travel bookings</Text>
      </ImageBackground>

      <FlatList
        data={bookings}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}
        renderItem={renderTicketItem}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.empty}>
            <TicketIcon size={52} color={theme.muted} />
            <Text style={styles.emptyTitle}>{t('ticket.no_tickets')}</Text>
            <Text style={styles.emptySub}>{t('ticket.no_tickets_subtitle')}</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={() => router.push('/(main)/home')}>
              <LinearGradient colors={theme.gradientPrimary} style={styles.bookBtnInner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.bookBtnText}>Book a Trip</Text>
                  <ArrowRight size={18} color="#fff" />
                </View>
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
  travelDate:     { fontSize: 11, color: theme.muted, marginTop: 4 },
  cardMeta:       { flexDirection: 'row', gap: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border, flexWrap: 'wrap', alignItems: 'center' },
  metaCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  companyLogo:    { width: 20, height: 20, borderRadius: 4 },
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
