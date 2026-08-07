import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MODULES } from '../../constants/activities';
import { AppLocale, t } from '../../i18n';
import { stop } from '../../services/tts';

type ModuleActivitiesScreenProps = {
  route: {
    params: {
      moduleKey: string;
      moduleEmoji: string;
      childName: string;
    };
  };
  navigation: {
    navigate: (screen: string, params: Record<string, unknown>) => void;
  };
  locale: AppLocale;
};

function titleizeTask(task: string): string {
  return task
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTaskLabel(task: string): string {
  const translated = t(`task.${task}`);
  if (translated.toLowerCase().includes('translation missing')) {
    return titleizeTask(task);
  }
  return translated;
}

export default function ModuleActivitiesScreen({ route, navigation, locale }: ModuleActivitiesScreenProps) {
  const { moduleKey, moduleEmoji, childName } = route.params;
  const moduleData = MODULES.find((moduleItem) => moduleItem.key === moduleKey);

  useEffect(() => () => stop(), []);

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
        <Text style={styles.localeTag}>{locale.toUpperCase()}</Text>
      </View>

      {!moduleData ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('common.noActivities')}</Text>
          <Text style={styles.cardText}>{t('common.moduleNotConfigured')}</Text>
        </View>
      ) : (
        moduleData.tasks.map((task, index) => (
          <TouchableOpacity
            key={task}
            style={styles.card}
            onPress={() => {
              stop();
              navigation.navigate('ActivityDetail', {
                moduleKey,
                moduleEmoji,
                taskKey: task,
                childName,
              });
            }}
          >
            <Text style={styles.cardTitle}>
              {index + 1}. {getTaskLabel(task)}
            </Text>
            <Text style={styles.cardText}>Tap to open activity ↗</Text>
          </TouchableOpacity>
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
  localeTag:{fontSize:12, fontWeight:'900', color:'#6B7280', backgroundColor:'#E5E7EB', paddingHorizontal:10, paddingVertical:5, borderRadius:20},
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
    fontSize: 16,
    fontWeight: '800',
    color: '#233266',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 12,
    color: '#4E5C87',
  },
});
