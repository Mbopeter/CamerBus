import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '../../../services/endpoints';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { ArrowLeft, Search as SearchIcon, BusFront, Check, MapPin, Star, ChevronRight } from 'lucide-react-native';

export default function CompaniesScreen() {
  const { t }   = useTranslation();
  const router  = useRouter();
  const theme   = useThemeColor();
  const styles  = getStyles(theme);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll().then(r => r.data.data),
  });

  const filtered = (data ?? []).filter((c: any) =>
    (c.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const renderCompanyItem = useCallback(({ item: co }: { item: any }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => router.push(`/(main)/companies/${co.id}` as any)} activeOpacity={0.85}>
      <View style={styles.cardLeft}>
        <View style={styles.logoBox}>
          <BusFront size={30} color={theme.text} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.companyName}>{co.name}</Text>
            {co.is_verified ? (
              <View style={styles.verified}>
                <Check size={10} color={theme.primary} />
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={12} color={theme.muted} />
            <Text style={styles.hqText}>{co.hq_city}</Text>
          </View>
          <Text style={styles.desc} numberOfLines={2}>{co.description}</Text>
          <View style={styles.statsRow}>
            <Stat label={t('companies.routes')}   value={co.route_count ?? 0} theme={theme} />
            <Stat label={t('companies.branches')} value={co.branch_count ?? 0} theme={theme} />
            <Stat label={t('companies.buses')}    value={co.bus_count ?? 0} theme={theme} />
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.ratingBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Star size={12} color="#E5BC00" fill="#E5BC00" />
            <Text style={styles.ratingText}>{co.rating}</Text>
          </View>
          <Text style={styles.reviewCount}>{co.total_reviews} reviews</Text>
        </View>
        <ChevronRight size={22} color={theme.muted} />
      </View>
    </TouchableOpacity>
  ), [router, theme, styles, t, Stat]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('companies.title')}</Text>
        <Text style={styles.subtitle}>{t('companies.subtitle')}</Text>
        <View style={styles.searchWrap}>
          <SearchIcon size={18} color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </ImageBackground>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={<RefreshControl refreshing={Boolean(isLoading)} onRefresh={refetch} tintColor={theme.primary} />}
        renderItem={renderCompanyItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BusFront size={48} color={theme.muted} />
            <Text style={styles.emptyText}>{t('companies.no_companies')}</Text>
          </View>
        }
      />
    </View>
  );
}

function Stat({ label, value, theme }: { label: string; value: number, theme: any }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 14, fontWeight: '800', color: theme.primary }}>{value}</Text>
      <Text style={{ fontSize: 10, color: theme.muted }}>{label}</Text>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.background },
  header:       { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn:      { marginBottom: 12 },
  title:        { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle:     { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 16 },
  searchWrap:   { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.15)', borderRadius:14, paddingHorizontal:16, height:48 },
  searchInput:  { flex:1, color:'#fff', fontSize:15 },
  list:         { padding: 16, gap: 12 },
  card:         { backgroundColor: theme.card, borderRadius:20, padding:16, flexDirection:'row', justifyContent:'space-between', shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  cardLeft:     { flexDirection:'row', gap:14, flex:1 },
  logoBox:      { width:56, height:56, borderRadius:16, backgroundColor:theme.background, alignItems:'center', justifyContent:'center' },
  companyName:  { fontSize:15, fontWeight:'800', color:theme.text },
  verified:     { backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius:10 },
  hqText:       { fontSize:12, color:theme.muted },
  desc:         { fontSize:12, color:theme.textLight, marginTop:4, lineHeight:18 },
  statsRow:     { flexDirection:'row', gap:16, marginTop:10 },
  cardRight:    { alignItems:'flex-end', justifyContent:'space-between' },
  ratingBadge:  { backgroundColor:'#FFF9E6', padding:8, borderRadius:12, alignItems:'center' },
  ratingText:   { fontSize:14, fontWeight:'800', color:'#E5BC00' },
  reviewCount:  { fontSize:10, color:theme.muted, marginTop:2 },
  empty:        { alignItems:'center', marginTop:80, gap:12 },
  emptyText:    { fontSize:16, color:theme.muted, fontWeight:'600' },
});
