import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions, Image, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useThemeColor } from '../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';
import { Lock, Eye, EyeOff, ArrowRightLeft } from 'lucide-react-native';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { login, isLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);
  const [phone, setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Toast.show({ type: 'error', text1: t('errors.required_field') }); return;
    }
    try {
      await login(phone.trim(), password);
      router.replace('/(main)/home');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? t('errors.server') });
    }
  };

  return (
    <ImageBackground source={require('../../assets/login&regiterbgimg.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {/* Header */}
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.header}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          {/* Language switcher */}
          <TouchableOpacity style={styles.langSwitch} onPress={() => router.replace('/onboarding')}>
            <Text style={styles.langSwitchText}>
              {language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </Text>
            <ArrowRightLeft size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Image
            source={require('../../assets/dark.logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('auth.welcome_back')}</Text>
          <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.phone')}</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.prefix}>🇨🇲 +237</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.phone_placeholder')}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View style={styles.inputWrap}>
              <View style={{ marginRight: 8 }}><Lock size={18} color={theme.textLight} /></View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={theme.muted}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? <EyeOff size={20} color={theme.muted} /> : <Eye size={20} color={theme.muted} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={Boolean(isLoading)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={theme.gradientPrimary} style={styles.btnInner}>
              <Text style={styles.btnText}>{isLoading ? t('common.loading') : t('auth.sign_in')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.orText}>{t('common.or')}</Text><View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.secondaryText}>
              {t('auth.no_account')} <Text style={styles.link}>{t('auth.sign_up')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  header:       { paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20, position: 'relative', overflow: 'hidden', alignItems: 'center' },
  circle1:      { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.06)', top:-60, right:-60 },
  circle2:      { position:'absolute', width:140, height:140, borderRadius:70, backgroundColor:'rgba(252,209,22,0.08)', bottom:-40, left:-20 },
  langSwitch:   { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  langSwitchText:{ fontSize: 13, color: '#fff', fontWeight: '600' },
  langSwitchArrow:{ fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  logoImage:    { width: width * 0.72, height: width * 0.54, marginBottom: 8 },
  title:        { fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 5, textAlign: 'center' },
  subtitle:     { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  card:         { backgroundColor: theme.card, margin: 20, borderRadius: 24, padding: 28, marginTop: -10, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:24, elevation:10 },
  inputGroup:   { marginBottom: 18 },
  label:        { fontSize: 13, fontWeight: '600', color: theme.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap:    { flexDirection:'row', alignItems:'center', backgroundColor: theme.background, borderRadius: 14, borderWidth: 1.5, borderColor: theme.border, paddingHorizontal: 14, height: 54 },
  prefix:       { fontSize: 15, marginRight: 8, color: theme.text },
  input:        { flex: 1, fontSize: 16, color: theme.text },
  eyeBtn:       { padding: 4 },
  btn:          { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  btnInner:     { height: 56, alignItems: 'center', justifyContent: 'center' },
  btnText:      { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  divider:      { flexDirection:'row', alignItems:'center', marginVertical: 20, gap: 12 },
  line:         { flex:1, height:1, backgroundColor: theme.border },
  orText:       { color: theme.muted, fontSize: 13 },
  secondaryBtn: { alignItems: 'center', paddingVertical: 8 },
  secondaryText:{ fontSize: 15, color: theme.textLight },
  link:         { color: theme.primary, fontWeight: '700' },
});
