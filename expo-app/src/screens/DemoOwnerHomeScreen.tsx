import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import CoworkerCard from '../components/CoworkerCard';
import EmptyState from '../components/EmptyState';
import { useDemo } from '../demo/DemoProvider';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { calcBalance } from '../utils/balance';

export default function DemoOwnerHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { coworkers, transactionsByCoworker, signOut } = useDemo();

  const balances = useMemo(() => {
    const next: Record<string, { balance: number; lastActivity: Date | null }> = {};
    coworkers.forEach((c) => {
      const txns = transactionsByCoworker[c.id] || [];
      next[c.id] = {
        balance: calcBalance(txns),
        lastActivity: txns.length ? txns[0].timestamp.toDate() : null,
      };
    });
    return next;
  }, [coworkers, transactionsByCoworker]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coworkers</Text>
        <Button label="Sign out" onPress={signOut} variant="ghost" />
      </View>

      <FlatList
        data={coworkers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CoworkerCard
            name={item.name}
            balance={balances[item.id]?.balance ?? 0}
            lastActivity={balances[item.id]?.lastActivity}
            onPress={() =>
              navigation.navigate('CoworkerDetail', {
                coworkerId: item.id,
                name: item.name,
              })
            }
          />
        )}
        contentContainerStyle={
          coworkers.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={
          <EmptyState
            title="No coworkers yet"
            subtitle="This is demo data."
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
