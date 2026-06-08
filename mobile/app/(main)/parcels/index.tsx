import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, FlatList, RefreshControl, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parcelService, companyService, branchService } from '../../../services/endpoints';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { PARCEL_STATUSES } from '../../../constants/data';
import Toast from 'react-native-toast-message';
import { Package, Search, ArrowRight, CalendarDays, User as UserIcon, Wallet } from 'lucide-react-native';

export default function ParcelsScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { user } = useAuthStore();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-parcels', user?.id],
    queryFn:  () => parcelService.getByUser(user!.id).then(r => r.data.data),
    enabled:  !!user,
  });

  const parcels: any[] = data ?? [];

  const renderParcelItem = useCallback(({ item: p }: { item: any }) => {
    const statusInfo = PARCEL_STATUSES[p.status as keyof typeof PARCEL_STATUSES];
    return (
      <TouchableOpacity style={styles.card}
        onPress={() => router.push(`/(main)/tracking/${p.id}` as any)} activeOpacity={0.85}>
        <View style={styles.cardTop}>
          <View style={styles.trackingTag}>
            <Text style={styles.trackingNum}>{p.tracking_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color ?? theme.muted) + '20' }]}>
            <Text style={{ fontSize: 14 }}>{statusInfo?.icon}</Text>
            <Text style={[styles.statusText, { color: statusInfo?.color }]}>{statusInfo?.label}</Text>
          </View>
        </View>
        <View style={styles.routeRow}>
          <View>
            <Text style={styles.branchName}>{p.origin_branch}</Text>
            <Text style={styles.cityName}>{p.origin_city}</Text>
          </View>
          <ArrowRight size={18} color={theme.primary} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.branchName}>{p.dest_branch}</Text>
            <Text style={styles.cityName}>{p.dest_city}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CalendarDays size={12} color={theme.textLight} />
            <Text style={styles.meta}>{p.created_at?.slice(0,10)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <UserIcon size={12} color={theme.textLight} />
            <Text style={styles.meta}>To: {p.receiver_name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Wallet size={12} color={theme.textLight} />
            <Text style={styles.meta}>{Number(p.shipping_cost).toLocaleString()} XAF</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [router, theme, styles]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <Text style={styles.title}>{t('parcel.my_parcels')}</Text>
        <Text style={styles.subtitle}>Track and manage your packages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(main)/parcels/send')} activeOpacity={0.85}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Package size={16} color={theme.primary} />
              <Text style={styles.actionBtnText}>{t('home.send_parcel')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => router.push('/(main)/parcels/track')} activeOpacity={0.85}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Search size={16} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>{t('home.track_parcel')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <FlatList
        data={parcels}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}
        renderItem={renderParcelItem}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.empty}>
            <Package size={52} color={theme.muted} />
            <Text style={styles.emptyTitle}>{t('parcel.no_parcels')}</Text>
            <TouchableOpacity style={styles.sendBtn} onPress={() => router.push('/(main)/parcels/send')}>
              <LinearGradient colors={theme.gradientPrimary} style={styles.sendBtnInner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Package size={18} color="#fff" />
                  <Text style={styles.sendBtnText}>Send a Parcel</Text>
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
  container:    { flex: 1, backgroundColor: theme.background },
  header:       { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, gap: 6 },
  title:        { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle:     { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  headerActions:{ flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn:    { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#fff' },
  actionBtnText:{ fontSize: 13, fontWeight: '700', color: theme.primary },
  list:         { padding: 16, gap: 14, paddingBottom: 100 },
  card:         { backgroundColor: theme.card, borderRadius: 20, padding: 18, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:12, elevation:5 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  trackingTag:  { backgroundColor: theme.primary + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  trackingNum:  { fontSize: 12, fontWeight: '800', color: theme.primary, letterSpacing: 1 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  routeRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  branchName:   { fontSize: 14, fontWeight: '700', color: theme.text },
  cityName:     { fontSize: 11, color: theme.muted, marginTop: 2 },
  cardBottom:   { flexDirection: 'row', gap: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border, flexWrap: 'wrap' },
  meta:         { fontSize: 12, color: theme.textLight, fontWeight: '600' },
  empty:        { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: theme.text },
  sendBtn:      { borderRadius: 14, overflow: 'hidden' },
  sendBtnInner: { paddingHorizontal: 32, paddingVertical: 14 },
  sendBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
