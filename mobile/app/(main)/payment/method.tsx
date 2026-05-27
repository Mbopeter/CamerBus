import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { PAYMENT_METHODS } from '../../../constants/data';

export default function PaymentMethodScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { paymentMethod, setPayMethod, selectedSchedule } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const handleSelect = (id: 'mtn_momo' | 'orange_money' | 'bank_transfer') => {
    setPayMethod(id);
    router.push('/(main)/payment/instructions');
  };

  // Only show methods available for the company
  const company = selectedSchedule;
  const availableMethods = PAYMENT_METHODS.filter(m => {
    if (m.id === 'mtn_momo')      return !!company?.mtn_number;
    if (m.id === 'orange_money')  return !!company?.orange_number;
    if (m.id === 'bank_transfer') return !!company?.bank_account;
    return true;
  });
  const methods = availableMethods.length > 0 ? availableMethods : PAYMENT_METHODS;

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('payment.title')}</Text>
        <Text style={styles.subtitle}>{t('payment.subtitle')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>{t('payment.instruction')}</Text>
        </View>

        {methods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, paymentMethod === method.id && styles.methodCardSelected]}
            onPress={() => handleSelect(method.id as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.methodIconWrap, { backgroundColor: method.color + '22' }]}>
              <Text style={{ fontSize: 28 }}>
                {method.id === 'mtn_momo' ? '📱' : method.id === 'orange_money' ? '🟠' : '🏦'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodHint} numberOfLines={2}>
                {t('payment.instruction')}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === method.id && styles.radioSelected]}>
              {paymentMethod === method.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: theme.background },
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 30 },
  backBtn:            { marginBottom: 12 },
  backText:           { fontSize: 26, color: '#fff' },
  title:              { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle:           { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  content:            { flex: 1, padding: 20, gap: 14, marginTop: -16 },
  infoBox:            { backgroundColor: theme.primary + '15', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoIcon:           { fontSize: 20, marginTop: 2 },
  infoText:           { flex: 1, fontSize: 13, color: theme.text, lineHeight: 20 },
  methodCard:         { backgroundColor: theme.card, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: 'transparent', shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  methodCardSelected: { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
  methodIconWrap:     { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  methodName:         { fontSize: 16, fontWeight: '700', color: theme.text },
  methodHint:         { fontSize: 12, color: theme.muted, marginTop: 4, lineHeight: 18 },
  radio:              { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected:      { borderColor: theme.primary },
  radioDot:           { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.primary },
});
