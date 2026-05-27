import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { parcelService } from '../../../services/endpoints';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { PARCEL_STATUSES } from '../../../constants/data';

export default function TrackParcelScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);
  const [tracking, setTracking] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['track', submitted],
    queryFn:  () => parcelService.track(submitted).then(r => r.data.data),
    enabled:  !!submitted,
    retry: 0,
  });

  const statusInfo = data ? PARCEL_STATUSES[data.status as keyof typeof PARCEL_STATUSES] : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('parcel.track_title')}</Text>
        <Text style={styles.subtitle}>Enter your tracking number below</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder={t('parcel.enter_tracking')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={tracking}
            onChangeText={setTracking}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => setSubmitted(tracking.trim())}
            disabled={Boolean(!tracking.trim())}
            activeOpacity={0.85}
          >
            <Text style={styles.trackBtnText}>{t('parcel.track')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading && (
          <View style={styles.center}><Text style={{ fontSize: 40 }}>⏳</Text><Text style={{ color: theme.muted }}>{t('common.loading')}</Text></View>
        )}

        {error && (
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>😞</Text>
            <Text style={styles.errorText}>Parcel not found. Check your tracking number.</Text>
          </View>
        )}

        {data && statusInfo && (
          <>
            {/* Status Hero */}
            <View style={[styles.statusHero, { borderColor: statusInfo.color }]}>
              <Text style={styles.statusEmoji}>{statusInfo.icon}</Text>
              <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              <Text style={styles.trackingDisplay}>{data.tracking_number}</Text>
            </View>

            {/* Route */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📍 Route</Text>
              <View style={styles.routeRow}>
                <View>
                  <Text style={styles.branchName}>{data.origin_branch_name}</Text>
                  <Text style={styles.cityName}>{data.origin_city}</Text>
                </View>
                <Text style={styles.routeArrow}>→</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.branchName}>{data.dest_branch_name}</Text>
                  <Text style={styles.cityName}>{data.dest_city}</Text>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📦 Package Details</Text>
              {[
                ['Sender',    data.sender_name + ' · ' + data.sender_phone],
                ['Receiver',  data.receiver_name + ' · ' + data.receiver_phone],
                ['Company',   data.company_name],
                ['Description', data.description],
                ['Weight',    data.weight_kg + ' kg'],
                ['Fragile',   data.is_fragile ? '⚠️ Yes' : 'No'],
                ['Shipping Cost', Number(data.shipping_cost).toLocaleString() + ' XAF'],
              ].map(([l, v]) => (
                <View key={l} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{l}</Text>
                  <Text style={styles.detailValue}>{v}</Text>
                </View>
              ))}
              {/* Bus signature for in-transit parcels */}
              {(data.status === 'in_transit' || data.status === 'received') && data.bus_signature && (
                <View style={styles.busSignatureBox}>
                  <Text style={styles.busSignatureTitle}>🚌 Your Package is on Bus</Text>
                  <Text style={styles.busSignatureCode}>{data.bus_signature}</Text>
                  <Text style={styles.busSignatureHint}>Show this to park staff to verify your package location</Text>
                </View>
              )}
            </View>

            {/* Tracking Timeline */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🕐 Tracking History</Text>
              {(data.tracking_history ?? []).map((evt: any, i: number) => {
                const evtStatus = PARCEL_STATUSES[evt.status as keyof typeof PARCEL_STATUSES];
                return (
                  <View key={i} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: evtStatus?.color ?? theme.muted }]}>
                        <Text style={{ fontSize: 10 }}>{evtStatus?.icon}</Text>
                      </View>
                      {i < (data.tracking_history.length - 1) && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStatus}>{evtStatus?.label}</Text>
                      {evt.location && <Text style={styles.timelineLocation}>📍 {evt.location}</Text>}
                      {evt.description && <Text style={styles.timelineDesc}>{evt.description}</Text>}
                      <Text style={styles.timelineTime}>{evt.created_at?.slice(0,16).replace('T',' ')}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: theme.background },
  header:          { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28 },
  backBtn:         { marginBottom: 12 },
  backText:        { fontSize: 26, color: '#fff' },
  title:           { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle:        { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 16 },
  searchRow:       { flexDirection: 'row', gap: 10 },
  input:           { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 16, height: 50, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', letterSpacing: 1 },
  trackBtn:        { backgroundColor: theme.accent, borderRadius: 14, paddingHorizontal: 20, height: 50, alignItems: 'center', justifyContent: 'center' },
  trackBtnText:    { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  scroll:          { padding: 16, gap: 14, paddingBottom: 80 },
  center:          { alignItems: 'center', marginTop: 60, gap: 12 },
  errorText:       { fontSize: 16, color: theme.danger, textAlign: 'center', fontWeight: '600' },
  statusHero:      { backgroundColor: theme.card, borderRadius: 20, padding: 28, alignItems: 'center', gap: 8, borderWidth: 2 },
  statusEmoji:     { fontSize: 52 },
  statusLabel:     { fontSize: 22, fontWeight: '800' },
  trackingDisplay: { fontSize: 14, color: theme.muted, letterSpacing: 2, fontWeight: '600' },
  card:            { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  cardTitle:       { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 14 },
  routeRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  branchName:      { fontSize: 15, fontWeight: '700', color: theme.text },
  cityName:        { fontSize: 12, color: theme.muted, marginTop: 3 },
  routeArrow:      { fontSize: 22, color: theme.primary, fontWeight: '800' },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  detailLabel:     { fontSize: 13, color: theme.muted },
  detailValue:     { fontSize: 13, fontWeight: '600', color: theme.text, textAlign: 'right', flex: 1, marginLeft: 12 },
  timelineItem:    { flexDirection: 'row', gap: 14, marginBottom: 4 },
  timelineLeft:    { alignItems: 'center', width: 36 },
  timelineDot:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  timelineLine:    { width: 2, flex: 1, backgroundColor: theme.border, marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineStatus:  { fontSize: 14, fontWeight: '800', color: theme.text },
  timelineLocation:{ fontSize: 12, color: theme.textLight, marginTop: 3 },
  timelineDesc:    { fontSize: 12, color: theme.muted, marginTop: 2 },
  timelineTime:    { fontSize: 11, color: theme.muted, marginTop: 4 },
  busSignatureBox: { marginTop: 14, backgroundColor: '#1A1F36', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6 },
  busSignatureTitle:{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  busSignatureCode: { fontSize: 28, fontWeight: '900', color: '#FCD116', letterSpacing: 3 },
  busSignatureHint: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic' },
});