import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MODULES } from '../../constants/activities';
import { AppLocale, t } from '../../i18n';

type ModuleActivitiesScreenProps = {
  route: {
    params: {
      moduleKey: string;
      moduleEmoji: string;
      childName: string;
    };
  };
  locale: AppLocale;
  onToggleLanguage: () => void;
};

function titleizeTask(task: string): string {
  return task
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ModuleActivitiesScreen({ route, locale, onToggleLanguage }: ModuleActivitiesScreenProps) {
  const { moduleKey, moduleEmoji, childName } = route.params;
  const moduleData = MODULES.find((moduleItem) => moduleItem.key === moduleKey);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.header}>
            {moduleEmoji} {t(`module.${moduleKey}`)}
          </Text>
          <Text style={styles.subHeader}>{t(`module.secondary.${moduleKey}`)}</Text>
          <Text style={styles.childText}>{t('common.forChild', { name: childName })}</Text>
        </View>
        <TouchableOpacity style={styles.languagePill} onPress={onToggleLanguage}>
          <Text style={styles.languagePillText}>{locale === 'en' ? 'FIL' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {!moduleData ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('common.noActivities')}</Text>
          <Text style={styles.cardText}>{t('common.moduleNotConfigured')}</Text>
        </View>
      ) : (
        moduleData.tasks.map((task, index) => (
          <View key={task} style={styles.card}>
            <Text style={styles.cardTitle}>
              {index + 1}. {titleizeTask(task)}
            </Text>
            <Text style={styles.cardText}>{t('common.tapToStartHint')}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  languagePill: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  languagePillText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  header: {
    fontSize: 30,
    fontWeight: '900',
    color: '#222',
  },
  subHeader: {
    marginTop: 2,
    fontSize: 18,
    color: '#666',
    marginBottom: 6,
  },
  childText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#F7F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DEE6FF',
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#233266',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#4E5C87',
  },
});
