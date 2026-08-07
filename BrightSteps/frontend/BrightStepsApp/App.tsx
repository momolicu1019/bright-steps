
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ChildHomeScreen from './src/screens/Child/ChildHomeScreen';
import ModuleActivitiesScreen from './src/screens/Child/ModuleActivitiesScreen';
import ParentDashboardScreen from './src/screens/Parent/ParentDashboardScreen';
import { AppLocale, setLocale, t } from './src/i18n';

const Tab = createBottomTabNavigator();
const ChildStack = createNativeStackNavigator();

type ChildNavigatorProps = {
  childName: string;
  locale: AppLocale;
  onToggleLanguage: () => void;
};

function ChildNavigator({ childName, locale, onToggleLanguage }: ChildNavigatorProps) {
  return (
    <ChildStack.Navigator>
      <ChildStack.Screen name="ChildHome" options={{ headerShown: false }}>
        {() => <ChildHomeScreen childName={childName} locale={locale} onToggleLanguage={onToggleLanguage} />}
      </ChildStack.Screen>
      <ChildStack.Screen name="ModuleActivities" options={{ title: t('common.activities') }}>
        {(props) => <ModuleActivitiesScreen {...props} locale={locale} onToggleLanguage={onToggleLanguage} />}
      </ChildStack.Screen>
    </ChildStack.Navigator>
  );
}

type MainTabsProps = {
  childName: string;
  locale: AppLocale;
  onToggleLanguage: () => void;
  onEditChildName: () => void;
};

function MainTabs({ childName, locale, onToggleLanguage, onEditChildName }: MainTabsProps){
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: {height: 80}, tabBarLabelStyle:{fontSize:16, fontWeight:'bold'}}}>
      <Tab.Screen name="Child" options={{tabBarLabel:`🧒 ${t('tabs.child')}`}}>
        {() => <ChildNavigator childName={childName} locale={locale} onToggleLanguage={onToggleLanguage} />}
      </Tab.Screen>
      <Tab.Screen name="Parent" options={{tabBarLabel:`👨‍👩‍👧 ${t('tabs.parent')}`}}>
        {() => (
          <ParentDashboardScreen
            childName={childName}
            locale={locale}
            onToggleLanguage={onToggleLanguage}
            onEditChildName={onEditChildName}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

export default function App(){
  const [childNameInput, setChildNameInput] = useState('');
  const [childName, setChildName] = useState('');
  const [locale, setAppLocale] = useState<AppLocale>('en');

  useEffect(() => {
    setLocale(locale);
  }, [locale]);

  const toggleLanguage = () => {
    setAppLocale((current) => (current === 'en' ? 'fil' : 'en'));
  };

  const startApp = () => {
    const trimmed = childNameInput.trim();
    setChildName(trimmed || t('setup.defaultChildName'));
  };

  const beginEditChildName = () => {
    setChildNameInput(childName);
    setChildName('');
  };

  return (
    <NavigationContainer>
      {childName ? (
        <MainTabs
          childName={childName}
          locale={locale}
          onToggleLanguage={toggleLanguage}
          onEditChildName={beginEditChildName}
        />
      ) : (
        <View style={styles.setupContainer}>
          <TouchableOpacity style={styles.languagePill} onPress={toggleLanguage}>
            <Text style={styles.languagePillText}>{locale === 'en' ? 'FIL' : 'EN'}</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>BrightSteps</Text>
          <Text style={styles.subtitle}>{t('setup.subtitle')}</Text>
          <TextInput
            style={styles.input}
            value={childNameInput}
            onChangeText={setChildNameInput}
            placeholder={t('setup.placeholder')}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={startApp}
          />
          <TouchableOpacity style={styles.button} onPress={startApp}>
            <Text style={styles.buttonText}>{t('setup.continue')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF9E5',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FF8B94',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  languagePill: {
    alignSelf: 'flex-end',
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  languagePillText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#A8E6CF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1E1E',
  },
});
