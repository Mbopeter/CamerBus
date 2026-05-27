import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';

export default function UploadProofScreen() {
  const { t }     = useTranslation();
  const router    = useRouter();
  const { paymentId } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow photo access to upload your payment proof.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() ?? 'receipt.jpg';
      const type = asset.type ?? 'image/jpeg';
      setImage({ uri: asset.uri, name: filename, type });
    }
  };

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!image || !paymentId) throw new Error('No image or payment');
      const formData = new FormData();
      formData.append('receipt', { uri: image.uri, name: image.name, type: image.type } as any);
      return paymentService.uploadProof(paymentId, formData);
    },
    onSuccess: () => {
      router.replace('/(main)/payment/pending');
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: t('errors.upload_failed') });
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('payment.upload_proof')}</Text>
        <Text style={styles.subtitle}>{t('payment.screenshot_tip')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Upload Area */}
        <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.8}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📸</Text>
              <Text style={styles.uploadText}>{t('payment.choose_screenshot')}</Text>
              <Text style={styles.uploadSub}>JPG, PNG up to 5MB</Text>
            </View>
          )}
        </TouchableOpacity>

        {image && (
          <View style={styles.imageInfo}>
            <Text style={styles.imageInfoText}>✅ {image.name}</Text>
            <TouchableOpacity onPress={() => setImage(null)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📋 Your screenshot must show:</Text>
          {['Transaction amount', 'Date & time of transfer', "Recipient's number/account", 'Transaction reference/ID', 'Success confirmation'].map((tip, i) => (
            <View key={i} style={styles.tip}>
              <Text style={styles.tipCheck}>✓</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!image || isPending) && { opacity: 0.5 }]}
          onPress={() => submit()}
          disabled={Boolean(!image || isPending)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={theme.gradientPrimary} style={styles.submitBtnInner}>
            <Text style={styles.submitBtnText}>
              {isPending ? t('common.loading') : t('payment.submit_proof')} →
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: theme.background },
  header:          { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28 },
  backBtn:         { marginBottom: 12 },
  backText:        { fontSize: 26, color: '#fff' },
  title:           { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle:        { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 20 },
  scroll:          { padding: 20, gap: 16, paddingBottom: 120 },
  uploadArea:      { borderRadius: 20, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', overflow: 'hidden', minHeight: 220, backgroundColor: theme.card },
  uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: 220, gap: 10 },
  uploadIcon:      { fontSize: 52 },
  uploadText:      { fontSize: 17, fontWeight: '700', color: theme.text },
  uploadSub:       { fontSize: 13, color: theme.muted },
  previewImage:    { width: '100%', height: 280 },
  imageInfo:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.primary + '15', borderRadius: 12, padding: 12 },
  imageInfoText:   { fontSize: 13, color: theme.primary, fontWeight: '600' },
  removeText:      { fontSize: 13, color: theme.danger, fontWeight: '600' },
  tipsCard:        { backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.07, shadowRadius:12, elevation:4 },
  tipsTitle:       { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 14 },
  tip:             { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tipCheck:        { fontSize: 16, color: theme.success, fontWeight: '800' },
  tipText:         { fontSize: 14, color: theme.textLight },
  footer:          { padding: 20, paddingBottom: 34, backgroundColor: theme.card, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.08, shadowRadius:12, elevation:10 },
  submitBtn:       { borderRadius: 16, overflow: 'hidden' },
  submitBtnInner:  { height: 56, alignItems: 'center', justifyContent: 'center' },
  submitBtnText:   { color: '#fff', fontSize: 17, fontWeight: '700' },
});
