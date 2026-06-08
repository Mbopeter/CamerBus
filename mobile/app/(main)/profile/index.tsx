import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/useAuthStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { Ticket, Package, Bell, Settings, CircleHelp, Info, User, Smartphone, Mail, Globe, ChevronRight, LogOut } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { t }          = useTranslation();
  const router         = useRouter();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const handleLogout = () => {
    Alert.alert(t('auth.logout'), 'Are you sure you want to logout?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.logout'), style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  const menuItems = [
    { icon: <Ticket size={20} color={theme.text} />, label: t('profile.my_tickets'),    onPress: () => router.push('/(main)/tickets') },
    { icon: <Package size={20} color={theme.text} />, label: t('profile.my_parcels'),    onPress: () => router.push('/(main)/parcels') },
    { icon: <Bell size={20} color={theme.text} />, label: t('profile.notifications'), onPress: () => router.push('/(main)/notifications') },
    { icon: <Settings size={20} color={theme.text} />, label: t('profile.settings'),      onPress: () => router.push('/(main)/profile/settings') },
    { icon: <CircleHelp size={20} color={theme.text} />, label: t('profile.help'),           onPress: () => {} },
    { icon: <Info size={20} color={theme.text} />, label: t('profile.about'),          onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <ImageBackground source={require('../../../assets/bgimage.jpg')} style={styles.header} resizeMode="cover">
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,20,50,0.72)' }} pointerEvents="none" />
        <View style={styles.circle} />
        <Image
          source={require('../../../assets/dark.logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.avatarWrap}>
          <User size={44} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.full_name ?? 'Guest'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Smartphone size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>
        {user?.email && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Mail size={13} color="rgba(255,255,255,0.65)" />
            <Text style={styles.email}>{user.email}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.editBtn} onPress={() => {}} activeOpacity={0.85}>
          <Text style={styles.editBtnText}>{t('profile.edit')}</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Language Toggle */}
      <View style={styles.langCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Globe size={18} color={theme.text} />
          <Text style={styles.langTitle}>{t('profile.language')}</Text>
        </View>
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langOption, language === 'en' && styles.langOptionActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langOptionText, language === 'en' && styles.langOptionTextActive]}>🇬🇧 English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langOption, language === 'fr' && styles.langOptionActive]}
            onPress={() => setLanguage('fr')}
          >
            <Text style={[styles.langOptionText, language === 'fr' && styles.langOptionTextActive]}>🇫🇷 Français</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(({ icon, label, onPress }) => (
          <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.menuIcon}>{icon}</View>
            <Text style={styles.menuLabel}>{label}</Text>
            <ChevronRight size={22} color={theme.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LogOut size={20} color={theme.danger} />
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.brandFooter}>
        <Image
          source={require('../../../assets/lightlogo.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
        <Text style={styles.version}>{t('profile.version', { version: '1.0.0' })}</Text>
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: theme.background },
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center', overflow: 'hidden' },
  circle:             { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.05)', top:-80, right:-80 },
  headerLogo:         { width: width * 0.65, height: width * 0.33, marginBottom: 14 },
  avatarWrap:         { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  name:               { fontSize: 24, fontWeight: '800', color: '#fff' },
  phone:              { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  email:              { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  editBtn:            { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 8, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  editBtnText:        { color: '#fff', fontSize: 14, fontWeight: '700' },
  langCard:           { margin: 16, backgroundColor: theme.card, borderRadius: 20, padding: 18, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  langTitle:          { fontSize: 15, fontWeight: '800', color: theme.text },
  langToggle:         { flexDirection: 'row', backgroundColor: theme.background, borderRadius: 14, padding: 4, gap: 4 },
  langOption:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  langOptionActive:   { backgroundColor: theme.primary },
  langOptionText:     { fontSize: 14, fontWeight: '700', color: theme.textLight },
  langOptionTextActive: { color: '#fff' },
  menu:               { margin: 16, backgroundColor: theme.card, borderRadius: 20, overflow: 'hidden', shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  menuItem:           { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 14 },
  menuIcon:           { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  menuLabel:          { flex: 1, fontSize: 15, fontWeight: '600', color: theme.text },
  logoutBtn:          { margin: 16, backgroundColor: theme.danger + '15', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1.5, borderColor: theme.danger + '30' },
  logoutText:         { fontSize: 16, fontWeight: '700', color: theme.danger },
  brandFooter:        { alignItems: 'center', gap: 4, marginTop: 8 },
  footerLogo:         { width: width * 0.58, height: width * 0.30 },
  version:            { textAlign: 'center', fontSize: 12, color: theme.muted },
});
