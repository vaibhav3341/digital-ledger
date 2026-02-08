import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ApplicationVerifier, ConfirmationResult } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import Button from '../components/Button';
import Input from '../components/Input';
import { sendOtp, confirmOtp, signInOrSignUpWithEmail } from '../services/auth';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { app } from '../services/firebase';

export default function AuthScreen() {
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useEmail, setUseEmail] = useState(false);
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Enter phone number');
      return;
    }
    try {
      setLoading(true);
      const result = await sendOtp(
        phoneNumber,
        recaptchaVerifier.current as unknown as ApplicationVerifier,
      );
      setConfirmation(result);
    } catch (error) {
      Alert.alert('Failed to send OTP', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!confirmation) {
      return;
    }
    try {
      setLoading(true);
      await confirmOtp(confirmation, code);
    } catch (error) {
      Alert.alert('Invalid code', String(error));
    } finally {
      setLoading(false);
    }
  };

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
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={app.options} />
      <Text style={styles.title}>Shared Ledger</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      {useEmail ? (
        <>
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
          <Button
            label="Use phone instead"
            onPress={() => setUseEmail(false)}
            variant="ghost"
            style={styles.switchButton}
          />
        </>
      ) : (
        <>
          <Input
            label="Phone number"
            value={phoneNumber}
            placeholder="+91XXXXXXXXXX"
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          {confirmation ? (
            <>
              <Input
                label="OTP"
                value={code}
                placeholder="123456"
                onChangeText={setCode}
                keyboardType="numeric"
              />
              <Button
                label={loading ? 'Verifying...' : 'Verify'}
                onPress={handleVerify}
                disabled={loading}
              />
            </>
          ) : (
            <Button
              label={loading ? 'Sending...' : 'Send OTP'}
              onPress={handleSendOtp}
              disabled={loading}
            />
          )}
          <Button
            label="Use email instead"
            onPress={() => setUseEmail(true)}
            variant="ghost"
            style={styles.switchButton}
          />
        </>
      )}
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
  switchButton: {
    marginTop: spacing.md,
  },
});
