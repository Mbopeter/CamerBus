import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { ArrowLeft, Building2, BusFront, Check, MapPin, CalendarDays, ArrowRight, Search } from 'lucide-react-native';

export default function BranchSearchScreen() {
  const { t }  = useTranslation();
  const router = useRouter();
  const theme  = useThemeColor();
  const styles = getStyles(theme);
  const { setSearch, setBranches } = useBookingStore();

  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [fromBranch, setFromBranch]           = useState<any>(null);
  const [toBranch, setToBranch]               = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Data ---
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn:  () => companyService.getAll().then(r => r.data.data ?? []),
  });

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches', selectedCompany?.id],
    queryFn:  () => companyService.getBranches(selectedCompany.id).then(r => r.data.data ?? []),
    enabled:  !!selectedCompany?.id,
  });

  const availableDestBranches = useMemo(
    () => branches.filter((b: any) => b.id !== fromBranch?.id),
    [branches, fromBranch]
  );

  // --- Handlers ---
  const handleSelectCompany = (co: any) => {
    setSelectedCompany(co);
    setFromBranch(null);
    setToBranch(null);
  };

  const handleSearch = () => {
    if (!selectedCompany || !fromBranch || !toBranch || !date) return;

    // Push city + branch info into booking store, then navigate
    setSearch(
      { id: fromBranch.city_id, name: fromBranch.city_name },
      { id: toBranch.city_id,   name: toBranch.city_name },
      date,
      selectedCompany,
    );
    setBranches(fromBranch, toBranch);
    router.push('/(main)/search');
  };

  const isReady = selectedCompany && fromBranch && toBranch && date;

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Building2 size={24} color="#fff" />
          <Text style={[styles.title, { marginBottom: 0 }]}>Book by Branch</Text>
        </View>
        <Text style={styles.subtitle}>Choose your exact departure & arrival branch</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Step 1: Company ── */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Select Bus Company</Text>
          </View>

          {loadingCompanies ? (
            <ActivityIndicator color={theme.primary} style={{ margin: 16 }} />
          ) : (
            <View style={styles.chipGrid}>
              {companies.map((co: any) => {
                const selected = selectedCompany?.id === co.id;
                return (
                  <TouchableOpacity
                    key={co.id}
                    style={[styles.companyChip, selected && styles.companyChipSelected]}
                    onPress={() => handleSelectCompany(co)}
                    activeOpacity={0.8}
                  >
                    <BusFront size={22} color={selected ? "#fff" : theme.muted} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.companyName, selected && { color: '#fff' }]}>{co.name}</Text>
                      <Text style={[styles.companyMeta, selected && { color: 'rgba(255,255,255,0.75)' }]}>
                        {co.branch_count ?? 0} branches
                      </Text>
                    </View>
                    {selected && <Check size={18} color="#fff" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Step 2: From Branch ── */}
        {selectedCompany && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: theme.success }]}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Departure Branch</Text>
            </View>
            {loadingBranches ? (
              <ActivityIndicator color={theme.primary} style={{ margin: 16 }} />
            ) : branches.length === 0 ? (
              <Text style={styles.emptyText}>No branches found for this company</Text>
            ) : (
              <View style={styles.branchList}>
                {branches.map((b: any) => {
                  const selected = fromBranch?.id === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.branchRow, selected && styles.branchRowSelected]}
                      onPress={() => { setFromBranch(b); if (toBranch?.id === b.id) setToBranch(null); }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.branchDot, { backgroundColor: selected ? theme.success : theme.border }]} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.branchName, selected && { color: theme.primary }]}>{b.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={12} color={theme.muted} />
                          <Text style={[styles.branchCity, { marginTop: 0 }]}>{b.city_name}{b.address ? ` · ${b.address}` : ''}</Text>
                        </View>
                      </View>
                      {selected && <Check size={18} color={theme.success} strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── Step 3: To Branch ── */}
        {fromBranch && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: theme.danger }]}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Arrival Branch</Text>
            </View>
            {availableDestBranches.length === 0 ? (
              <Text style={styles.emptyText}>No other branches available</Text>
            ) : (
              <View style={styles.branchList}>
                {availableDestBranches.map((b: any) => {
                  const selected = toBranch?.id === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.branchRow, selected && styles.branchRowSelected]}
                      onPress={() => setToBranch(b)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.branchDot, { backgroundColor: selected ? theme.danger : theme.border }]} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.branchName, selected && { color: theme.primary }]}>{b.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={12} color={theme.muted} />
                          <Text style={[styles.branchCity, { marginTop: 0 }]}>{b.city_name}{b.address ? ` · ${b.address}` : ''}</Text>
                        </View>
                      </View>
                      {selected && <Check size={18} color={theme.danger} strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── Step 4: Date ── */}
        {toBranch && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.stepNum}>4</Text>
              </View>
              <Text style={styles.stepTitle}>Travel Date</Text>
            </View>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.muted}
              keyboardType="numbers-and-punctuation"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <CalendarDays size={12} color={theme.muted} />
              <Text style={[styles.dateHint, { marginTop: 0 }]}>Enter date in YYYY-MM-DD format</Text>
            </View>
          </View>
        )}

        {/* ── Route Preview ── */}
        {fromBranch && toBranch && (
          <View style={styles.previewCard}>
            <LinearGradient colors={theme.gradientPrimary} style={styles.previewGradient}>
              <View style={styles.previewRow}>
                <View style={styles.previewCity}>
                  <Text style={styles.previewCityName}>{fromBranch.city_name}</Text>
                  <Text style={styles.previewBranch}>{fromBranch.name}</Text>
                </View>
                <View style={styles.previewMiddle}>
                  <ArrowRight size={24} color="#fff" />
                  <Text style={styles.previewCompany}>{selectedCompany?.name}</Text>
                </View>
                <View style={[styles.previewCity, { alignItems: 'flex-end' }]}>
                  <Text style={styles.previewCityName}>{toBranch.city_name}</Text>
                  <Text style={styles.previewBranch}>{toBranch.name}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Footer Search Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.searchBtn, !isReady && { opacity: 0.45 }]}
          onPress={handleSearch}
          disabled={!isReady}
          activeOpacity={0.85}
        >
          <LinearGradient colors={theme.gradientPrimary} style={styles.searchBtnInner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Search size={18} color="#fff" />
              <Text style={styles.searchBtnText}>Search Schedules</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:           { flex: 1, backgroundColor: theme.background },
  header:              { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28 },
  backBtn:             { marginBottom: 14 },
  title:               { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle:            { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  scroll:              { padding: 16, paddingBottom: 140 },

  stepCard:            { backgroundColor: theme.card, borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 4 },
  stepHeader:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stepBadge:           { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepNum:             { color: '#fff', fontWeight: '800', fontSize: 15 },
  stepTitle:           { fontSize: 16, fontWeight: '800', color: theme.text },

  chipGrid:            { gap: 10 },
  companyChip:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.background, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: theme.border },
  companyChipSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  companyIcon:         { fontSize: 22 },
  companyName:         { fontSize: 14, fontWeight: '700', color: theme.text },
  companyMeta:         { fontSize: 11, color: theme.muted, marginTop: 2 },
  checkmark:           { fontSize: 18, color: '#fff', fontWeight: '800' },

  branchList:          { gap: 8 },
  branchRow:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.background, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: theme.border },
  branchRowSelected:   { borderColor: theme.primary, backgroundColor: theme.primary + '0D' },
  branchDot:           { width: 12, height: 12, borderRadius: 6 },
  branchName:          { fontSize: 14, fontWeight: '700', color: theme.text },
  branchCity:          { fontSize: 12, color: theme.muted, marginTop: 2 },

  emptyText:           { fontSize: 13, color: theme.muted, textAlign: 'center', padding: 12 },

  dateInput:           { backgroundColor: theme.background, borderRadius: 14, borderWidth: 1.5, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: '700', color: theme.text },
  dateHint:            { fontSize: 12, color: theme.muted, marginTop: 8 },

  previewCard:         { borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  previewGradient:     { padding: 20 },
  previewRow:          { flexDirection: 'row', alignItems: 'center' },
  previewCity:         { flex: 1 },
  previewCityName:     { fontSize: 18, fontWeight: '800', color: '#fff' },
  previewBranch:       { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  previewMiddle:       { flex: 1, alignItems: 'center' },
  previewArrow:        { fontSize: 28, color: '#fff', fontWeight: '900' },
  previewCompany:      { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  footer:              { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 34, backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 16 },
  searchBtn:           { borderRadius: 16, overflow: 'hidden' },
  searchBtnInner:      { height: 56, alignItems: 'center', justifyContent: 'center' },
  searchBtnText:       { color: '#fff', fontSize: 17, fontWeight: '700' },
});
