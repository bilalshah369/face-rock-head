import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Pressable, Text, View} from 'react-native';
import LoginScreen from '../auth/LoginScreen';
import DashboardScreen from '../screens/Landing/DashboardScreen';
import ScannerScreen from '../screens/workspace/ScannerScreen';
import {RootStackParamList} from './types';
import ScanHistoryScreen from '../screens/workspace/ScanHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// function LoginScreen({navigation}: any) {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Text>Login Screen 123 (Web)</Text>
//       <Pressable onPress={() => navigation.navigate('Scan')}>
//         <Text style={{marginTop: 20, color: 'blue'}}>Go to Scan</Text>
//       </Pressable>
//     </View>
//   );
// }

function ScanScreen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Scan Screen</Text>
    </View>
  );
}
const AppNavigator = ({
  initialRoute,
}: {
  initialRoute: keyof RootStackParamList;
}) => {
  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{title: 'Scan QR'}}
      />
      <Stack.Screen
        name="ScanHistoryScreen"
        component={ScanHistoryScreen}
        options={{title: 'Scan History'}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
