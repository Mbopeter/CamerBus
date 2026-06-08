import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { ArrowLeft, Palette, Settings, Sun, Moon, Globe, Bell, Info, Check } from 'lucide-react-native';

export default function SettingsScreen() {
  const { t }     = useTranslation();
  const router    = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const theme = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.settings') || 'Settings'}</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Palette size={20} color={theme.text} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Theme / Thème</Text>
          </View>
          <View style={styles.langToggle}>
            {[
              { code: 'system' as const, label: 'System', icon: <Settings size={18} color={themeMode === 'system' ? theme.primary : theme.textLight} /> },
              { code: 'light' as const, label: 'Light', icon: <Sun size={18} color={themeMode === 'light' ? theme.primary : theme.textLight} /> },
              { code: 'dark' as const, label: 'Dark', icon: <Moon size={18} color={themeMode === 'dark' ? theme.primary : theme.textLight} /> }
            ].map(m => (
              <TouchableOpacity key={m.code}
                style={[
                  styles.langOpt, 
                  { borderColor: theme.border },
                  themeMode === m.code && { borderColor: theme.primary, backgroundColor: themeMode === 'dark' ? theme.primary + '30' : theme.primary + '15' }
                ]}
                onPress={() => setThemeMode(m.code)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {m.icon}
                  <Text style={[
                    styles.langOptText, 
                    { color: theme.textLight },
                    themeMode === m.code && { color: theme.primary, fontWeight: '700' }
                  ]}>{m.label}</Text>
                </View>
                {themeMode === m.code && <Check size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Globe size={20} color={theme.text} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Language / Langue</Text>
          </View>
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
                {language === l.code && <Check size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bell size={20} color={theme.text} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Notifications</Text>
          </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Info size={20} color={theme.text} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>About</Text>
          </View>
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
  title:           { fontSize: 26, fontWeight: '800', color: '#fff' },
  scroll:          { padding: 16, gap: 16, paddingBottom: 80 },
  section:         { borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  sectionTitle:    { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  langToggle:      { gap: 10 },
  langOpt:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 2 },
  langOptText:     { fontSize: 16, fontWeight: '600' },
  settingRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  settingLabel:    { fontSize: 15 },
  aboutRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  aboutKey:        { fontSize: 14 },
  aboutVal:        { fontSize: 14, fontWeight: '600' },
});
