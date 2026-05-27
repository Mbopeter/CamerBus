import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingService } from '../../../services/endpoints';
import { useBookingStore } from '../../../store/useBookingStore';
import { useThemeColor } from '../../../hooks/useThemeColor';
import Toast from 'react-native-toast-message';

export default function PassengerInfoScreen() {
  const router = useRouter();
  const { bookingRef } = useBookingStore();
  const theme = useThemeColor();
  const styles = getStyles(theme);

  // All hooks must be declared before any conditional return
  const [passengers, setPassengers] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingRef],
    queryFn: () => bookingService.getByRef(bookingRef!).then(r => r.data.data),
    enabled: !!bookingRef,
  });

  useEffect(() => {
    // Guard: if no booking ref, redirect home
    if (!bookingRef) {
      router.replace('/(main)/home');
    }
  }, [bookingRef]);

  useEffect(() => {
    if (data?.seats) {
      setPassengers(data.seats.map((s: any) => ({
        seat_id: s.seat_id,
        seat_number: s.seat_number,
        name: s.passenger_name || '',
        id_no: s.passenger_id_no || '',
        emergency_contact: s.emergency_contact || '',
      })));
    }
  }, [data]);

  const { mutate: updateInfo, isPending } = useMutation({
    mutationFn: () => bookingService.updatePassengerInfo(bookingRef!, { passengers }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Information Saved', text2: 'Your ticket is now ready.' });
      router.replace('/(main)/tickets');
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to save information' });
    },
  });

  const handleUpdate = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const isFormValid = passengers.length > 0 && passengers.every(p => p.name.trim() !== '' && p.id_no.trim() !== '');

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
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 26, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Passenger Details</Text>
        <Text style={styles.subtitle}>Provide ID details for all passengers to generate the ticket.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!isFormValid || isPending) && { opacity: 0.5 }]}
          onPress={() => updateInfo()}
          disabled={!isFormValid || isPending}
        >
          <LinearGradient colors={theme.gradientPrimary} style={styles.submitBtnInner}>
            <Text style={styles.submitBtnText}>
              {isPending ? 'Saving...' : 'Generate Ticket →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  scroll: { padding: 16, paddingBottom: 120, gap: 16 },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  seatBadge: { backgroundColor: theme.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  seatBadgeText: { fontSize: 12, fontWeight: '700', color: theme.primary },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textLight, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: theme.text, backgroundColor: theme.background },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, padding: 20, paddingBottom: 34, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  submitBtn: { borderRadius: 16, overflow: 'hidden' },
  submitBtnInner: { paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
