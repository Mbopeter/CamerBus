import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService, bookingService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';

export default function UploadProofScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { paymentId, bookingRef } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);
  
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [passengers, setPassengers] = useState<any[]>([]);

  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['booking', bookingRef],
    queryFn: () => bookingService.getByRef(bookingRef!).then(r => r.data.data),
    enabled: !!bookingRef,
  });

  useEffect(() => {
    if (bookingData?.seats) {
      setPassengers(bookingData.seats.map((s: any) => ({
        seat_id: s.seat_id,
        seat_number: s.seat_number,
        name: s.passenger_name || '',
        id_no: s.passenger_id_no || '',
        emergency_contact: s.emergency_contact || '',
      })));
    }
  }, [bookingData]);

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

  const isFormValid = passengers.length > 0 && passengers.every(p => p.name.trim() !== '' && p.id_no.trim() !== '') && image !== null;

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!image || !paymentId || !bookingRef) throw new Error('Missing data');
      
      // 1. Update passenger info first
      await bookingService.updatePassengerInfo(bookingRef, { passengers });
      
      // 2. Upload proof of payment
      const formData = new FormData();
      formData.append('receipt', { uri: image.uri, name: image.name, type: image.type } as any);
      return paymentService.uploadProof(paymentId, formData);
    },
    onSuccess: () => {
      router.replace('/(main)/payment/pending');
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || t('errors.upload_failed') });
    },
  });

  const handleUpdate = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradientPrimary} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Finish Booking</Text>
        <Text style={styles.subtitle}>Provide passenger details and upload your payment receipt to generate your ticket.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Passenger Details Section */}
        <Text style={styles.sectionTitle}>👤 Passenger Details</Text>
        {passengers.map((p, index) => (
          <View key={p.seat_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Passenger {index + 1}</Text>
              <View style={styles.seatBadge}>
                <Text style={styles.seatBadgeText}>Seat {p.seat_number}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={p.name}
                onChangeText={(val) => handleUpdate(index, 'name', val)}
                placeholder="John Doe"
                placeholderTextColor={theme.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>National ID / Passport Number *</Text>
              <TextInput
                style={styles.input}
                value={p.id_no}
                onChangeText={(val) => handleUpdate(index, 'id_no', val)}
                placeholder="e.g. 1122334455"
                placeholderTextColor={theme.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact (Optional)</Text>
              <TextInput
                style={styles.input}
                value={p.emergency_contact}
                onChangeText={(val) => handleUpdate(index, 'emergency_contact', val)}
                placeholder="Phone Number"
                placeholderTextColor={theme.muted}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ))}

        {/* Upload Receipt Section */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>🧾 Payment Receipt</Text>
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

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!isFormValid || isPending) && { opacity: 0.5 }]}
          onPress={() => submit()}
          disabled={!isFormValid || isPending}
          activeOpacity={0.85}
        >
          <LinearGradient colors={theme.gradientPrimary} style={styles.submitBtnInner}>
            <Text style={styles.submitBtnText}>
              {isPending ? t('common.loading') : 'Submit & Generate Ticket →'}
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
  subtitle:        { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 20 },
  scroll:          { padding: 16, gap: 16, paddingBottom: 120 },
  sectionTitle:    { fontSize: 16, fontWeight: '800', color: theme.text, marginLeft: 4 },
  card:            { backgroundColor: theme.card, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:       { fontSize: 16, fontWeight: '700', color: theme.text },
  seatBadge:       { backgroundColor: theme.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  seatBadgeText:   { fontSize: 12, fontWeight: '700', color: theme.primary },
  inputGroup:      { marginBottom: 16 },
  label:           { fontSize: 13, fontWeight: '600', color: theme.textLight, marginBottom: 8 },
  input:           { borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: theme.text, backgroundColor: theme.background },
  uploadArea:      { borderRadius: 20, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', overflow: 'hidden', minHeight: 220, backgroundColor: theme.card },
  uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: 220, gap: 10 },
  uploadIcon:      { fontSize: 52 },
  uploadText:      { fontSize: 17, fontWeight: '700', color: theme.text },
  uploadSub:       { fontSize: 13, color: theme.muted },
  previewImage:    { width: '100%', height: 280 },
  imageInfo:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.primary + '15', borderRadius: 12, padding: 12 },
  imageInfoText:   { fontSize: 13, color: theme.primary, fontWeight: '600' },
  removeText:      { fontSize: 13, color: theme.danger, fontWeight: '600' },
  footer:          { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 34, backgroundColor: theme.card, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.08, shadowRadius:12, elevation:10 },
  submitBtn:       { borderRadius: 16, overflow: 'hidden' },
  submitBtnInner:  { height: 56, alignItems: 'center', justifyContent: 'center' },
  submitBtnText:   { color: '#fff', fontSize: 17, fontWeight: '700' },
});
