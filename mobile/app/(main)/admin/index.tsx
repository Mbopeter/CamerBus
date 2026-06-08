import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, paymentService } from '../../../services/endpoints';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useAuthStore } from '../../../store/useAuthStore';
import { Settings, Ticket as TicketIcon, Hourglass, Banknote, Package, Bus, Building2, Check, X, ArrowRight } from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const { t }  = useTranslation();
  const router = useRouter();
  const qc     = useQueryClient();
  const theme = useThemeColor();
  const styles = getStyles(theme);
  const { user } = useAuthStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.morning', 'Good morning') : hour < 18 ? t('home.afternoon', 'Good afternoon') : t('home.evening', 'Good evening');

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
      <View style={{ marginBottom: 8 }}>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1F36','#0F1117']} style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={require('../../../assets/dark.logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>{greeting}, {user?.full_name?.split(' ')[0] ?? '👋'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Settings size={14} color={theme.accent} />
            <Text style={[styles.adminLabel, { marginBottom: 0 }]}>Admin Panel</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon={<TicketIcon size={24} color={theme.primary} />} label="Total Bookings"    value={stats.total_bookings ?? 0}   color={theme.primary} />
          <StatCard icon={<Hourglass size={24} color={theme.warning} />} label="Pending Payments"  value={stats.pending_payments ?? 0} color={theme.warning} />
          <StatCard icon={<Banknote size={24} color={theme.success} />} label="Today Revenue"      value={`${Number(stats.today_revenue ?? 0).toLocaleString()} XAF`} color={theme.success} />
          <StatCard icon={<Package size={24} color={theme.info} />} label="Total Parcels"     value={stats.total_parcels ?? 0}   color={theme.info} />
          <StatCard icon={<Bus size={24} color={theme.seatVip ?? "#7C4DFF"} />} label="Active Schedules"  value={stats.active_schedules ?? 0} color={theme.seatVip ?? "#7C4DFF"} />
          <StatCard icon={<Building2 size={24} color={theme.accent} />} label="Companies"         value={stats.total_companies ?? 0} color={theme.accent} />
        </View>

        {/* Pending Payments */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Hourglass size={18} color={theme.text} />
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Pending Approvals ({pending.length})</Text>
            </View>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Check size={12} color={theme.success} />
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(p.id)}>
                      <X size={12} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Today's Departures */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Bus size={18} color={theme.text} />
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Today's Departures</Text>
          </View>
          {departures.length === 0 ? (
            <Text style={styles.emptyText}>No departures scheduled today</Text>
          ) : departures.map((d: any) => (
            <View key={d.id} style={styles.departureCard}>
              <View>
                <Text style={styles.departureTime}>{d.departure_time?.slice(0,5)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Text style={[styles.departureRoute, { marginTop: 0 }]}>{d.origin_city}</Text>
                  <ArrowRight size={12} color={theme.textLight} />
                  <Text style={[styles.departureRoute, { marginTop: 0 }]}>{d.dest_city}</Text>
                </View>
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
  headerTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLogo:        { width: 100, height: 40 },
  greetingRow:       { paddingVertical: 4, marginBottom: 8 },
  greeting:          { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  adminLabel:        { fontSize: 13, color: theme.accent, fontWeight: '700', marginBottom: 4 },
  title:             { fontSize: 28, fontWeight: '800', color: '#fff' },
  closeBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:      { color: '#fff', fontSize: 16 },
  scroll:            { padding: 16, gap: 16, paddingBottom: 80 },
  statsGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard:          { backgroundColor: theme.card, borderRadius: 16, padding: 16, flex: 1, minWidth: '45%', borderTopWidth: 3, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:10, elevation:3 },
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
