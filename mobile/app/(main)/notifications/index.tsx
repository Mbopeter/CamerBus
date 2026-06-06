import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../../services/endpoints';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

const TYPE_ICONS: Record<string, string> = {
  booking_confirmed: '🎫',
  payment_approved:  '✅',
  payment_rejected:  '❌',
  departure_reminder:'🚌',
  parcel_update:     '📦',
  ticket_ready:      '🎉',
  general:           'ℹ️',
};

const PARCEL_STATUS_LABELS: Record<string, { en: string; fr: string; color: string }> = {
  received:         { en: 'Received at branch',       fr: 'Reçu à la agence',            color: '#6C63FF' },
  in_transit:       { en: 'In Transit',                fr: 'En transit',                  color: '#F59E0B' },
  arrived:          { en: 'Arrived at destination',   fr: 'Arrivé à destination',         color: '#10B981' },
  ready_for_pickup: { en: 'Ready for Pickup',          fr: 'Prêt à être récupéré',         color: '#3B82F6' },
  collected:        { en: 'Collected',                 fr: 'Collecté',                    color: '#22C55E' },
  returned:         { en: 'Returned',                  fr: 'Retourné',                    color: '#EF4444' },
};

export default function NotificationsScreen() {
  const { t }         = useTranslation();
  const router        = useRouter();
  const { language }  = useLanguageStore();
  const qc            = useQueryClient();
  const theme         = useThemeColor();
  const styles        = getStyles(theme);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationService.getAll().then(r => r.data.data),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: any[] = data ?? [];
  const unread = notifications.filter(n => !n.is_read).length;

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return t('notifications.just_now');
    if (diff < 3600) return t('notifications.minutes_ago', { n: Math.floor(diff / 60) });
    if (diff < 86400)return t('notifications.hours_ago',   { n: Math.floor(diff / 3600) });
    return t('notifications.days_ago', { n: Math.floor(diff / 86400) });
  };

  const handlePress = (n: any) => {
    if (!n.is_read) markRead(n.id);
    try {
      const parsed = n.data ? JSON.parse(n.data) : {};
      if (n.type === 'parcel_update' && parsed.tracking_number) {
        router.push(`/(main)/tracking/${parsed.tracking_number}` as any);
      } else if (['booking_confirmed','payment_approved','payment_rejected','ticket_ready'].includes(n.type)) {
        router.push('/(main)/tickets' as any);
      }
    } catch (_) {}
  };

  const renderParcelBadge = (n: any) => {
    if (n.type !== 'parcel_update') return null;
    try {
      const parsed = n.data ? JSON.parse(n.data) : {};
      if (!parsed.tracking_number) return null;
      const statusKey = parsed.status ?? '';
      const statusInfo = PARCEL_STATUS_LABELS[statusKey];
      return (
        <View style={styles.trackingBadge}>
          <View style={styles.trackingRow}>
            <View>
              <Text style={styles.trackingLabel}>TRACKING NUMBER</Text>
              <Text style={styles.trackingNumber}>{parsed.tracking_number}</Text>
            </View>
            {statusInfo && (
              <View style={[styles.statusPill, { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }]}>
                <Text style={[styles.statusPillText, { color: statusInfo.color }]}>
                  {language === 'fr' ? statusInfo.fr : statusInfo.en}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.tapHint}>📍 Tap to view full tracking →</Text>
        </View>
      );
    } catch (_) {}
    return null;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{t('notifications.title')}</Text>
          {unread > 0 && (
            <TouchableOpacity onPress={() => markAllRead()} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>{t('notifications.mark_all_read')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unread} unread</Text>
          </View>
        )}
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}
        renderItem={({ item: n }) => (
          <TouchableOpacity
            style={[styles.notifCard, !n.is_read && styles.notifCardUnread]}
            onPress={() => handlePress(n)}
            activeOpacity={0.85}
          >
            <View style={styles.notifIcon}>
              <Text style={{ fontSize: 22 }}>{TYPE_ICONS[n.type] ?? '🔔'}</Text>
            </View>
            <View style={styles.notifBody}>
              <Text style={styles.notifTitle} numberOfLines={2}>
                {language === 'fr' && n.title_fr ? n.title_fr : n.title}
              </Text>
              <Text style={styles.notifText} numberOfLines={3}>
                {language === 'fr' && n.body_fr ? n.body_fr : n.body}
              </Text>
              {renderParcelBadge(n)}
              <Text style={styles.notifTime}>{getTimeAgo(n.created_at)}</Text>
            </View>
            {!n.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🔔</Text>
            <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: theme.background },
  header:           { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn:          { marginBottom: 10 },
  backText:         { fontSize: 26, color: '#fff' },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:            { fontSize: 26, fontWeight: '800', color: '#fff' },
  markAllBtn:       { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  markAllText:      { fontSize: 12, color: '#fff', fontWeight: '600' },
  unreadBadge:      { backgroundColor: theme.accent, alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  unreadText:       { fontSize: 12, fontWeight: '800', color: '#1A1A1A' },
  list:             { padding: 16, gap: 10, paddingBottom: 80 },
  notifCard:        { backgroundColor: theme.card, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'flex-start', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:8, elevation:2 },
  notifCardUnread:  { backgroundColor: theme.primary + '15', borderLeftWidth: 3, borderLeftColor: theme.primary },
  notifIcon:        { width: 46, height: 46, borderRadius: 14, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifBody:        { flex: 1 },
  notifTitle:       { fontSize: 14, fontWeight: '800', color: theme.text, marginBottom: 4 },
  notifText:        { fontSize: 13, color: theme.textLight, lineHeight: 20 },
  notifTime:        { fontSize: 11, color: theme.muted, marginTop: 6 },
  unreadDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary, marginTop: 4, flexShrink: 0 },
  empty:            { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText:        { fontSize: 16, color: theme.muted, fontWeight: '600' },
  trackingBadge:    { marginTop: 10, backgroundColor: theme.background, borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: theme.border },
  trackingRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackingLabel:    { fontSize: 9, fontWeight: '800', color: theme.muted, letterSpacing: 1.5 },
  trackingNumber:   { fontSize: 15, fontWeight: '900', color: theme.primary, letterSpacing: 2, marginTop: 2 },
  statusPill:       { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusPillText:   { fontSize: 10, fontWeight: '800' },
  tapHint:          { fontSize: 11, color: theme.muted, marginTop: 8, fontStyle: 'italic' },
});
