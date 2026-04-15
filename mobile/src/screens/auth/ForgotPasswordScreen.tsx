import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT, RADIUS } from '../../config/theme';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>We've sent a password reset link to {email}</Text>
            <Button title="Back to Login" onPress={() => navigation.goBack()} style={styles.btn} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
            <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} size="lg" style={styles.btn} />
            <Button title="Back to Login" onPress={() => navigation.goBack()} variant="ghost" />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  successBox: { alignItems: 'center', padding: SPACING.xl },
  successIcon: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontSize: FONT.sizes.xxl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: FONT.sizes.md, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  btn: { marginBottom: SPACING.sm },
});
