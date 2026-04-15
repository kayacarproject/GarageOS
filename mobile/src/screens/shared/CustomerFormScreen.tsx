import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useCustomerStore } from '../../stores/customerStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { isValidMobile } from '../../utils/phone';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../config/theme';

export const CustomerFormScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const customerId: string | undefined = route.params?.id;
  const { update, fetchAll } = useCustomerStore();

  const [name, setName]       = useState('');
  const [mobile, setMobile]   = useState('');
  const [email, setEmail]     = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [ready, setReady]     = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  // ── Always fetch fresh data on mount so fields are never blank ──
  useEffect(() => {
    const load = async () => {
      if (!customerId) { setReady(true); return; }

      // Ensure store is populated
      await fetchAll();

      // Read directly from store state after fetch
      const customer = useCustomerStore.getState().customers.find(c => c.id === customerId);
      if (customer) {
        setName(customer.name ?? '');
        setMobile(customer.mobile ?? customer.phone ?? '');
        setEmail(customer.email ?? '');
        setAddress(customer.address ?? '');
        setCity(customer.city ?? '');
      }
      setReady(true);
    };
    load();
  }, [customerId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())   e.name   = 'Name is required';
    if (!mobile.trim()) e.mobile = 'Mobile is required';
    else if (!isValidMobile(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !customerId) return;
    setSaving(true);
    try {
      await update(customerId, {
        name:    name.trim(),
        mobile:  mobile.trim(),
        phone:   mobile.trim(),
        email:   email.trim() || undefined,
        address: address.trim() || undefined,
        city:    city.trim() || undefined,
      });
      Alert.alert('Saved', `${name} has been updated.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <LoadingSpinner fullScreen />;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Input label="Full Name *"      value={name}    onChangeText={setName}    placeholder="e.g. Amit Patel"    leftIcon="person-outline"   error={errors.name} />
          <Input label="Mobile Number *"  value={mobile}  onChangeText={setMobile}  placeholder="9876543210"          leftIcon="call-outline"     keyboardType="phone-pad" maxLength={10} error={errors.mobile} />
          <Input label="Email"            value={email}   onChangeText={setEmail}   placeholder="amit@email.com"      leftIcon="mail-outline"     keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Address"          value={address} onChangeText={setAddress} placeholder="Street, Area"        leftIcon="location-outline" />
          <Input label="City"             value={city}    onChangeText={setCity}    placeholder="e.g. Bangalore"      leftIcon="business-outline" />
        </View>
      </ScrollView>
      <View style={s.footer}>
        <Button title="Cancel"       onPress={() => navigation.goBack()} variant="outline" style={s.btn} />
        <Button title="Save Changes" onPress={handleSave} loading={saving}              style={s.btn} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },
  card:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  footer:    { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  btn:       { flex: 1 },
});
