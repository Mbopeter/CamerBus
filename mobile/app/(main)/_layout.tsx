import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '../../hooks/useThemeColor';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  const theme = useThemeColor();
  const styles = getStyles(theme);
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function MainLayout() {
  const { t } = useTranslation();
  const theme = useThemeColor();
  const styles = getStyles(theme);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarShowLabel: false,
      }}
    >
      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="search/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tickets/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎫" label="Tickets" focused={focused} /> }}
      />
      <Tabs.Screen
        name="parcels/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Parcels" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />

      {/* ── Hidden screens (part of tab navigator but no tab button) ── */}
      <Tabs.Screen name="companies/index"          options={{ href: null }} />
      <Tabs.Screen name="companies/[id]"           options={{ href: null }} />
      <Tabs.Screen name="booking/branch-search"    options={{ href: null }} />
      <Tabs.Screen name="booking/seats"            options={{ href: null }} />
      <Tabs.Screen name="booking/summary"          options={{ href: null }} />
      <Tabs.Screen name="payment/method"           options={{ href: null }} />
      <Tabs.Screen name="payment/instructions"     options={{ href: null }} />
      <Tabs.Screen name="payment/upload-proof"     options={{ href: null }} />
      <Tabs.Screen name="payment/pending"          options={{ href: null }} />
      <Tabs.Screen name="tickets/[code]"           options={{ href: null }} />
      <Tabs.Screen name="tickets/passenger-info"   options={{ href: null }} />
      <Tabs.Screen name="parcels/send"             options={{ href: null }} />
      <Tabs.Screen name="parcels/track"            options={{ href: null }} />
      <Tabs.Screen name="tracking/[id]"            options={{ href: null }} />
      <Tabs.Screen name="notifications/index"      options={{ href: null }} />
      <Tabs.Screen name="profile/settings"         options={{ href: null }} />
      <Tabs.Screen name="admin/index"              options={{ href: null }} />
    </Tabs>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  tabBar: {
    backgroundColor: theme.card,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
  },
  tabIcon:          { alignItems: 'center', gap: 2, paddingTop: 4 },
  emoji:            { fontSize: 22, opacity: 0.5 },
  emojiFocused:     { opacity: 1 },
  tabLabel:         { fontSize: 10, color: theme.muted, fontWeight: '500' },
  tabLabelFocused:  { color: theme.primary, fontWeight: '700' },
  dot:              { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.primary, marginTop: 2 },
});
