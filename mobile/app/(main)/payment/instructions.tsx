import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { PAYMENT_METHODS } from '../../../constants/data';

export default function PaymentInstructionsScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { paymentMethod, selectedSchedule, selectedSeats } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  const method = PAYMENT_METHODS.find(m => m.id === paymentMethod) ?? PAYMENT_METHODS[0];

  const pricePerSeat = selectedSchedule
    ? Number(selectedSchedule.bus_type === 'VIP' ? selectedSchedule.price_vip : selectedSchedule.price_standard)
    : 0;
  const ticketTotal   = pricePerSeat * selectedSeats.length;
  const PLATFORM_FEE  = ticketTotal * 0.03;
  const total         = ticketTotal + PLATFORM_FEE;

  const getPaymentDetails = () => {
    if (paymentMethod === 'mtn_momo')     return { name: selectedSchedule?.mtn_name,    number: selectedSchedule?.mtn_number };
    if (paymentMethod === 'orange_money') return { name: selectedSchedule?.orange_name, number: selectedSchedule?.orange_number };
    return { name: selectedSchedule?.bank_account_name, number: selectedSchedule?.bank_account, bank: selectedSchedule?.bank_name };
  };
  const details = getPaymentDetails();

  const copyNumber = async (num: string) => {
    await Clipboard.setStringAsync(num);
    Alert.alert('Copied!', `${num} copied to clipboard`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('payment.title')}</Text>
        <Text style={styles.subtitle}>{method.name}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount to pay */}
        <View style={styles.amountCard}>
          <LinearGradient colors={theme.gradientPrimary} style={styles.amountInner}>
            <Text style={styles.amountLabel}>{t('payment.amount_to_pay')}</Text>
            <Text style={styles.amount}>{total.toLocaleString()} XAF</Text>
            <Text style={styles.amountSub}>{selectedSeats.length} seat(s) × {pricePerSeat.toLocaleString()} XAF</Text>
          </LinearGradient>
          {/* Platform fee breakdown */}
          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>🎫 Ticket price ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})</Text>
              <Text style={styles.feeValue}>{ticketTotal.toLocaleString()} XAF</Text>
            </View>
            <View style={[styles.feeRow, styles.platformFeeRow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.platformFeeLabel}>⚡ Platform charge</Text>
                <Text style={styles.platformFeeNote}>Secure booking & processing fee</Text>
              </View>
              <Text style={styles.platformFeeAmount}>+ {PLATFORM_FEE.toLocaleString()} XAF</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeTotalLabel}>💳 Total to transfer</Text>
              <Text style={styles.feeTotalValue}>{total.toLocaleString()} XAF</Text>
            </View>
          </View>
        </View>

        {/* Pay to */}
        <View style={styles.payCard}>
          <Text style={styles.payCardTitle}>{t('payment.pay_to')}</Text>

          {paymentMethod !== 'bank_transfer' ? (
            <>
              <View style={styles.payDetail}>
                <Text style={styles.payDetailLabel}>{t('payment.account_name')}</Text>
                <Text style={styles.payDetailValue}>{details.name}</Text>
              </View>
              <View style={styles.payDetail}>
                <Text style={styles.payDetailLabel}>{t('payment.account_number')}</Text>
                <TouchableOpacity style={styles.numberRow} onPress={() => copyNumber(details.number ?? '')}>
                  <Text style={styles.numberText}>{details.number}</Text>
                  <Text style={styles.copyBtn}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.payDetail}>
                <Text style={styles.payDetailLabel}>{t('payment.bank_name')}</Text>
                <Text style={styles.payDetailValue}>{(details as any).bank}</Text>
              </View>
              <View style={styles.payDetail}>
                <Text style={styles.payDetailLabel}>{t('payment.account_name')}</Text>
                <Text style={styles.payDetailValue}>{details.name}</Text>
              </View>
              <View style={styles.payDetail}>
                <Text style={styles.payDetailLabel}>{t('payment.account_number')}</Text>
                <TouchableOpacity style={styles.numberRow} onPress={() => copyNumber(details.number ?? '')}>
                  <Text style={styles.numberText}>{details.number}</Text>
                  <Text style={styles.copyBtn}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>📋 How to Pay</Text>
          {[
            `Open your ${method.nameShort} app`,
            `Send exactly ${total.toLocaleString()} XAF to ${details.number} (includes ${PLATFORM_FEE.toLocaleString()} XAF platform charge)`,
            'Take a screenshot of the successful transfer',
            'Come back here and upload your screenshot',
            'Wait for admin approval (usually within 30 mins)',
            'Get your QR ticket automatically!',
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>{t('payment.screenshot_tip')}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/(main)/payment/upload-proof')} activeOpacity={0.85}>
          <LinearGradient colors={theme.gradientPrimary} style={styles.nextBtnInner}>
            <Text style={styles.nextBtnText}>📸 {t('payment.upload_proof')} →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: theme.background },
  header:          { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn:         { marginBottom: 12 },
  backText:        { fontSize: 26, color: '#fff' },
  title:           { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle:        { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  scroll:          { padding: 16, gap: 14, paddingBottom: 100 },
  amountCard:      { borderRadius: 20, overflow: 'hidden' },
  amountInner:     { padding: 28, alignItems: 'center' },
  amountLabel:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  amount:          { fontSize: 42, fontWeight: '900', color: '#fff', marginVertical: 8 },
  amountSub:       { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  feeBreakdown:    { backgroundColor: 'rgba(0,0,0,0.04)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 16, gap: 0 },
  feeRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  feeLabel:        { fontSize: 13, color: '#444', fontWeight: '500' },
  feeValue:        { fontSize: 13, color: '#333', fontWeight: '700' },
  platformFeeRow:  { backgroundColor: '#FFF3CD', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, marginVertical: 4 },
  platformFeeLabel:{ fontSize: 13, color: '#856404', fontWeight: '800' },
  platformFeeNote: { fontSize: 11, color: '#856404', opacity: 0.8, marginTop: 2 },
  platformFeeAmount:{ fontSize: 15, fontWeight: '900', color: '#856404' },
  feeDivider:      { height: 1, backgroundColor: '#C3E6CB', marginVertical: 4 },
  feeTotalLabel:   { fontSize: 14, fontWeight: '800', color: theme.primary },
  feeTotalValue:   { fontSize: 16, fontWeight: '900', color: theme.primary },
  payCard:         { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  payCardTitle:    { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 16 },
  payDetail:       { borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 12 },
  payDetailLabel:  { fontSize: 12, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  payDetailValue:  { fontSize: 16, fontWeight: '700', color: theme.text, marginTop: 4 },
  numberRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  numberText:      { fontSize: 24, fontWeight: '900', color: theme.primary, letterSpacing: 2 },
  copyBtn:         { fontSize: 13, color: theme.primary, fontWeight: '700', backgroundColor: theme.primary + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  stepsCard:       { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  stepsTitle:      { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 16 },
  step:            { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepNum:         { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText:     { fontSize: 13, fontWeight: '800', color: '#fff' },
  stepText:        { fontSize: 14, color: theme.textLight, lineHeight: 22, flex: 1 },
  warningBox:      { backgroundColor: '#FFF9C4', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 10 },
  warningIcon:     { fontSize: 20 },
  warningText:     { flex: 1, fontSize: 13, color: theme.text, lineHeight: 20 },
  footer:          { padding: 20, paddingBottom: 34, backgroundColor: theme.card, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.08, shadowRadius:12, elevation:10 },
  nextBtn:         { borderRadius: 16, overflow: 'hidden' },
  nextBtnInner:    { height: 56, alignItems: 'center', justifyContent: 'center' },
  nextBtnText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
});