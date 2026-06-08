import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguageStore } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeColor } from '../hooks/useThemeColor';
import { ArrowRight, Check } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const LANGUAGES = [
  {
    code: 'en' as const,
    flag: '🇬🇧',
    name: 'English',
    sub: 'Continue in English',
    gradient: ['#2563EB', '#1D4ED8'] as const,
    accent: '#60A5FA',
  },
  {
    code: 'fr' as const,
    flag: '🇫🇷',
    name: 'Français',
    sub: 'Continuer en Français',
    gradient: ['#059669', '#047857'] as const,
    accent: '#34D399',
  },
];

export default function OnboardingScreen() {
  const router              = useRouter();
  const { setLanguage }     = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const theme               = useThemeColor();
  const [selected, setSelected] = useState<'en' | 'fr' | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSelect = async (lang: 'en' | 'fr') => {
    setSelected(lang);
    setLoading(true);
    await setLanguage(lang);
    setLoading(false);
    if (isAuthenticated) {
      router.replace('/(main)/home');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      {/* Cameroon flag stripe at top */}
      <View style={styles.flagBar}>
        <View style={[styles.flagStripe, { backgroundColor: '#007A5E' }]} />
        <View style={[styles.flagStripe, { backgroundColor: '#CE1126' }]} />
        <View style={[styles.flagStripe, { backgroundColor: '#FCD116' }]} />
      </View>

      {/* Decorative glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/dark.logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.taglineWrap}>
          <Text style={styles.taglineEn}>Cameroon's Transport Super-App</Text>
          <Text style={styles.taglineFr}>L'Application de Transport du Cameroun</Text>
        </View>
      </View>

      {/* Language choice section */}
      <View style={styles.langSection}>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.chooseLabel}>Choose Language · Choisir la langue</Text>
          <View style={styles.dividerLine} />
        </View>

        {LANGUAGES.map((lang) => {
          const isActive = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.85}
              onPress={() => handleSelect(lang.code)}
              disabled={loading}
              style={[styles.langCard, isActive && styles.langCardActive]}
            >
              <LinearGradient
                colors={isActive ? lang.gradient : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.langCardInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {/* Left: flag + text */}
                <View style={styles.langLeft}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View>
                    <Text style={[styles.langName, isActive && { color: '#fff' }]}>{lang.name}</Text>
                    <Text style={[styles.langSub, isActive && { color: 'rgba(255,255,255,0.75)' }]}>{lang.sub}</Text>
                  </View>
                </View>

                {/* Right: arrow / check */}
                <View style={[styles.arrowBubble, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  {isActive ? <Check size={20} color="#fff" strokeWidth={3} /> : <ArrowRight size={20} color="#fff" />}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🇨🇲 Made with ❤️ for Cameroon</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 0, paddingHorizontal: 0 },
  flagBar:        { width: '100%', height: 5, flexDirection: 'row' },
  flagStripe:     { flex: 1 },
  glow1:          { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(252,209,22,0.06)', top: -100, right: -100 },
  glow2:          { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(37,99,235,0.07)', bottom: 60, left: -80 },

  logoSection:    { alignItems: 'center', gap: 2, paddingTop: 40, paddingHorizontal: 12 },
  logoImage:      { width: width * 0.88, height: width * 0.72 },
  taglineWrap:    { alignItems: 'center', gap: 4 },
  taglineEn:      { fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  taglineFr:      { fontSize: 13, color: 'rgba(255,255,255,0.45)' },

  langSection:    { width: '100%', paddingHorizontal: 24, gap: 14 },
  dividerRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  chooseLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },

  langCard:       { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  langCardActive: { borderColor: 'rgba(255,255,255,0.3)', shadowOpacity: 0.5 },
  langCardInner:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22, paddingHorizontal: 24 },
  langLeft:       { flexDirection: 'row', alignItems: 'center', gap: 16 },
  flag:           { fontSize: 40 },
  langName:       { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  langSub:        { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  arrowBubble:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  footer:         { paddingBottom: 32, alignItems: 'center' },
  footerText:     { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
});
