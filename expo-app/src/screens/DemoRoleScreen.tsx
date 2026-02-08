import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { useDemo } from '../demo/DemoProvider';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function DemoRoleScreen() {
  const { setRole } = useDemo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shared Ledger (Demo)</Text>
      <Text style={styles.subtitle}>
        Firebase not configured yet. You can still preview the UI.
      </Text>

      <Button label="Demo as Owner" onPress={() => setRole('OWNER')} />
      <Button
        label="Demo as Coworker"
        onPress={() => setRole('COWORKER')}
        variant="secondary"
        style={styles.secondary}
      />

      <Text style={styles.hint}>
        To enable backend: add Firebase config in expo-app/app.json.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
    justifyContent: 'center',
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
  secondary: {
    marginTop: spacing.sm,
  },
  hint: {
    marginTop: spacing.xl,
    ...typography.caption,
    color: colors.muted,
  },
});
