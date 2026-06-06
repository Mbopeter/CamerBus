import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { parcelService, companyService } from '../../../services/endpoints';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';

const Section = ({ title }: { title: string }) => {
  const theme = useThemeColor();
  const styles = getStyles(theme);
  return <Text style={styles.sectionTitle}>{title}</Text>;
};

const Field = ({ label, value, onChangeText, placeholder, keyboardType = 'default' as any, multiline = false }: any) => {
  const theme = useThemeColor();
  const styles = getStyles(theme);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
};

export default function SendParcelScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const params   = useLocalSearchParams<{ company_id?: string }>();
  const { user } = useAuthStore();
  const theme    = useThemeColor();
  const styles   = getStyles(theme);

  const [form, setForm] = useState({
    sender_name:    user?.full_name ?? '',
    sender_phone:   user?.phone ?? '',
    receiver_name:  '',
    receiver_phone: '',
    description:    '',
    weight_kg:      '1',
    is_fragile:     false,
    declared_value: '',
    company_id:     params.company_id ?? '',
    origin_branch_id: '',
    dest_branch_id: '',
    payment_method: 'cash',
  });

  const update = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn:  () => companyService.getAll().then(r => r.data.data),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches', form.company_id],
    queryFn:  () => companyService.getBranches(Number(form.company_id)).then(r => r.data.data),
    enabled:  !!form.company_id,
  });

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => parcelService.create({ ...form, weight_kg: parseFloat(form.weight_kg) || 1, is_fragile: form.is_fragile ? 1 : 0 }),
    onSuccess: (res) => {
      const { tracking_number, shipping_cost } = res.data.data;
      Toast.show({ type: 'success', text1: '📦 Parcel Created!', text2: `Tracking: ${tracking_number}` });
      router.push(`/(main)/tracking/${tracking_number}` as any);
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? t('errors.server') });
    },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('parcel.title')}</Text>
          <Text style={styles.subtitle}>{t('parcel.subtitle')}</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Sender */}
          <View style={styles.card}>
            <Section title={`👤 ${t('parcel.sender_info')}`} />
            <Field label={t('parcel.sender_name')}  value={form.sender_name}  onChangeText={(v: string) => update('sender_name', v)}  placeholder="Jean-Pierre Mbarga" />
            <Field label={t('parcel.sender_phone')} value={form.sender_phone} onChangeText={(v: string) => update('sender_phone', v)} placeholder="677123456" keyboardType="phone-pad" />
          </View>

          {/* Receiver */}
          <View style={styles.card}>
            <Section title={`📩 ${t('parcel.receiver_info')}`} />
            <Field label={t('parcel.receiver_name')}  value={form.receiver_name}  onChangeText={(v: string) => update('receiver_name', v)}  placeholder="Marie Ngo" />
            <Field label={t('parcel.receiver_phone')} value={form.receiver_phone} onChangeText={(v: string) => update('receiver_phone', v)} placeholder="699654321" keyboardType="phone-pad" />
          </View>

          {/* Package Details */}
          <View style={styles.card}>
            <Section title={`📦 Package Details`} />
            <Field label={t('parcel.description')} value={form.description} onChangeText={(v: string) => update('description', v)} placeholder="e.g. Clothes, Electronics..." multiline />
            <Field label={t('parcel.weight')} value={form.weight_kg} onChangeText={(v: string) => update('weight_kg', v)} placeholder="1.5" keyboardType="decimal-pad" />
            <Field label={t('parcel.declared_value')} value={form.declared_value} onChangeText={(v: string) => update('declared_value', v)} placeholder="5000" keyboardType="numeric" />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('parcel.is_fragile')} ⚠️</Text>
              <Switch value={form.is_fragile} onValueChange={v => update('is_fragile', v)} trackColor={{ true: theme.primary }} />
            </View>
          </View>

          {/* Company & Branches */}
          <View style={styles.card}>
            <Section title={`🚌 ${t('parcel.select_company')}`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {(companies ?? []).map((co: any) => (
                <TouchableOpacity key={co.id}
                  style={[styles.companyChip, form.company_id === String(co.id) && styles.companyChipSelected]}
                  onPress={() => { update('company_id', String(co.id)); update('origin_branch_id', ''); update('dest_branch_id', ''); }}>
                  <Text style={[styles.companyChipText, form.company_id === String(co.id) && { color: '#fff' }]}>
                    {co.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {branches && (
              <>
                <Text style={styles.fieldLabel}>{t('parcel.from_branch')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {branches.map((b: any) => (
                    <TouchableOpacity key={b.id}
                      style={[styles.branchChip, form.origin_branch_id === String(b.id) && styles.branchChipSelected]}
                      onPress={() => update('origin_branch_id', String(b.id))}>
                      <Text style={[styles.branchChipText, form.origin_branch_id === String(b.id) && { color: theme.primary, fontWeight: '700' }]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>{t('parcel.to_branch')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {branches.filter((b: any) => String(b.id) !== form.origin_branch_id).map((b: any) => (
                    <TouchableOpacity key={b.id}
                      style={[styles.branchChip, form.dest_branch_id === String(b.id) && styles.branchChipSelected]}
                      onPress={() => update('dest_branch_id', String(b.id))}>
                      <Text style={[styles.branchChipText, form.dest_branch_id === String(b.id) && { color: theme.primary, fontWeight: '700' }]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendBtn, (isPending || !form.receiver_name || !form.company_id) && { opacity: 0.5 }]}
            onPress={() => send()}
            disabled={Boolean(isPending || !form.receiver_name || !form.company_id)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={theme.gradientPrimary} style={styles.sendBtnInner}>
              <Text style={styles.sendBtnText}>{isPending ? t('common.loading') : `📦 ${t('parcel.send_parcel')}`}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:         { flex: 1, backgroundColor: theme.background },
  header:            { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn:           { marginBottom: 12 },
  backText:          { fontSize: 26, color: '#fff' },
  title:             { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle:          { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  scroll:            { padding: 16, gap: 14, paddingBottom: 120 },
  card:              { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  sectionTitle:      { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 14 },
  field:             { marginBottom: 14 },
  fieldLabel:        { fontSize: 12, fontWeight: '700', color: theme.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput:        { backgroundColor: theme.background, borderRadius: 12, borderWidth: 1.5, borderColor: theme.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: theme.text },
  switchRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel:       { fontSize: 15, fontWeight: '600', color: theme.text },
  companyChip:       { backgroundColor: theme.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, borderWidth: 1.5, borderColor: theme.border },
  companyChipSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  companyChipText:   { fontSize: 13, fontWeight: '600', color: theme.text },
  branchChip:        { backgroundColor: theme.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: theme.border },
  branchChipSelected:{ borderColor: theme.primary, backgroundColor: theme.primary + '15' },
  branchChipText:    { fontSize: 12, color: theme.textLight },
  footer:            { padding: 20, paddingBottom: 34, backgroundColor: theme.card, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.08, shadowRadius:12, elevation:10 },
  sendBtn:           { borderRadius: 16, overflow: 'hidden' },
  sendBtnInner:      { height: 56, alignItems: 'center', justifyContent: 'center' },
  sendBtnText:       { color: '#fff', fontSize: 17, fontWeight: '700' },
});
