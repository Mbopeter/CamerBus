import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { Colors } from '../../../constants/colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function PaymentPendingScreen() {
  const { t }         = useTranslation();
  const router        = useRouter();
  const theme         = useThemeColor();
  const { bookingRef, reset } = useBookingStore();
  const pulse = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { data } = useQuery({
    queryKey: ['booking', bookingRef],
    queryFn:  () => bookingService.getByRef(bookingRef!).then(r => r.data.data),
    enabled:  !!bookingRef,
    refetchInterval: 10000, // Poll every 10s for approval
    select: (d) => d,
  });

  const status = data?.payment?.status;

  useEffect(() => {
    if (status === 'approved') {
      router.replace(`/(main)/tickets`);
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={StyleSheet.absoluteFill} />
      <View style={styles.circle1} /><View style={styles.circle2} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.icon}>⏳</Text>
        </Animated.View>

        <Text style={styles.title}>{t('payment.pending_title')}</Text>
        <Text style={styles.subtitle}>{t('payment.pending_subtitle')}</Text>

        {bookingRef && (
          <View style={styles.refCard}>
            <Text style={styles.refLabel}>{t('booking.booking_ref')}</Text>
            <Text style={styles.refValue}>{bookingRef}</Text>
          </View>
        )}

        <View style={styles.stepsWrap}>
          {[
            { icon: '📸', text: 'Proof submitted', done: true },
            { icon: '👀', text: 'Admin reviewing', done: false },
            { icon: '✅', text: 'Ticket issued',   done: false },
          ].map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepCircle, s.done && styles.stepCircleDone]}>
                <Text>{s.icon}</Text>
              </View>
              {i < 2 && <View style={[styles.stepLine, s.done && styles.stepLineDone]} />}
              <Text style={[styles.stepText, s.done && styles.stepTextDone]}>{s.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Approval usually takes 5–30 minutes during business hours. You'll receive a push notification when approved.
          </Text>
        </View>

        <TouchableOpacity style={styles.homeBtn}
          onPress={() => { reset(); router.replace('/(main)/home'); }} activeOpacity={0.85}>
          <Text style={styles.homeBtnText}>← Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(main)/tickets')} style={{ marginTop: 8 }}>
          <Text style={styles.ticketsLink}>🎫 View My Tickets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  circle1:         { position:'absolute', width:300, height:300, borderRadius:150, backgroundColor:'rgba(255,255,255,0.04)', top:-100, right:-100 },
  circle2:         { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(252,209,22,0.07)', bottom:80, left:-60 },
  content:         { flex:1, alignItems:'center', justifyContent:'center', padding:28, gap:20 },
  iconWrap:        { width:110, height:110, borderRadius:55, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.3)' },
  icon:            { fontSize:52 },
  title:           { fontSize:28, fontWeight:'800', color:'#fff', textAlign:'center' },
  subtitle:        { fontSize:15, color:'rgba(255,255,255,0.8)', textAlign:'center', lineHeight:24 },
  refCard:         { backgroundColor:'rgba(255,255,255,0.15)', borderRadius:16, padding:16, alignItems:'center', width:'100%', borderWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  refLabel:        { fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:'600', textTransform:'uppercase', letterSpacing:1 },
  refValue:        { fontSize:22, fontWeight:'800', color:'#FCD116', marginTop:6, letterSpacing:2 },
  stepsWrap:       { flexDirection:'row', alignItems:'center', gap:0, width:'100%', justifyContent:'center' },
  stepRow:         { alignItems:'center' },
  stepCircle:      { width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.3)' },
  stepCircleDone:  { backgroundColor:'rgba(0,196,140,0.3)', borderColor:'#00C48C' },
  stepLine:        { width:40, height:2, backgroundColor:'rgba(255,255,255,0.2)', marginHorizontal:4 },
  stepLineDone:    { backgroundColor:'#00C48C' },
  stepText:        { fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:6, textAlign:'center', width:60 },
  stepTextDone:    { color:'#00C48C', fontWeight:'700' },
  tipBox:          { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:14, padding:16, width:'100%' },
  tipText:         { fontSize:13, color:'rgba(255,255,255,0.85)', lineHeight:22, textAlign:'center' },
  homeBtn:         { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:14, paddingHorizontal:32, paddingVertical:14, borderWidth:1, borderColor:'rgba(255,255,255,0.3)' },
  homeBtnText:     { fontSize:16, fontWeight:'700', color:'#fff' },
  ticketsLink:     { fontSize:14, color:'#FCD116', fontWeight:'700' },
});
