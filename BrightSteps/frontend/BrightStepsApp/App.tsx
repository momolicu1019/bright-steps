
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ChildHomeScreen from './src/screens/Child/ChildHomeScreen';
import ParentDashboardScreen from './src/screens/Parent/ParentDashboardScreen';
import { AppLocale, setLocale, t } from './src/i18n';

const ModuleActivitiesScreen = require('./src/screens/Child/ModuleActivitiesScreen').default;
const ActivityDetailScreen = require('./src/screens/Child/ActivityDetailScreen').default;

const ChildStack = createNativeStackNavigator();

type ChildNavigatorProps = {
  childName: string;
  childAge: string;
  locale: AppLocale;
};

function ChildNavigator({ childName, childAge, locale }: ChildNavigatorProps) {
  return (
    <ChildStack.Navigator>
      <ChildStack.Screen name="ChildHome" options={{ headerShown: false }}>
        {() => <ChildHomeScreen childName={childName} childAge={childAge} locale={locale} />}
      </ChildStack.Screen>
      <ChildStack.Screen name="ModuleActivities" options={{ title: t('common.activities') }}>
        {(props) => <ModuleActivitiesScreen {...props} locale={locale} />}
      </ChildStack.Screen>
      <ChildStack.Screen name="ActivityDetail" options={{ title: t('common.activity') }}>
        {(props) => <ActivityDetailScreen {...props} locale={locale} />}
      </ChildStack.Screen>
    </ChildStack.Navigator>
  );
}

type RoleView = 'child' | 'parent';

export default function App(){
  const [childNameInput, setChildNameInput] = useState('');
  const [childAgeInput, setChildAgeInput] = useState('5');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('5');
  const [profileReady, setProfileReady] = useState(false);
  const [locale, setAppLocale] = useState<AppLocale>('en');
  const [selectedRole, setSelectedRole] = useState<RoleView>('child');

  useEffect(() => {
    setLocale(locale);
  }, [locale]);

  const toggleLanguage = () => {
    setAppLocale((current) => (current === 'en' ? 'fil' : 'en'));
  };

  const startApp = () => {
    const trimmed = childNameInput.trim();
    setChildName(trimmed || t('setup.defaultChildName'));
    setChildAge(childAgeInput.trim() || '5');
    setProfileReady(true);
  };

  const beginEditChildProfile = () => {
    setChildNameInput(childName);
    setChildAgeInput(childAge);
    setProfileReady(false);
  };

  if (!profileReady) {
    return (
      <NavigationContainer>
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
          />
          <TextInput
            style={styles.input}
            value={childAgeInput}
            onChangeText={setChildAgeInput}
            placeholder={t('setup.agePlaceholder')}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={startApp}
          />
          <TouchableOpacity style={styles.button} onPress={startApp}>
            <Text style={styles.buttonText}>{t('setup.continue')}</Text>
          </TouchableOpacity>
        </View>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <View style={styles.shell}>
        <View style={styles.brandRow}>
          <View style={styles.brandLeft}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>B</Text>
            </View>
            <View>
              <Text style={styles.brandName}>BrightSteps</Text>
              <Text style={styles.brandSub}>AI Learning • {locale.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.langGroup}>
            <TouchableOpacity style={[styles.langBtn, locale === 'en' && styles.langBtnActive]} onPress={() => setAppLocale('en')}>
              <Text style={[styles.langBtnText, locale === 'en' && styles.langBtnTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, locale === 'fil' && styles.langBtnActive]} onPress={() => setAppLocale('fil')}>
              <Text style={[styles.langBtnText, locale === 'fil' && styles.langBtnTextActive]}>FIL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roleSwitch}>
          <TouchableOpacity style={[styles.roleBtn, selectedRole === 'child' && styles.roleBtnActive]} onPress={() => setSelectedRole('child')}>
            <Text style={[styles.roleBtnText, selectedRole === 'child' && styles.roleBtnTextActive]}>{t('tabs.childRole')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, selectedRole === 'parent' && styles.roleBtnActive]} onPress={() => setSelectedRole('parent')}>
            <Text style={[styles.roleBtnText, selectedRole === 'parent' && styles.roleBtnTextActive]}>{t('tabs.parentRole')}</Text>
          </TouchableOpacity>
          <View style={styles.roleBtnDisabled}>
            <Text style={styles.roleBtnDisabledText}>{t('tabs.teacherRole')}</Text>
          </View>
        </View>

        <View style={styles.contentWrap}>
          {selectedRole === 'child' ? (
            <ChildNavigator childName={childName} childAge={childAge} locale={locale} />
          ) : (
            <ParentDashboardScreen
              childName={childName}
              childAge={childAge}
              locale={locale}
              onEditChildProfile={beginEditChildProfile}
            />
          )}
        </View>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#FACC15',
    fontWeight: '900',
    fontSize: 18,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
  },
  brandSub: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  langGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: '#111827',
  },
  langBtnText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 12,
  },
  langBtnTextActive: {
    color: '#FFFFFF',
  },
  roleSwitch: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: '#111827',
  },
  roleBtnText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 13,
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
  },
  roleBtnDisabled: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    opacity: 0.55,
  },
  roleBtnDisabledText: {
    color: '#6B7280',
    fontWeight: '800',
    fontSize: 13,
  },
  contentWrap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 18,
  },
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
