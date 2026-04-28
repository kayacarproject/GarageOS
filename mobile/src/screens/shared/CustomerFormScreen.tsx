import React, { useEffect, useState } from 'react';
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
import { LoadingSpinner }   from '../../components/common/LoadingSpinner';
import { isValidMobile }    from '../../utils/phone';
import { showToast }        from '../../utils/toast';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../config/theme';

export const CustomerFormScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const customerId: string | undefined = route.params?.id;
  const { update, fetchAll } = useCustomerStore();

  const [name,    setName]    = useState('');
  const [mobile,  setMobile]  = useState('');
  const [email,   setEmail]   = useState('');
  const [address, setAddress] = useState('');
  const [city,    setCity]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [ready,   setReady]   = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  // ── Pre-fill fields from store ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!customerId) { setReady(true); return; }

      // Ensure the store has fresh data
      await fetchAll();

      const customer = useCustomerStore.getState().customers.find(
        c => c.id === customerId,
      );
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

  const handleSave = async () => {
    if (!validate() || !customerId) return;
    setSaving(true);
    try {
      await update(customerId, {
        name:    name.trim(),
        mobile:  mobile.trim(),
        email:   email.trim()   || undefined,
        address: address.trim() || undefined,
        city:    city.trim(),
      });
      showToast('Customer updated successfully', 'success');
      navigation.goBack();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <LoadingSpinner fullScreen />;

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
          style={s.btn}
          disabled={saving}
        />
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          style={s.btn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },
  card:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  footer:    { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  btn:       { flex: 1 },
});
