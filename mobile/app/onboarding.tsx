import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeColor } from '../hooks/useThemeColor';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { setLanguage } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const theme = useThemeColor();

  const handleSelect = async (lang: 'en' | 'fr') => {
    await setLanguage(lang);
    if (isAuthenticated) {
      router.replace('/(main)/home');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <LinearGradient colors={theme.gradientPrimary} style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Flag stripes */}
      <View style={styles.flagStripes}>
        <View style={[styles.stripe, { backgroundColor: theme.primary }]} />
        <View style={[styles.stripe, { backgroundColor: '#FCD116' }]} />
        <View style={[styles.stripe, { backgroundColor: '#CE1126' }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}><Text style={styles.logoEmoji}>🚌</Text></View>
        <Text style={styles.appName}>CamerBus</Text>
        <Text style={styles.tagline}>Cameroon's Transport Super-App</Text>
        <Text style={styles.taglineFr}>L'Application de Transport du Cameroun</Text>
      </View>

      {/* Language picker */}
      <View style={styles.langSection}>
        <Text style={styles.chooseText}>
          Choose Your Language / Choisissez Votre Langue
        </Text>

        <TouchableOpacity style={styles.langCard} onPress={() => handleSelect('en')} activeOpacity={0.85}>
          <LinearGradient colors={['#FFFFFF', '#F0F0F0']} style={styles.langCardInner}>
            <Text style={styles.flag}>🇬🇧</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.langTitle}>English</Text>
              <Text style={styles.langSub}>Continue in English</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.langCard} onPress={() => handleSelect('fr')} activeOpacity={0.85}>
          <LinearGradient colors={['#FCD116', '#E5BC00']} style={styles.langCardInner}>
            <Text style={styles.flag}>🇫🇷</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.langTitle, { color: '#1A1A1A' }]}>Français</Text>
              <Text style={[styles.langSub, { color: '#444' }]}>Continuer en Français</Text>
            </View>
            <Text style={[styles.arrow, { color: '#1A1A1A' }]}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>🇨🇲 Made for Cameroon</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 24 },
  circle1:      { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -80 },
  circle2:      { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(252,209,22,0.08)', bottom: 80, left: -60 },
  flagStripes:  { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', height: 5 },
  stripe:       { flex: 1 },
  header:       { alignItems: 'center', gap: 10, marginTop: 20 },
  logoBox:      { width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  logoEmoji:    { fontSize: 50 },
  appName:      { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  tagline:      { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  taglineFr:    { fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  langSection:  { width: '100%', gap: 14 },
  chooseText:   { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 13, lineHeight: 22 },
  langCard:     { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  langCardInner:{ flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  flag:         { fontSize: 36 },
  langTitle:    { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  langSub:      { fontSize: 13, color: '#555', marginTop: 2 },
  arrow:        { fontSize: 22, color: '#333', marginLeft: 'auto' },
  footer:       { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});
