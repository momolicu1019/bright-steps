
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChildHomeScreen from './src/screens/Child/ChildHomeScreen';
import ParentDashboardScreen from './src/screens/Parent/ParentDashboardScreen';
import StarConfettiOverlay from './src/components/StarConfettiOverlay';
import { AppLocale, setLocale, t } from './src/i18n';
import { getLearningStreakDays, recordLearningActivity } from './src/services/learningStreak';

const ModuleActivitiesScreen = require('./src/screens/Child/ModuleActivitiesScreen').default;
const ActivityDetailScreen = require('./src/screens/Child/ActivityDetailScreen').default;
const SpecialEdVideosScreen = require('./src/screens/Child/SpecialEdVideosScreen').default;
const PROFILE_STORAGE_KEY = 'brightsteps.childProfile';
const CHILD_STARS_STORAGE_KEY = 'brightsteps.childStars';
const MODULE_VISITS_STORAGE_KEY = 'brightsteps.moduleVisits';
const LOCALE_STORAGE_KEY = 'brightsteps.locale';
const STAR_CONFETTI_MILESTONE_KEY = 'brightsteps.lastStarConfettiMilestone';
const DEFAULT_CHILD_STARS = 12;

const ChildStack = createNativeStackNavigator();

type ChildNavigatorProps = {
  childName: string;
  childAge: string;
  locale: AppLocale;
  stars: number;
  streakDays: number;
  onEarnStar: (moduleKey: string) => void;
};

function ChildNavigator({ childName, childAge, locale, stars, streakDays, onEarnStar }: ChildNavigatorProps) {
  return (
    <ChildStack.Navigator key={locale}>
      <ChildStack.Screen name="ChildHome" options={{ headerShown: false }}>
        {() => (
          <ChildHomeScreen
            childName={childName}
            childAge={childAge}
            locale={locale}
            stars={stars}
            streakDays={streakDays}
            onEarnStar={onEarnStar}
          />
        )}
      </ChildStack.Screen>
      <ChildStack.Screen name="ModuleActivities" options={{ title: t('common.activities') }}>
        {(props) => <ModuleActivitiesScreen {...props} locale={locale} />}
      </ChildStack.Screen>
      <ChildStack.Screen name="ActivityDetail" options={{ title: t('common.activity') }}>
        {(props) => <ActivityDetailScreen {...props} locale={locale} />}
      </ChildStack.Screen>
      <ChildStack.Screen name="SpecialEdVideos" options={{ title: t('module.sped_videos') }}>
        {(props) => <SpecialEdVideosScreen {...props} locale={locale} />}
      </ChildStack.Screen>
    </ChildStack.Navigator>
  );
}

type RoleView = 'child' | 'parent';

export default function App(){
  const [childNameInput, setChildNameInput] = useState('');
  const [childAgeInput, setChildAgeInput] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [profileReady, setProfileReady] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [locale, setAppLocale] = useState<AppLocale>('en');
  const [selectedRole, setSelectedRole] = useState<RoleView>('child');
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [childStars, setChildStars] = useState(DEFAULT_CHILD_STARS);
  const [moduleVisits, setModuleVisits] = useState<Record<string, number>>({});
  const [learningStreak, setLearningStreak] = useState(0);
  const [showStarConfetti, setShowStarConfetti] = useState(false);
  const [confettiStarCount, setConfettiStarCount] = useState(0);
  const lastConfettiMilestoneRef = useRef(0);

  setLocale(locale);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { childName?: string; childAge?: string };
          const storedName = (parsed.childName || '').trim();
          const storedAge = (parsed.childAge || '').trim();

          if (storedName) {
            setChildName(storedName);
            setChildAge(storedAge);
            setProfileReady(true);
          }
        }

        const savedStars = await AsyncStorage.getItem(CHILD_STARS_STORAGE_KEY);
        let parsedStars = DEFAULT_CHILD_STARS;
        if (savedStars !== null) {
          const n = Number(savedStars);
          if (Number.isFinite(n) && n >= 0) {
            parsedStars = n;
            setChildStars(n);
          }
        }

        const savedConfettiMilestone = await AsyncStorage.getItem(STAR_CONFETTI_MILESTONE_KEY);
        const milestoneNumber = Number(savedConfettiMilestone);
        if (Number.isFinite(milestoneNumber) && milestoneNumber >= 30) {
          lastConfettiMilestoneRef.current = milestoneNumber;
        } else if (parsedStars >= 30) {
          lastConfettiMilestoneRef.current = Math.floor(parsedStars / 30) * 30;
        }

        setLearningStreak(await getLearningStreakDays());

        const savedVisits = await AsyncStorage.getItem(MODULE_VISITS_STORAGE_KEY);
        if (savedVisits) {
          const parsedVisits = JSON.parse(savedVisits) as Record<string, number>;
          if (parsedVisits && typeof parsedVisits === 'object') {
            setModuleVisits(parsedVisits);
          }
        }

        const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (savedLocale === 'en' || savedLocale === 'fil') {
          setLocale(savedLocale);
          setAppLocale(savedLocale);
        }
      } catch {
        // Ignore invalid persisted data and continue with setup flow.
      } finally {
        setBootstrapped(true);
      }
    };

    loadProfile();
  }, []);

  const applyLocale = (next: AppLocale) => {
    setLocale(next);
    setAppLocale(next);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, next).catch(() => {});
  };

  const toggleLanguage = () => {
    applyLocale(locale === 'en' ? 'fil' : 'en');
  };

  const startApp = () => {
    const trimmed = childNameInput.trim();
    const nextName = trimmed || t('setup.defaultChildName');
    const nextAge = childAgeInput.trim();
    setChildName(nextName);
    setChildAge(nextAge);
    setProfileReady(true);

    AsyncStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        childName: nextName,
        childAge: nextAge,
      })
    ).catch(() => {
      // Keep app usable even if storage write fails.
    });
  };

  const beginEditChildProfile = () => {
    setChildNameInput(childName);
    setChildAgeInput(childAge);
    setProfileReady(false);
  };

  const handleConfettiFinished = useCallback(() => {
    setShowStarConfetti(false);
  }, []);

  const earnChildStar = (moduleKey: string) => {
    void recordLearningActivity().then(setLearningStreak);

    setChildStars((current) => {
      const next = current + 1;
      AsyncStorage.setItem(CHILD_STARS_STORAGE_KEY, String(next)).catch(() => {});

      if (next >= 30 && next % 30 === 0 && next > lastConfettiMilestoneRef.current) {
        lastConfettiMilestoneRef.current = next;
        AsyncStorage.setItem(STAR_CONFETTI_MILESTONE_KEY, String(next)).catch(() => {});
        setConfettiStarCount(next);
        setShowStarConfetti(true);
      }

      return next;
    });

    setModuleVisits((current) => {
      const next = { ...current, [moduleKey]: (current[moduleKey] ?? 0) + 1 };
      AsyncStorage.setItem(MODULE_VISITS_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const childRoleLabel = t('tabs.childRole');
  const parentRoleLabel = t('tabs.parentRole');

  if (!bootstrapped) {
    return (
      <NavigationContainer>
        <View style={styles.setupContainer}>
          <ActivityIndicator size="large" color="#FF8B94" accessibilityLabel={t('common.loading')} />
        </View>
      </NavigationContainer>
    );
  }

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
          <TouchableOpacity style={styles.brandLeft} activeOpacity={0.85} onPress={() => setShowAppInfoModal(true)}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>B</Text>
            </View>
            <View>
              <Text style={styles.brandName}>BrightSteps</Text>
              <Text style={styles.brandSub}>AI Learning • {locale.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.langGroup}>
            <TouchableOpacity style={[styles.langBtn, locale === 'en' && styles.langBtnActive]} onPress={() => applyLocale('en')}>
              <Text style={[styles.langBtnText, locale === 'en' && styles.langBtnTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, locale === 'fil' && styles.langBtnActive]} onPress={() => applyLocale('fil')}>
              <Text style={[styles.langBtnText, locale === 'fil' && styles.langBtnTextActive]}>FIL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roleSwitch}>
          <TouchableOpacity style={[styles.roleBtn, selectedRole === 'child' && styles.roleBtnActive]} onPress={() => setSelectedRole('child')}>
            <Text style={[styles.roleBtnText, selectedRole === 'child' && styles.roleBtnTextActive]}>{childRoleLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, selectedRole === 'parent' && styles.roleBtnActive]} onPress={() => setSelectedRole('parent')}>
            <Text style={[styles.roleBtnText, selectedRole === 'parent' && styles.roleBtnTextActive]}>{parentRoleLabel}</Text>
          </TouchableOpacity>
          {/* <View style={styles.roleBtnDisabled}>
            <Text style={styles.roleBtnDisabledText}>{t('tabs.teacherRole')}</Text>
          </View> */}
        </View>

        <View style={styles.contentWrap}>
          {selectedRole === 'child' ? (
            <ChildNavigator
              childName={childName}
              childAge={childAge}
              locale={locale}
              stars={childStars}
              streakDays={learningStreak}
              onEarnStar={earnChildStar}
            />
          ) : (
            <ParentDashboardScreen
              childName={childName}
              childAge={childAge}
              locale={locale}
              stars={childStars}
              streakDays={learningStreak}
              moduleVisits={moduleVisits}
              onEditChildProfile={beginEditChildProfile}
            />
          )}
        </View>

        <StarConfettiOverlay
          visible={showStarConfetti}
          stars={confettiStarCount}
          onFinished={handleConfettiFinished}
        />

        <Modal visible={showAppInfoModal} animationType="fade" transparent onRequestClose={() => setShowAppInfoModal(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalLogoWrap}>
                <View style={styles.modalLogoBadge}>
                  <Text style={styles.modalLogoBadgeText}>B</Text>
                </View>
                <Text style={styles.modalLogoText}>BrightSteps</Text>
              </View>

              <View style={styles.modalDetailsWrap}>
                <Text style={styles.modalDetailLine}>App Name : BrightSteps</Text>
                <Text style={styles.modalDetailLine}>Version : 1.0.0</Text>
                <Text style={styles.modalDetailLine}>Developer: Nino Jeffrey Montillano</Text>
                <Text style={styles.modalDetailLine}>All rights reserved : 2026</Text>
              </View>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowAppInfoModal(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalLogoWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  modalLogoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalLogoBadgeText: {
    color: '#FACC15',
    fontSize: 40,
    fontWeight: '900',
  },
  modalLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  modalDetailsWrap: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  modalDetailLine: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
