import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { routeService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { Shadow } from '../../../constants/colors';
import { SHIFTS } from '../../../constants/data';

export default function SearchScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { fromCity, toCity, travelDate, company, fromBranch, toBranch, setSchedule } = useBookingStore();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['schedules', fromCity?.name, toCity?.name, travelDate, company?.id, fromBranch?.id, toBranch?.id],
    queryFn: () => routeService.search({
      from: fromCity?.name ?? '',
      to:   toCity?.name   ?? '',
      date: travelDate,
      company: company?.id,
      origin_branch: fromBranch?.id,
      dest_branch: toBranch?.id,
    }).then(r => r.data.data),
    enabled: !!((fromCity && toCity) || (fromBranch && toBranch)),
  });

  const schedules: any[]    = data?.schedules ?? [];
  const showingNextDay: boolean = data?.showing_next_day ?? false;
  const displayDate: string = data?.date ?? (travelDate?.slice(0, 10) ?? '');

  const handleSelect = (schedule: any) => {
    setSchedule(schedule);
    router.push('/(main)/booking/seats');
  };

  // Show branch names when doing a branch-based search
  const fromLabel = fromBranch ? `${fromBranch.name} (${fromCity?.name ?? ''})` : (fromCity?.name ?? '');
  const toLabel   = toBranch   ? `${toBranch.name} (${toCity?.name ?? ''})`   : (toCity?.name   ?? '');

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('search.title')}</Text>
        <View style={styles.routeBanner}>
          <Text style={styles.routeText} numberOfLines={1}>{fromLabel}</Text>
          <Text style={styles.routeArrow}>  ✈️  </Text>
          <Text style={[styles.routeText, { textAlign: 'right' }]} numberOfLines={1}>{toLabel}</Text>
        </View>
        <Text style={styles.dateText}>📅 {displayDate || (travelDate?.length > 10 ? travelDate.slice(0, 10) : travelDate)}</Text>
        <Text style={styles.countText}>
          {isLoading ? t('common.loading') : t('search.available', { count: schedules.length })}
        </Text>
      </LinearGradient>

      {/* Next-day notice banner */}
      {showingNextDay && (
        <View style={styles.nextDayBanner}>
          <Text style={styles.nextDayIcon}>🌙</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextDayTitle}>No more buses today</Text>
            <Text style={styles.nextDaySubtitle}>Showing next available — {displayDate}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={schedules}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}
        renderItem={({ item: s }) => {
          const shift = SHIFTS[s.shift as keyof typeof SHIFTS];
          const isFull = s.available_seats === 0;
          return (
            <View style={[styles.card, isFull && styles.cardFull]}>
              {/* Company row */}
              <View style={styles.cardTop}>
                <View style={styles.companyChip}>
                  <Text style={styles.companyEmoji}>🚌</Text>
                  <Text style={styles.companyName}>{s.company_name}</Text>
                  <Text style={styles.rating}>⭐ {s.rating}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {/* Bus Signature Badge */}
                  <View style={styles.sigBadge}>
                    <Text style={styles.sigText}>{s.bus_signature ?? s.plate_number}</Text>
                  </View>
                  <View style={[styles.busTypeBadge, s.bus_type === 'VIP' && styles.vipBadge]}>
                    <Text style={[styles.busTypeText, s.bus_type === 'VIP' && styles.vipText]}>
                      {s.bus_type}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Time & Route */}
              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.time}>{s.departure_time?.slice(0,5)}</Text>
                  <Text style={styles.branchText}>{s.origin_branch}</Text>
                </View>
                <View style={styles.durationCol}>
                  <Text style={styles.shiftBadge}>{shift?.icon} {shift?.label}</Text>
                  <View style={styles.durationLine}><View style={styles.durationDot} /></View>
                  <Text style={styles.duration}>
                    {s.estimated_duration_minutes ? `${Math.floor(s.estimated_duration_minutes/60)}h${s.estimated_duration_minutes%60 > 0 ? s.estimated_duration_minutes%60+'m' : ''}` : '---'}
                  </Text>
                </View>
                <View style={[styles.timeCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.time}>{s.estimated_arrival_time?.slice(0,5) ?? '---'}</Text>
                  <Text style={styles.branchText}>{s.dest_branch}</Text>
                </View>
              </View>

              {/* Price & Seats */}
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.price}>
                    {Number(s.flat_price ?? (s.bus_type === 'VIP' ? s.price_vip : s.bus_type === 'Luxury' ? (s.price_luxury ?? s.price_vip) : s.price_standard)).toLocaleString()} XAF
                  </Text>
                  <Text style={styles.perSeat}>per seat</Text>
                </View>
                <View style={styles.seatsInfo}>
                  <Text style={[styles.seatsLeft, s.available_seats < 5 && { color: theme.danger }]}>
                    💺 {s.available_seats} {t('schedule.seats_left', { count: s.available_seats })}
                  </Text>
                  {/* Bus find-at-park indicator */}
                  <Text style={styles.busLocator}>🏷️ {s.bus_signature ?? s.plate_number}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.selectBtn, isFull && styles.selectBtnDisabled]}
                  onPress={() => !isFull && handleSelect(s)}
                  disabled={isFull}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isFull ? [theme.muted, theme.muted] : theme.gradientPrimary}
                    style={styles.selectBtnInner}
                  >
                    <Text style={styles.selectBtnText}>{isFull ? 'Full' : t('schedule.select')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🚌</Text>
            <Text style={styles.emptyTitle}>{t('search.no_results')}</Text>
            <Text style={styles.emptySub}>{t('search.no_results_subtitle')}</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: theme.background },
  header:         { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden' },
  backBtn:        { marginBottom: 12 },
  backText:       { fontSize: 26, color: '#fff' },
  title:          { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 12 },
  routeBanner:    { flexDirection: 'row', alignItems: 'center' },
  routeText:      { fontSize: 20, fontWeight: '800', color: '#fff' },
  routeArrow:     { fontSize: 18 },
  dateText:       { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  countText:      { fontSize: 13, color: theme.accent, fontWeight: '700', marginTop: 4 },
  list:           { padding: 16, gap: 14, paddingBottom: 100 },
  card:           { backgroundColor: theme.card, borderRadius: 20, padding: 18, ...Shadow.md },
  cardFull:       { opacity: 0.65 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  companyChip:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.background, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  companyEmoji:   { fontSize: 16 },
  companyName:    { fontSize: 13, fontWeight: '700', color: theme.text },
  rating:         { fontSize: 11, color: theme.muted },
  busTypeBadge:   { backgroundColor: theme.primary + '15', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  vipBadge:       { backgroundColor: '#EDE7F6' },
  busTypeText:    { fontSize: 12, fontWeight: '700', color: theme.primary },
  vipText:        { color: '#7C4DFF' },
  timeRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeCol:        { flex: 1 },
  time:           { fontSize: 26, fontWeight: '800', color: theme.text },
  branchText:     { fontSize: 11, color: theme.muted, marginTop: 4 },
  durationCol:    { flex: 1, alignItems: 'center' },
  shiftBadge:     { fontSize: 11, color: theme.muted, marginBottom: 6 },
  durationLine:   { width: '80%', height: 2, backgroundColor: theme.border, marginBottom: 4, position: 'relative' },
  durationDot:    { position: 'absolute', right: -4, top: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary },
  duration:       { fontSize: 11, color: theme.primary, fontWeight: '700' },
  cardBottom:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 14 },
  price:          { fontSize: 20, fontWeight: '800', color: theme.primary },
  perSeat:        { fontSize: 11, color: theme.muted },
  seatsInfo:      { alignItems: 'center' },
  seatsLeft:      { fontSize: 12, fontWeight: '600', color: theme.success },
  busLocator:     { fontSize: 11, color: theme.primary, fontWeight: '700', marginTop: 3, letterSpacing: 0.5 },
  sigBadge:       { backgroundColor: '#1A1F36', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  sigText:        { fontSize: 11, fontWeight: '800', color: '#FCD116', letterSpacing: 1 },
  selectBtn:      { borderRadius: 12, overflow: 'hidden' },
  selectBtnDisabled: {},
  selectBtnInner: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  selectBtnText:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  empty:          { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: theme.text, textAlign: 'center' },
  emptySub:       { fontSize: 14, color: theme.muted, textAlign: 'center' },
  nextDayBanner:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: '#F59E0B', margin: 16, marginBottom: 0, padding: 14, borderRadius: 12 },
  nextDayIcon:    { fontSize: 24 },
  nextDayTitle:   { fontSize: 14, fontWeight: '800', color: '#92400E' },
  nextDaySubtitle:{ fontSize: 12, color: '#B45309', marginTop: 2 },
});