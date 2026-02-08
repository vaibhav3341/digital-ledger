import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from '../hooks/useAuth';
import AuthScreen from '../screens/AuthScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import JoinInviteScreen from '../screens/JoinInviteScreen';
import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import CoworkerDetailScreen from '../screens/CoworkerDetailScreen';
import AddEditTransactionScreen from '../screens/AddEditTransactionScreen';
import InviteCoworkerScreen from '../screens/InviteCoworkerScreen';
import CoworkerLedgerScreen from '../screens/CoworkerLedgerScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { firebaseEnabled } from '../services/env';
import DemoRoleScreen from '../screens/DemoRoleScreen';
import DemoOwnerHomeScreen from '../screens/DemoOwnerHomeScreen';
import DemoCoworkerDetailScreen from '../screens/DemoCoworkerDetailScreen';
import DemoAddEditTransactionScreen from '../screens/DemoAddEditTransactionScreen';
import DemoCoworkerLedgerScreen from '../screens/DemoCoworkerLedgerScreen';
import { useDemo } from '../demo/DemoProvider';

export type RootStackParamList = {
  Auth: undefined;
  RoleSelect: undefined;
  JoinInvite: { name: string; phone?: string } | undefined;
  OwnerHome: undefined;
  CoworkerDetail: { coworkerId: string; name: string };
  AddEditTransaction: { coworkerId: string; txnId?: string };
  InviteCoworker: undefined;
  CoworkerLedger: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const demo = useDemo();

  if (!firebaseEnabled) {
    if (!demo.user) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={DemoRoleScreen} />
        </Stack.Navigator>
      );
    }

    if (demo.user.role === 'OWNER') {
      return (
        <Stack.Navigator>
          <Stack.Screen
            name="OwnerHome"
            component={DemoOwnerHomeScreen}
            options={{ title: 'Coworkers' }}
          />
          <Stack.Screen
            name="CoworkerDetail"
            component={DemoCoworkerDetailScreen}
            options={({ route }) => ({ title: route.params.name })}
          />
          <Stack.Screen
            name="AddEditTransaction"
            component={DemoAddEditTransactionScreen}
            options={{ title: 'Transaction' }}
          />
        </Stack.Navigator>
      );
    }

    return (
      <Stack.Navigator>
        <Stack.Screen
          name="CoworkerLedger"
          component={DemoCoworkerLedgerScreen}
          options={{ title: 'My Ledger' }}
        />
      </Stack.Navigator>
    );
  }

  const { authUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (!profile) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelectScreen}
          options={{ title: 'Set up' }}
        />
        <Stack.Screen
          name="JoinInvite"
          component={JoinInviteScreen}
          options={{ title: 'Join Ledger' }}
        />
      </Stack.Navigator>
    );
  }

  if (profile.role === 'OWNER') {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="OwnerHome"
          component={OwnerHomeScreen}
          options={{ title: 'Coworkers' }}
        />
        <Stack.Screen
          name="InviteCoworker"
          component={InviteCoworkerScreen}
          options={{ title: 'Add Coworker' }}
        />
        <Stack.Screen
          name="CoworkerDetail"
          component={CoworkerDetailScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen
          name="AddEditTransaction"
          component={AddEditTransactionScreen}
          options={{ title: 'Transaction' }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CoworkerLedger"
        component={CoworkerLedgerScreen}
        options={{ title: 'My Ledger' }}
      />
    </Stack.Navigator>
  );
}
