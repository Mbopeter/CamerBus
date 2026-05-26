import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useThemeColor } from '../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const { t }        = useTranslation();
  const router       = useRouter();
  const { language } = useLanguageStore();
  const { register, isLoading } = useAuthStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);

  const update = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.full_name || !form.phone || !form.password) {
      Toast.show({ type: 'error', text1: t('errors.required_field') }); return;
    }
    if (form.password !== form.confirmPassword) {
      Toast.show({ type: 'error', text1: t('errors.password_match') }); return;
    }
    try {
      await register({ ...form, language });
      router.replace('/(main)/home');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? t('errors.server') });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
          <View style={styles.circle1} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>🚌 CamerBus</Text>
          <Text style={styles.title}>{t('auth.create_account')}</Text>
          <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>
        </LinearGradient>

        <View style={styles.card}>
          {[
            { key: 'full_name', label: t('auth.full_name'), icon: '👤', placeholder: 'Jean-Pierre Mbarga', keyboard: 'default' as const },
            { key: 'phone',     label: t('auth.phone'),     icon: '📱', placeholder: '677123456',          keyboard: 'phone-pad' as const },
            { key: 'email',     label: t('auth.email'),     icon: '✉️',  placeholder: 'email@example.com',  keyboard: 'email-address' as const },
          ].map(({ key, label, icon, placeholder, keyboard }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.prefix}>{icon}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  keyboardType={keyboard}
                  value={form[key as keyof typeof form]}
                  onChangeText={v => update(key as keyof typeof form, v)}
                  placeholderTextColor={theme.muted}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.prefix}>🔒</Text>
              <TextInput style={styles.input} placeholder="••••••••" secureTextEntry={!showPass}
                value={form.password} onChangeText={v => update('password', v)} placeholderTextColor={theme.muted} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.confirm_password')}</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.prefix}>🔒</Text>
              <TextInput style={styles.input} placeholder="••••••••" secureTextEntry
                value={form.confirmPassword} onChangeText={v => update('confirmPassword', v)} placeholderTextColor={theme.muted} />
            </View>
          </View>

          <Text style={styles.terms}>{t('auth.terms')}</Text>

          <TouchableOpacity style={[styles.btn, isLoading && { opacity: 0.7 }]}
            onPress={handleRegister} disabled={Boolean(isLoading)} activeOpacity={0.85}>
            <LinearGradient colors={theme.gradientPrimary} style={styles.btnInner}>
              <Text style={styles.btnText}>{isLoading ? t('common.loading') : t('auth.sign_up')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }} onPress={() => router.back()}>
            <Text style={{ color: theme.textLight, fontSize: 15 }}>
              {t('auth.have_account')} <Text style={{ color: theme.primary, fontWeight: '700' }}>{t('auth.sign_in')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  header:     { paddingTop: 60, paddingBottom: 50, paddingHorizontal: 28, overflow: 'hidden' },
  circle1:    { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.06)', top:-80, right:-80 },
  backBtn:    { marginBottom: 20 },
  backText:   { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  logo:       { fontSize: 22, color: '#fff', fontWeight: '700', marginBottom: 12 },
  title:      { fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle:   { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  card:       { backgroundColor: theme.card, margin:20, borderRadius:24, padding:28, marginTop:-30, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:24, elevation:10 },
  inputGroup: { marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '700', color: theme.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap:  { flexDirection:'row', alignItems:'center', backgroundColor: theme.background, borderRadius:14, borderWidth:1.5, borderColor:theme.border, paddingHorizontal:14, height:52 },
  prefix:     { fontSize: 16, marginRight: 8 },
  input:      { flex:1, fontSize:16, color:theme.text },
  terms:      { fontSize: 12, color: theme.muted, textAlign: 'center', marginVertical: 16, lineHeight: 18 },
  btn:        { borderRadius: 16, overflow: 'hidden' },
  btnInner:   { height: 56, alignItems: 'center', justifyContent: 'center' },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '700' },
});
