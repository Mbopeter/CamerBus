import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { parcelService } from '../../../services/endpoints';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { PARCEL_STATUSES } from '../../../constants/data';
import { Package, ArrowLeft, Map, ArrowRight, Clock, MapPin, AlertTriangle } from 'lucide-react-native';

export default function TrackingDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const { t }    = useTranslation();
  const router   = useRouter();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const { data, isLoading } = useQuery({
    queryKey: ['parcel', id],
    queryFn:  () => parcelService.track(id!).then(r => r.data.data),
    enabled:  !!id,
    refetchInterval: 30000,
  });

  if (isLoading || !data) {
    return (
      <View style={styles.loading}>
        <Package size={48} color={theme.muted} />
        <Text style={{ color: theme.muted, marginTop: 12, fontSize: 16 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  const statusInfo = PARCEL_STATUSES[data.status as keyof typeof PARCEL_STATUSES];
  const steps = Object.values(PARCEL_STATUSES).filter(s => s.step > 0).sort((a,b) => a.step - b.step);
  const currentStep = statusInfo?.step ?? 0;

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Package size={22} color="#fff" />
          <Text style={styles.title}>{t('parcel.tracking_history')}</Text>
        </View>
        <Text style={styles.trackNum}>{data.tracking_number}</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Steps */}
        <View style={styles.progressCard}>
          <View style={styles.stepsRow}>
            {steps.map((step, i) => {
              const done    = step.step <= currentStep;
              const active  = step.step === currentStep;
              return (
                <View key={i} style={styles.stepWrap}>
                  <View style={[styles.stepIcon, done && styles.stepIconDone, active && styles.stepIconActive]}>
                    <Text style={styles.stepEmoji}>{step.icon}</Text>
                  </View>
                  <Text style={[styles.stepLabel, done && { color: step.color }]} numberOfLines={2}>
                    {step.label}
                  </Text>
                  {i < steps.length - 1 && (
                    <View style={[styles.stepConnector, done && { backgroundColor: step.color }]} />
                  )}
                </View>
              );
            })}
          </View>
          <View style={[styles.currentStatusBadge, { backgroundColor: statusInfo?.color + '20' }]}>
            <Text style={{ fontSize: 20 }}>{statusInfo?.icon}</Text>
            <Text style={[styles.currentStatusText, { color: statusInfo?.color }]}>{statusInfo?.label}</Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Map size={18} color={theme.text} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Route</Text>
          </View>
          <View style={styles.routeRow}>
            <View>
              <Text style={styles.branchBold}>{data.origin_branch_name}</Text>
              <Text style={styles.cityMuted}>{data.origin_city}</Text>
            </View>
            <ArrowRight size={22} color={theme.primary} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.branchBold}>{data.dest_branch_name}</Text>
              <Text style={styles.cityMuted}>{data.dest_city}</Text>
            </View>
          </View>
        </View>

        {/* Package Info */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Package size={18} color={theme.text} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Package</Text>
          </View>
          {[
            ['Sender',     `${data.sender_name} · ${data.sender_phone}`],
            ['Receiver',   `${data.receiver_name} · ${data.receiver_phone}`],
            ['Description',data.description],
            ['Weight',     `${data.weight_kg} kg`],
            ['Fragile',    data.is_fragile ? 'Yes (Fragile)' : 'No'],
            ['Company',    data.company_name],
            ['Cost',       `${Number(data.shipping_cost).toLocaleString()} XAF`],
          ].map(([l, v]) => (
            <View key={l} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{l}</Text>
              <Text style={styles.infoValue}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Clock size={18} color={theme.text} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Full History</Text>
          </View>
          {(data.tracking_history ?? []).map((evt: any, i: number) => {
            const evtInfo = PARCEL_STATUSES[evt.status as keyof typeof PARCEL_STATUSES];
            return (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: evtInfo?.color ?? theme.muted }]}>
                    <Text style={{ fontSize: 12 }}>{evtInfo?.icon}</Text>
                  </View>
                  {i < (data.tracking_history.length - 1) && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>{evtInfo?.label}</Text>
                  {!!evt.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <MapPin size={12} color={theme.textLight} />
                      <Text style={[styles.timelineLoc, { marginTop: 0 }]}>{evt.location}</Text>
                    </View>
                  )}
                  {!!evt.description && <Text style={styles.timelineDesc}>{evt.description}</Text>}
                  <Text style={styles.timelineDate}>{evt.created_at?.slice(0,16).replace('T',' ')}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: theme.background },
  loading:            { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn:            { marginBottom: 12 },
  title:              { fontSize: 22, fontWeight: '800', color: '#fff' },
  trackNum:           { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: 2, fontWeight: '600' },
  scroll:             { padding: 16, gap: 14, paddingBottom: 80 },
  progressCard:       { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  stepsRow:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, position: 'relative' },
  stepWrap:           { alignItems: 'center', flex: 1, position: 'relative' },
  stepIcon:           { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.border, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepIconDone:       { backgroundColor: theme.success + '30', borderWidth: 2, borderColor: theme.success },
  stepIconActive:     { borderWidth: 2.5, borderColor: theme.primary, backgroundColor: theme.primary + '15' },
  stepEmoji:          { fontSize: 18 },
  stepLabel:          { fontSize: 9, color: theme.muted, textAlign: 'center', fontWeight: '600' },
  stepConnector:      { position: 'absolute', top: 20, right: -20, width: 40, height: 2, backgroundColor: theme.border, zIndex: 0 },
  currentStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14 },
  currentStatusText:  { fontSize: 16, fontWeight: '800' },
  card:               { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  cardTitle:          { fontSize: 15, fontWeight: '800', color: theme.text },
  routeRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  branchBold:         { fontSize: 15, fontWeight: '700', color: theme.text },
  cityMuted:          { fontSize: 12, color: theme.muted, marginTop: 3 },
  infoRow:            { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  infoLabel:          { fontSize: 13, color: theme.muted },
  infoValue:          { fontSize: 13, fontWeight: '600', color: theme.text, flex: 1, textAlign: 'right', marginLeft: 12 },
  timelineItem:       { flexDirection: 'row', gap: 14, marginBottom: 4 },
  timelineLeft:       { alignItems: 'center', width: 40 },
  timelineDot:        { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  timelineLine:       { width: 2, flex: 1, backgroundColor: theme.border, marginTop: 4 },
  timelineBody:       { flex: 1, paddingBottom: 20 },
  timelineTitle:      { fontSize: 14, fontWeight: '800', color: theme.text },
  timelineLoc:        { fontSize: 12, color: theme.textLight, marginTop: 3 },
  timelineDesc:       { fontSize: 12, color: theme.muted, marginTop: 2 },
  timelineDate:       { fontSize: 11, color: theme.muted, marginTop: 5 },
});
