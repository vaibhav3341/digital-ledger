import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import LedgerItem from '../components/LedgerItem';
import { useDemo } from '../demo/DemoProvider';
import { calcBalance } from '../utils/balance';
import { formatAmount } from '../utils/format';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Button from '../components/Button';

export default function DemoCoworkerLedgerScreen() {
  const { user, transactionsByCoworker, signOut } = useDemo();
  const coworkerId = user?.coworkerId;
  const transactions = coworkerId ? transactionsByCoworker[coworkerId] || [] : [];
  const balance = calcBalance(transactions);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>My Ledger</Text>
        <Button label="Sign out" onPress={signOut} variant="ghost" />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceValue}>{formatAmount(balance)}</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.txnId}
        renderItem={({ item }) => <LedgerItem item={item} />}
        ListEmptyComponent={
          <EmptyState title="No transactions" subtitle="No entries yet." />
        }
        contentContainerStyle={
          transactions.length === 0 ? styles.emptyContainer : styles.listContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.muted,
  },
  balanceValue: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
