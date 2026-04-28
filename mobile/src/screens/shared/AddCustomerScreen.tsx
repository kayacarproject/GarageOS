import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCustomerStore } from '../../stores/customerStore';
import { Input }            from '../../components/common/Input';
import { Button }           from '../../components/common/Button';
import { isValidMobile }    from '../../utils/phone';
import { showToast }        from '../../utils/toast';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../config/theme';

export const AddCustomerScreen: React.FC<{ route: any; navigation: any }> = ({
  navigation,
}) => {
  const { create } = useCustomerStore();

  const [name,    setName]    = useState('');
  const [mobile,  setMobile]  = useState('');
  const [email,   setEmail]   = useState('');
  const [address, setAddress] = useState('');
  const [city,    setCity]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim())                                               e.name   = 'Full name is required';
    if (!mobile.trim())                                             e.mobile = 'Mobile number is required';
    else if (!isValidMobile(mobile))                                e.mobile = 'Enter a valid 10-digit mobile number';
    if (!city.trim())                                               e.city   = 'City is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email  = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearForm = () => {
    setName(''); setMobile(''); setEmail(''); setAddress(''); setCity('');
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await create({
        name:    name.trim(),
        mobile:  mobile.trim(),
        email:   email.trim()   || undefined,
        address: address.trim() || undefined,
        city:    city.trim(),
      });
      showToast('Customer added successfully', 'success');
      clearForm();
      navigation.goBack();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add customer. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <Input
            label="Full Name *"
            value={name}
            onChangeText={t => { setName(t); setErrors(e => ({ ...e, name: '' })); }}
            placeholder="e.g. Amit Patel"
            leftIcon="person-outline"
            error={errors.name}
          />
          <Input
            label="Mobile Number *"
            value={mobile}
            onChangeText={t => { setMobile(t); setErrors(e => ({ ...e, mobile: '' })); }}
            placeholder="9876543210"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.mobile}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
            placeholder="amit@email.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, Area"
            leftIcon="location-outline"
          />
          <Input
            label="City *"
            value={city}
            onChangeText={t => { setCity(t); setErrors(e => ({ ...e, city: '' })); }}
            placeholder="e.g. Bangalore"
            leftIcon="business-outline"
            error={errors.city}
          />
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={s.footerBtn}
          disabled={saving}
        />
        <Button
          title="Add Customer"
          onPress={handleSave}
          loading={saving}
          style={s.footerBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  content:    { padding: SPACING.md, paddingBottom: 100 },
  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  footer:     { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBtn:  { flex: 1 },
});
