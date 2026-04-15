import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useCustomerStore } from '../../stores/customerStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidMobile } from '../../utils/phone';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const AddCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { create } = useCustomerStore();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!mobile.trim()) e.mobile = 'Mobile is required';
    else if (!isValidMobile(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await create({ name: name.trim(), mobile: mobile.trim(), email: email.trim() || undefined, address: address.trim() || undefined, city: city.trim() || undefined } as any);
      Alert.alert('Customer Added', `${name} has been added successfully.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Input label="Full Name *" value={name} onChangeText={setName} placeholder="e.g. Amit Patel" leftIcon="person-outline" error={errors.name} />
          <Input label="Mobile Number *" value={mobile} onChangeText={setMobile} placeholder="9876543210" leftIcon="call-outline" keyboardType="phone-pad" maxLength={10} error={errors.mobile} />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="amit@email.com" leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Address" value={address} onChangeText={setAddress} placeholder="Street, Area" leftIcon="location-outline" />
          <Input label="City" value={city} onChangeText={setCity} placeholder="e.g. Bangalore" leftIcon="business-outline" />
        </View>
      </ScrollView>
      <View style={s.footer}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={s.footerBtn} />
        <Button title="Add Customer" onPress={handleSave} loading={saving} style={s.footerBtn} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  footer: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBtn: { flex: 1 },
});
