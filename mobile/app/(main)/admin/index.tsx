import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, paymentService } from '../../../services/endpoints';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function AdminDashboardScreen() {
  const { t }  = useTranslation();
  const router = useRouter();
  const qc     = useQueryClient();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  () => adminService.dashboard().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { mutate: approve } = useMutation({
    mutationFn: (id: number) => paymentService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-dashboard'] }),
  });

  const { mutate: reject } = useMutation({
    mutationFn: (id: number) => paymentService.reject(id, { reason: 'Rejected by admin' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-dashboard'] }),
  });

  const stats = data?.stats ?? {};
  const pending: any[] = data?.pending_payments ?? [];
  const departures: any[] = data?.todays_departures ?? [];

  const StatCard = ({ icon, label, value, color = theme.primary }: any) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1F36','#0F1117']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.adminLabel}>⚙️ Admin Panel</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="🎫" label="Total Bookings"    value={stats.total_bookings ?? 0}   color={theme.primary} />
          <StatCard icon="⏳" label="Pending Payments"  value={stats.pending_payments ?? 0} color={theme.warning} />
          <StatCard icon="💰" label="Today Revenue"      value={`${Number(stats.today_revenue ?? 0).toLocaleString()} XAF`} color={theme.success} />
          <StatCard icon="📦" label="Total Parcels"     value={stats.total_parcels ?? 0}   color={theme.info} />
          <StatCard icon="🚌" label="Active Schedules"  value={stats.active_schedules ?? 0} color={theme.seatVip ?? "#7C4DFF"} />
          <StatCard icon="🏢" label="Companies"         value={stats.total_companies ?? 0} color={theme.accent} />
        </View>

        {/* Pending Payments */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏳ Pending Approvals ({pending.length})</Text>
            {pending.map((p: any) => (
              <View key={p.id} style={styles.pendingCard}>
                <View>
                  <Text style={styles.pendingRef}>{p.booking_ref}</Text>
                  <Text style={styles.pendingPassenger}>{p.passenger} · {p.phone}</Text>
                  <Text style={styles.pendingMethod}>via {p.method?.replace('_',' ').toUpperCase()}</Text>
                </View>
                <View style={styles.pendingRight}>
                  <Text style={styles.pendingAmount}>{Number(p.amount).toLocaleString()} XAF</Text>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => approve(p.id)}>
                      <Text style={styles.approveBtnText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(p.id)}>
                      <Text style={styles.rejectBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Today's Departures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚌 Today's Departures</Text>
          {departures.length === 0 ? (
            <Text style={styles.emptyText}>No departures scheduled today</Text>
          ) : departures.map((d: any) => (
            <View key={d.id} style={styles.departureCard}>
              <View>
                <Text style={styles.departureTime}>{d.departure_time?.slice(0,5)}</Text>
                <Text style={styles.departureRoute}>{d.origin_city} → {d.dest_city}</Text>
                <Text style={styles.departureCompany}>{d.company_name} · {d.bus_type}</Text>
              </View>
              <View style={styles.departureMeta}>
                <Text style={styles.departureSeats}>
                  {d.booked_seats}/{d.booked_seats + d.available_seats} seats
                </Text>
                <View style={[styles.statusDot, { backgroundColor: d.status === 'scheduled' ? theme.success : theme.muted }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:         { flex: 1, backgroundColor: theme.background },
  header:            { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  headerTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  adminLabel:        { fontSize: 13, color: theme.accent, fontWeight: '700', marginBottom: 4 },
  title:             { fontSize: 28, fontWeight: '800', color: '#fff' },
  closeBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:      { color: '#fff', fontSize: 16 },
  scroll:            { padding: 16, gap: 16, paddingBottom: 80 },
  statsGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard:          { backgroundColor: theme.card, borderRadius: 16, padding: 16, flex: 1, minWidth: '45%', borderTopWidth: 3, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:10, elevation:3 },
  statIcon:          { fontSize: 24, marginBottom: 8 },
  statValue:         { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel:         { fontSize: 11, color: theme.muted, fontWeight: '600' },
  section:           { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  sectionTitle:      { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 14 },
  pendingCard:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  pendingRef:        { fontSize: 14, fontWeight: '800', color: theme.text },
  pendingPassenger:  { fontSize: 12, color: theme.textLight, marginTop: 2 },
  pendingMethod:     { fontSize: 11, color: theme.muted, marginTop: 2 },
  pendingRight:      { alignItems: 'flex-end', gap: 8 },
  pendingAmount:     { fontSize: 16, fontWeight: '800', color: theme.primary },
  pendingActions:    { flexDirection: 'row', gap: 8 },
  approveBtn:        { backgroundColor: theme.success + '15', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  approveBtnText:    { fontSize: 12, fontWeight: '700', color: theme.success },
  rejectBtn:         { backgroundColor: theme.danger + '15', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  rejectBtnText:     { fontSize: 12, fontWeight: '700', color: theme.danger },
  emptyText:         { fontSize: 14, color: theme.muted, textAlign: 'center', padding: 16 },
  departureCard:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  departureTime:     { fontSize: 20, fontWeight: '800', color: theme.text },
  departureRoute:    { fontSize: 13, fontWeight: '600', color: theme.textLight, marginTop: 2 },
  departureCompany:  { fontSize: 11, color: theme.muted, marginTop: 2 },
  departureMeta:     { alignItems: 'flex-end', gap: 6 },
  departureSeats:    { fontSize: 12, fontWeight: '700', color: theme.textLight },
  statusDot:         { width: 10, height: 10, borderRadius: 5 },
});
