import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { DemoProvider } from './src/demo/DemoProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <DemoProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </DemoProvider>
    </SafeAreaProvider>
  );
}
