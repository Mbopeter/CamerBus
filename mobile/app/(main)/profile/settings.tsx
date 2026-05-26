import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function SettingsScreen() {
  const { t }     = useTranslation();
  const router    = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const theme = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.settings') || 'Settings'}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🎨 Theme / Thème</Text>
          <View style={styles.langToggle}>
            {[
              { code: 'system' as const, label: '⚙️ System' },
              { code: 'light' as const, label: '☀️ Light' },
              { code: 'dark' as const, label: '🌙 Dark' }
            ].map(m => (
              <TouchableOpacity key={m.code}
                style={[
                  styles.langOpt, 
                  { borderColor: theme.border },
                  themeMode === m.code && { borderColor: theme.primary, backgroundColor: themeMode === 'dark' ? theme.primary + '30' : theme.primary + '15' }
                ]}
                onPress={() => setThemeMode(m.code)}>
                <Text style={[
                  styles.langOptText, 
                  { color: theme.textLight },
                  themeMode === m.code && { color: theme.primary, fontWeight: '700' }
                ]}>{m.label}</Text>
                {themeMode === m.code && <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🌍 Language / Langue</Text>
          <View style={styles.langToggle}>
            {[{ code: 'en' as const, label: '🇬🇧 English' }, { code: 'fr' as const, label: '🇫🇷 Français' }].map(l => (
              <TouchableOpacity key={l.code}
                style={[
                  styles.langOpt, 
                  { borderColor: theme.border },
                  language === l.code && { borderColor: theme.primary, backgroundColor: themeMode === 'dark' ? theme.primary + '30' : theme.primary + '15' }
                ]}
                onPress={() => setLanguage(l.code)}>
                <Text style={[
                  styles.langOptText, 
                  { color: theme.textLight },
                  language === l.code && { color: theme.primary, fontWeight: '700' }
                ]}>{l.label}</Text>
                {language === l.code && <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🔔 Notifications</Text>
          {[
            'Booking confirmations',
            'Payment approvals',
            'Departure reminders',
            'Parcel updates',
          ].map(item => (
            <View key={item} style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{item}</Text>
              <Switch value={true} trackColor={{ true: theme.primary, false: theme.border }} onValueChange={() => {}} />
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>ℹ️ About</Text>
          {[
            ['Version', '1.0.0'],
            ['Build', '2025.01'],
            ['Country', '🇨🇲 Cameroon'],
          ].map(([k, v]) => (
            <View key={k} style={[styles.aboutRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.aboutKey, { color: theme.muted }]}>{k}</Text>
              <Text style={[styles.aboutVal, { color: theme.text }]}>{v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn:         { marginBottom: 12 },
  backText:        { fontSize: 26, color: '#fff' },
  title:           { fontSize: 26, fontWeight: '800', color: '#fff' },
  scroll:          { padding: 16, gap: 16, paddingBottom: 80 },
  section:         { borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  sectionTitle:    { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  langToggle:      { gap: 10 },
  langOpt:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 2 },
  langOptText:     { fontSize: 16, fontWeight: '600' },
  checkmark:       { fontSize: 18, fontWeight: '800' },
  settingRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  settingLabel:    { fontSize: 15 },
  aboutRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  aboutKey:        { fontSize: 14 },
  aboutVal:        { fontSize: 14, fontWeight: '600' },
});
