import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { companyService, branchService } from '../../services/endpoints';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useThemeColor } from '../../hooks/useThemeColor';
import { MAJOR_CITIES } from '../../constants/data';

const { width } = Dimensions.get('window');

const POPULAR_ROUTES = [
  { from: 'Bamenda', to: 'Yaoundé', price: '6,500', duration: '6h' },
  { from: 'Douala',  to: 'Yaoundé', price: '4,000', duration: '4h' },
  { from: 'Bamenda', to: 'Douala',  price: '6,000', duration: '5h' },
  { from: 'Douala',  to: 'Buea',    price: '2,000', duration: '1h30' },
  { from: 'Yaoundé', to: 'Buea',    price: '6,000', duration: '5h30' },
];

export default function HomeScreen() {
  const { t }  = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { setSearch, setBranches } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const [fromCity, setFromCity] = useState<any>(null);
  const [toCity,   setToCity]   = useState<any>(null);
  const [fromBranch, setFromBranch] = useState<any>(null);
  const [toBranch,   setToBranch]   = useState<any>(null);

  const [date,     setDate]      = useState(new Date().toISOString().split('T')[0]);
  const [showFrom, setShowFrom]  = useState(false);
  const [showTo,   setShowTo]    = useState(false);
  const [expandedCityId, setExpandedCityId] = useState<number | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.greeting_morning') : hour < 17 ? t('home.greeting_afternoon') : t('home.greeting_evening');

  const { data: companiesData, isLoading, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll().then(r => r.data.data),
    staleTime: 60000,
  });

  const { data: branchesData = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll().then(r => r.data.data),
    staleTime: 60000,
  });

  const handleSearch = () => {
    if (!fromCity || !toCity) return;
    setSearch(fromCity, toCity, date);
    setBranches(fromBranch, toBranch);
    router.push('/(main)/search');
  };

  const handleCityPress = (city: any, type: 'from' | 'to') => {
    // Get branches for this city
    const cityBranches = branchesData.filter((b: any) => b.city_id === city.id || b.city_name === city.name);
    
    // If multiple branches, just expand to let them pick
    if (cityBranches.length > 0) {
      if (expandedCityId === city.id) {
        setExpandedCityId(null);
      } else {
        setExpandedCityId(city.id);
      }
    } else {
      // No branches, just pick city
      if (type === 'from') { setFromCity(city); setFromBranch(null); setShowFrom(false); }
      else                 { setToCity(city);   setToBranch(null);   setShowTo(false);   }
      setExpandedCityId(null);
    }
  };

  const selectBranch = (city: any, branch: any, type: 'from' | 'to') => {
    if (type === 'from') { 
      setFromCity(city); 
      setFromBranch(branch); // if branch is null, means "All Branches"
      setShowFrom(false); 
    } else { 
      setToCity(city);   
      setToBranch(branch);   
      setShowTo(false);   
    }
    setExpandedCityId(null);
  };

  const getLabel = (city: any, branch: any, type: 'from' | 'to') => {
    if (!city) return t('home.select_city');
    if (branch) return `${branch.name} (${city.name})`;
    return city.name;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}>

      {/* Header */}
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting}, {user?.full_name?.split(' ')[0] ?? '👋'}</Text>
            <Text style={styles.headerSub}>{t('home.search_subtitle')}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(main)/notifications')} style={styles.notifBtn}>
            <Text style={{ fontSize: 24 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>{t('home.search_title')}</Text>

          {/* From */}
          <TouchableOpacity style={styles.searchRow} onPress={() => { setShowFrom(!showFrom); setShowTo(false); setExpandedCityId(null); }}>
            <Text style={styles.searchIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchLabel}>{t('home.from')}</Text>
              <Text style={[styles.searchValue, !fromCity && { color: theme.muted }]}>
                {getLabel(fromCity, fromBranch, 'from')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Swap button */}
          <TouchableOpacity style={styles.swapBtn} onPress={() => { 
            const tC = fromCity; const tB = fromBranch;
            setFromCity(toCity); setFromBranch(toBranch);
            setToCity(tC);       setToBranch(tB);
          }}>
            <Text style={{ fontSize: 20, transform: [{ rotate: '90deg' }] }}>⇄</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* To */}
          <TouchableOpacity style={styles.searchRow} onPress={() => { setShowTo(!showTo); setShowFrom(false); setExpandedCityId(null); }}>
            <Text style={styles.searchIcon}>🏁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchLabel}>{t('home.to')}</Text>
              <Text style={[styles.searchValue, !toCity && { color: theme.muted }]}>
                {getLabel(toCity, toBranch, 'to')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Date */}
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchLabel}>{t('home.date')}</Text>
              <TextInput
                style={styles.searchValue}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.searchBtn, (!fromCity || !toCity) && { opacity: 0.5 }]}
            onPress={handleSearch} disabled={Boolean(!fromCity || !toCity)}>
            <LinearGradient colors={theme.gradientPrimary} style={styles.searchBtnInner}>
              <Text style={styles.searchBtnText}>🔍  {t('home.search_trips')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* City/Branch picker dropdown */}
        {(showFrom || showTo) && (
          <View style={styles.cityPicker}>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {MAJOR_CITIES.map(c => {
                const isExpanded = expandedCityId === c.id;
                const cityBranches = branchesData.filter((b: any) => b.city_id === c.id || b.city_name === c.name);
                
                return (
                  <View key={c.id}>
                    <TouchableOpacity style={[styles.cityItem, isExpanded && { borderBottomWidth: 0, backgroundColor: theme.primary + '10' }]}
                      onPress={() => handleCityPress(c, showFrom ? 'from' : 'to')}>
                      <View>
                        <Text style={styles.cityName}>{c.name}</Text>
                        <Text style={styles.cityRegion}>{c.region}</Text>
                      </View>
                      {cityBranches.length > 0 && (
                        <Text style={{ color: theme.primary }}>{isExpanded ? '▲' : '▼'}</Text>
                      )}
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.branchesList}>
                        <TouchableOpacity style={styles.branchItem} onPress={() => selectBranch(c, null, showFrom ? 'from' : 'to')}>
                          <Text style={styles.branchName}>🌐 All Branches in {c.name}</Text>
                        </TouchableOpacity>
                        
                        {cityBranches.map((b: any) => (
                          <TouchableOpacity key={b.id} style={styles.branchItem} onPress={() => selectBranch(c, b, showFrom ? 'from' : 'to')}>
                            <Text style={styles.branchName}>📍 {b.name}</Text>
                            {b.address && <Text style={styles.branchAddress}>{b.address}</Text>}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      {/* Quick Actions (Branch Book removed as it's now integrated) */}
      <View style={styles.section}>
        <View style={styles.quickActions}>
          {[
            { icon: '🚌', label: t('home.quick_book'),  onPress: () => router.push('/(main)/companies') },
            { icon: '📦', label: t('home.send_parcel'), onPress: () => router.push('/(main)/parcels/send') },
            { icon: '🔍', label: t('home.track_parcel'),onPress: () => router.push('/(main)/parcels/track') },
            { icon: '🎫', label: t('home.my_trips'),    onPress: () => router.push('/(main)/tickets') },
          ].map(({ icon, label, onPress }) => (
            <TouchableOpacity key={label} style={styles.quickAction} onPress={onPress}>
              <View style={styles.quickIcon}><Text style={{ fontSize: 26 }}>{icon}</Text></View>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Popular Routes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.popular_routes')}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
          {POPULAR_ROUTES.map((route, i) => (
            <TouchableOpacity key={i} style={styles.routeCard}
              onPress={() => { 
                setFromCity({ id: 0, name: route.from }); setFromBranch(null);
                setToCity({ id: 0, name: route.to }); setToBranch(null);
              }}>
              <LinearGradient colors={i % 2 === 0 ? theme.gradientPrimary : theme.gradientDark} style={styles.routeCardInner}>
                <Text style={styles.routeFrom}>{route.from}</Text>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.routeTo}>{route.to}</Text>
                <View style={styles.routeMeta}>
                  <Text style={styles.routePrice}>{route.price} XAF</Text>
                  <Text style={styles.routeDuration}>⏱ {route.duration}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* All Companies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('common.all_companies', 'All Companies')}</Text>
        </View>
        {isLoading ? (
          <Text style={{ color: theme.muted, textAlign: 'center', padding: 20 }}>{t('common.loading')}</Text>
        ) : (
          (companiesData ?? []).map((co: any) => (
            <TouchableOpacity key={co.id} style={styles.companyCard}
              onPress={() => router.push(`/(main)/companies/${co.id}` as any)}>
              <View style={styles.companyEmoji}><Text style={{ fontSize: 28 }}>🚌</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{co.name}</Text>
                <Text style={styles.companyMeta}>{co.route_count ?? 0} routes · {co.branch_count ?? 0} branches</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {co.rating}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: theme.background },
  header:          { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 30, overflow: 'hidden' },
  circle1:         { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.05)', top:-80, right:-80 },
  circle2:         { position:'absolute', width:160, height:160, borderRadius:80, backgroundColor:'rgba(252,209,22,0.08)', bottom:-40, left:-40 },
  headerTop:       { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 20 },
  greeting:        { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  notifBtn:        { width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' },
  searchCard:      { backgroundColor: theme.card, borderRadius:24, padding:20, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:20, elevation:10, position:'relative' },
  searchTitle:     { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 16 },
  searchRow:       { flexDirection:'row', alignItems:'center', paddingVertical:10, gap:12 },
  searchIcon:      { fontSize: 20 },
  searchLabel:     { fontSize: 11, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  searchValue:     { fontSize: 16, fontWeight: '600', color: theme.text, marginTop: 2 },
  divider:         { height: 1, backgroundColor: theme.border, marginLeft: 32 },
  swapBtn:         { position:'absolute', right:20, top:72, width:36, height:36, borderRadius:18, backgroundColor:theme.background, borderWidth:1, borderColor:theme.border, alignItems:'center', justifyContent:'center', zIndex:10 },
  searchBtn:       { borderRadius:14, overflow:'hidden', marginTop:16 },
  searchBtnInner:  { height:50, alignItems:'center', justifyContent:'center' },
  searchBtnText:   { color:'#fff', fontSize:16, fontWeight:'700' },
  
  cityPicker:      { backgroundColor: theme.card, borderRadius:16, marginTop:12, padding:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.1, shadowRadius:12, elevation:8 },
  cityItem:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:theme.border },
  cityName:        { fontSize:15, fontWeight:'600', color:theme.text },
  cityRegion:      { fontSize:12, color:theme.muted },
  
  branchesList:    { backgroundColor: theme.background, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  branchItem:      { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border + '50' },
  branchName:      { fontSize: 14, fontWeight: '600', color: theme.text },
  branchAddress:   { fontSize: 11, color: theme.muted, marginTop: 2 },

  section:         { paddingHorizontal:20, marginTop:28 },
  sectionHeader:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  sectionTitle:    { fontSize:18, fontWeight:'800', color:theme.text },
  seeAll:          { fontSize:13, color:theme.primary, fontWeight:'700' },
  quickActions:    { flexDirection:'row', justifyContent:'space-between', flexWrap:'wrap', gap: 10 },
  quickAction:     { alignItems:'center', gap:8, width: '22%', marginBottom: 10 },
  quickIcon:       { width:60, height:60, borderRadius:20, backgroundColor: theme.card, alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:12, elevation:4 },
  quickLabel:      { fontSize:11, color:theme.textLight, fontWeight:'600', textAlign:'center' },
  routeCard:       { marginRight:12, borderRadius:20, overflow:'hidden', width:160 },
  routeCardInner:  { padding:16 },
  routeFrom:       { fontSize:14, fontWeight:'700', color:'#fff' },
  routeArrow:      { color:'rgba(255,255,255,0.6)', fontSize:14, marginVertical:4 },
  routeTo:         { fontSize:14, fontWeight:'700', color:'#fff', marginBottom:10 },
  routeMeta:       { flexDirection:'row', justifyContent:'space-between' },
  routePrice:      { fontSize:12, color:'#FCD116', fontWeight:'700' },
  routeDuration:   { fontSize:11, color:'rgba(255,255,255,0.7)' },
  companyCard:     { backgroundColor: theme.card, borderRadius:16, padding:16, marginBottom:12, flexDirection:'row', alignItems:'center', gap:14, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:3 },
  companyEmoji:    { width:52, height:52, borderRadius:16, backgroundColor:theme.background, alignItems:'center', justifyContent:'center' },
  companyName:     { fontSize:15, fontWeight:'700', color:theme.text },
  companyMeta:     { fontSize:12, color:theme.muted, marginTop:3 },
  ratingBadge:     { backgroundColor:'#FFF9E6', paddingHorizontal:10, paddingVertical:5, borderRadius:10 },
  ratingText:      { fontSize:13, fontWeight:'700', color:'#E5BC00' },
});
