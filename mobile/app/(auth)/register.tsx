import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useThemeColor } from '../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';
import { User, Smartphone, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
    <ImageBackground source={require('../../assets/login&regiterbgimg.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.header}>
          <View style={styles.circle1} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.backText}>{t('common.back')}</Text>
            </View>
          </TouchableOpacity>
          <Image
            source={require('../../assets/dark.logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('auth.create_account')}</Text>
          <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>
        </LinearGradient>

        <View style={styles.card}>
          {[
            { key: 'full_name', label: t('auth.full_name'), icon: <User size={18} color={theme.textLight} />, placeholder: 'Jean-Pierre Mbarga', keyboard: 'default' as const },
            { key: 'phone',     label: t('auth.phone'),     icon: <Smartphone size={18} color={theme.textLight} />, placeholder: '677123456',          keyboard: 'phone-pad' as const },
            { key: 'email',     label: t('auth.email'),     icon: <Mail size={18} color={theme.textLight} />,  placeholder: 'email@example.com',  keyboard: 'email-address' as const },
          ].map(({ key, label, icon, placeholder, keyboard }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputWrap}>
                <View style={{ marginRight: 8 }}>{icon}</View>
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
              <View style={{ marginRight: 8 }}><Lock size={18} color={theme.textLight} /></View>
              <TextInput style={styles.input} placeholder="••••••••" secureTextEntry={!showPass}
                value={form.password} onChangeText={v => update('password', v)} placeholderTextColor={theme.muted} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={20} color={theme.muted} /> : <Eye size={20} color={theme.muted} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.confirm_password')}</Text>
            <View style={styles.inputWrap}>
              <View style={{ marginRight: 8 }}><Lock size={18} color={theme.textLight} /></View>
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
    </ImageBackground>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  header:     { paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20, overflow: 'hidden', alignItems: 'center' },
  circle1:    { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.06)', top:-80, right:-80 },
  backBtn:    { alignSelf: 'flex-start', marginBottom: 8 },
  backText:   { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  logoImage:  { width: width * 0.72, height: width * 0.54, marginBottom: 8 },
  title:      { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 5, textAlign: 'center' },
  subtitle:   { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  card:       { backgroundColor: theme.card, margin:20, borderRadius:24, padding:28, marginTop:-10, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:24, elevation:10 },
  inputGroup: { marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '700', color: theme.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap:  { flexDirection:'row', alignItems:'center', backgroundColor: theme.background, borderRadius: 14, borderWidth: 1.5, borderColor: theme.border, paddingHorizontal: 14, height: 50 },
  prefix:     { fontSize: 16, marginRight: 8, color: theme.text },
  input:      { flex:1, fontSize:16, color:theme.text },
  terms:      { fontSize: 12, color: theme.muted, textAlign: 'center', marginVertical: 16, lineHeight: 18 },
  btn:        { borderRadius: 16, overflow: 'hidden' },
  btnInner:   { height: 56, alignItems: 'center', justifyContent: 'center' },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '700' },
});
