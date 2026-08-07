
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChildHomeScreen from './src/screens/Child/ChildHomeScreen';
import ParentDashboardScreen from './src/screens/Parent/ParentDashboardScreen';
import TeacherDashboardScreen from './src/screens/Teacher/TeacherDashboardScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs(){
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: {height: 80}, tabBarLabelStyle:{fontSize:16, fontWeight:'bold'}}}>
      <Tab.Screen name="Child" component={ChildHomeScreen} options={{tabBarLabel:'🧒 Bata'}}/>
      <Tab.Screen name="Parent" component={ParentDashboardScreen} options={{tabBarLabel:'👨‍👩‍👧 Magulang'}}/>
      <Tab.Screen name="Teacher" component={TeacherDashboardScreen} options={{tabBarLabel:'👩‍🏫 Teacher'}}/>
    </Tab.Navigator>
  )
}

export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
        <Stack.Screen name="Main" component={MainTabs} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
