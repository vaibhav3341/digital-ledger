import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { signInOrSignUpWithEmail } from '../services/auth';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Enter email and password');
      return;
    }
    try {
      setLoading(true);
      await signInOrSignUpWithEmail(email.trim(), password);
    } catch (error) {
      Alert.alert('Unable to sign in', String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shared Ledger</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <Input
        label="Email"
        value={email}
        placeholder="you@example.com"
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        value={password}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        label={loading ? 'Signing in...' : 'Continue with email'}
        onPress={handleEmail}
        disabled={loading}
      />

      <Text style={styles.hint}>
        Phone OTP requires a custom Expo build with native modules.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  hint: {
    marginTop: spacing.lg,
    ...typography.caption,
    color: colors.muted,
  },
});
