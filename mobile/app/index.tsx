import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useThemeColor } from '../hooks/useThemeColor';

const { width } = Dimensions.get('window');

export default function SplashRouter() {
  const router   = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const theme = useThemeColor();

  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { isSelected, loadLanguage }         = useLanguageStore();

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1,    duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 50 }),
    ]).start();

    // Load persisted state, then route
    (async () => {
      await Promise.all([loadFromStorage(), loadLanguage()]);

      // Small delay so splash is visible
      await new Promise(r => setTimeout(r, 1200));

      const { isSelected: sel } = useLanguageStore.getState();
      const { isAuthenticated: auth } = useAuthStore.getState();

      if (!sel) {
        router.replace('/onboarding');
      } else if (auth) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(auth)/login');
      }
    })();
  }, []);

  return (
    <LinearGradient colors={theme.gradientPrimary} style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Flag stripes at top */}
      <View style={styles.flagStripes}>
        <View style={[styles.stripe, { backgroundColor: theme.primary }]} />
        <View style={[styles.stripe, { backgroundColor: '#FCD116' }]} />
        <View style={[styles.stripe, { backgroundColor: '#CE1126' }]} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🚌</Text>
        </View>
        <Text style={styles.appName}>CamerBus</Text>
        <Text style={styles.tagline}>Cameroon's Transport Super-App</Text>
        <Text style={styles.taglineFr}>L'Application de Transport du Cameroun</Text>

        {/* Animated dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <LoadingDot key={i} delay={i * 200} />
          ))}
        </View>
      </Animated.View>

      <Text style={styles.footer}>🇨🇲 Made for Cameroon</Text>
    </LinearGradient>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.dot, { opacity: anim }]} />
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60 },
  circle1:      { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -80 },
  circle2:      { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(252,209,22,0.08)', bottom: 80, left: -60 },
  flagStripes:  { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', height: 5 },
  stripe:       { flex: 1 },
  content:      { alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' },
  logoBox:      { width: 110, height: 110, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', marginBottom: 8 },
  logoEmoji:    { fontSize: 56 },
  appName:      { fontSize: 46, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  tagline:      { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  taglineFr:    { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  dots:         { flexDirection: 'row', gap: 10, marginTop: 24 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FCD116' },
  footer:       { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});
