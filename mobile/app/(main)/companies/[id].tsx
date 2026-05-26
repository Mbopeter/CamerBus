import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function CompanyDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const { t }    = useTranslation();
  const router   = useRouter();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);
  const { setSearch } = useBookingStore();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(Number(id)).then(r => r.data.data),
    enabled: !!id,
  });

  if (isLoading || !company) {
    return <View style={styles.loading}><Text style={{ color: theme.muted, fontSize:16 }}>{t('common.loading')}</Text></View>;
  }

  // Group branches by city
  const branchesByCity: Record<string, any[]> = {};
  (company.branches ?? []).forEach((b: any) => {
    if (!branchesByCity[b.city_name]) branchesByCity[b.city_name] = [];
    branchesByCity[b.city_name].push(b);
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={theme.gradientPrimary} style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoBox}><Text style={{ fontSize: 42 }}>🚌</Text></View>
        <Text style={styles.name}>{company.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>📍 {company.hq_city}</Text>
          <Text style={styles.metaItem}>⭐ {company.rating} ({company.total_reviews})</Text>
          {company.is_verified ? <Text style={styles.verified}>✓ Verified</Text> : null}
        </View>
        <Text style={styles.desc}>{company.description}</Text>
      </LinearGradient>

      {/* Services Quick Actions */}
      <View style={styles.servicesRow}>
        <TouchableOpacity style={styles.serviceBtn} onPress={() => {
            // Scroll down or prompt them to pick a route
            router.push('/(main)/home');
        }}>
          <LinearGradient colors={theme.gradientPrimary} style={styles.serviceBtnInner}>
            <Text style={{ fontSize: 24 }}>🎫</Text>
            <Text style={styles.serviceBtnText}>Book Ticket</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceBtn} onPress={() => {
            router.push(`/(main)/parcels/send?company_id=${company.id}` as any);
        }}>
          <LinearGradient colors={theme.gradientDark} style={styles.serviceBtnInner}>
            <Text style={{ fontSize: 24 }}>📦</Text>
            <Text style={styles.serviceBtnText}>Send Parcel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Details</Text>
        <View style={styles.paymentCard}>
          {company.mtn_number && (
            <View style={styles.payRow}>
              <View style={[styles.payIcon, { backgroundColor: '#FFF9C4' }]}><Text>📱</Text></View>
              <View>
                <Text style={styles.payMethod}>MTN Mobile Money</Text>
                <Text style={styles.payNum}>{company.mtn_name} — {company.mtn_number}</Text>
              </View>
            </View>
          )}
          {company.orange_number && (
            <View style={styles.payRow}>
              <View style={[styles.payIcon, { backgroundColor: '#FFE0B2' }]}><Text>📱</Text></View>
              <View>
                <Text style={styles.payMethod}>Orange Money</Text>
                <Text style={styles.payNum}>{company.orange_name} — {company.orange_number}</Text>
              </View>
            </View>
          )}
          {company.bank_account && (
            <View style={styles.payRow}>
              <View style={[styles.payIcon, { backgroundColor: '#E3F2FD' }]}><Text>🏦</Text></View>
              <View>
                <Text style={styles.payMethod}>{company.bank_name}</Text>
                <Text style={styles.payNum}>{company.bank_account_name} — {company.bank_account}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Available Routes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ Available Routes</Text>
        {(company.routes ?? []).map((r: any) => (
          <TouchableOpacity key={r.id} style={styles.routeCard} activeOpacity={0.85}
            onPress={() => {
              setSearch({ id: r.origin_city_id, name: r.origin_city }, { id: r.dest_city_id, name: r.dest_city }, new Date().toISOString().split('T')[0]);
              router.push('/(main)/search');
            }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
              <Text style={styles.routeCity}>{r.origin_city}</Text>
              <Text style={styles.routeArrow}>→</Text>
              <Text style={styles.routeCity}>{r.dest_city}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{Number(r.price_standard).toLocaleString()} XAF</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Branches by City */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏢 Branch Offices</Text>
        {Object.entries(branchesByCity).map(([city, branches]) => (
          <View key={city} style={styles.cityGroup}>
            <Text style={styles.cityLabel}>{city}</Text>
            {branches.map((b: any) => (
              <View key={b.id} style={styles.branchItem}>
                <Text style={styles.branchName}>{b.name}</Text>
                <Text style={styles.branchAddr}>{b.address}</Text>
                {b.phone && <Text style={styles.branchPhone}>📞 {b.phone}</Text>}
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:   { flex:1, backgroundColor:theme.background },
  loading:     { flex:1, alignItems:'center', justifyContent:'center' },
  hero:        { paddingTop:56, paddingHorizontal:20, paddingBottom:30, alignItems:'center' },
  backBtn:     { alignSelf:'flex-start', marginBottom:16 },
  backText:    { fontSize:26, color:'#fff' },
  logoBox:     { width:80, height:80, borderRadius:24, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center', marginBottom:12 },
  name:        { fontSize:26, fontWeight:'800', color:'#fff', textAlign:'center' },
  metaRow:     { flexDirection:'row', gap:12, marginTop:8, flexWrap:'wrap', justifyContent:'center' },
  metaItem:    { fontSize:13, color:'rgba(255,255,255,0.8)' },
  verified:    { backgroundColor:'rgba(255,255,255,0.2)', color:'#fff', fontSize:12, fontWeight:'700', paddingHorizontal:8, paddingVertical:3, borderRadius:10 },
  desc:        { fontSize:14, color:'rgba(255,255,255,0.75)', textAlign:'center', marginTop:10, lineHeight:22 },
  section:     { padding:20, borderBottomWidth:1, borderBottomColor:theme.border },
  sectionTitle:{ fontSize:17, fontWeight:'800', color:theme.text, marginBottom:14 },
  paymentCard: { backgroundColor:theme.card, borderRadius:16, padding:16, gap:14, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:3 },
  payRow:      { flexDirection:'row', alignItems:'center', gap:12 },
  payIcon:     { width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center' },
  payMethod:   { fontSize:13, fontWeight:'700', color:theme.text },
  payNum:      { fontSize:14, color:theme.primary, fontWeight:'600', marginTop:2 },
  routeCard:   { backgroundColor:theme.card, borderRadius:14, padding:14, marginBottom:10, flexDirection:'row', justifyContent:'space-between', alignItems:'center', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:8, elevation:2 },
  routeCity:   { fontSize:15, fontWeight:'700', color:theme.text },
  routeArrow:  { fontSize:16, color:theme.muted },
  priceTag:    { backgroundColor:theme.primary + '15', paddingHorizontal:12, paddingVertical:6, borderRadius:10 },
  priceText:   { fontSize:13, fontWeight:'700', color:theme.primary },
  cityGroup:   { marginBottom:16 },
  cityLabel:   { fontSize:14, fontWeight:'800', color:theme.text, marginBottom:8, borderLeftWidth:3, borderLeftColor:theme.primary, paddingLeft:10 },
  branchItem:  { backgroundColor:theme.card, borderRadius:12, padding:14, marginBottom:8, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.04, shadowRadius:6, elevation:2 },
  branchName:  { fontSize:14, fontWeight:'700', color:theme.text },
  branchAddr:  { fontSize:12, color:theme.muted, marginTop:3 },
  branchPhone: { fontSize:12, color:theme.primary, marginTop:3 },
  servicesRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: -20, zIndex: 10, marginBottom: 10 },
  serviceBtn:  { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  serviceBtnInner: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 6 },
  serviceBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
