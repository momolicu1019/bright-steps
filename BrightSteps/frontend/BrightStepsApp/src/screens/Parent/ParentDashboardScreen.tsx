
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppLocale, t } from '../../i18n';
import { PARENT_AI_TIP_KEYS, PARENT_REWARD_BADGES, CHILD_MODULE_TILES } from '../../constants/prototypeContent';
import {
  bearLevelFromCoins,
  favoriteModuleKey,
  modulesExploredCount,
  ModuleVisitCounts,
  nextCoinMilestone,
  topModuleKeys,
} from '../../utils/childProgress';

type ParentDashboardScreenProps = {
  childName: string;
  childAge: string;
  locale: AppLocale;
  stars: number;
  moduleVisits: ModuleVisitCounts;
  onEditChildProfile: () => void;
};

export default function ParentDashboardScreen({
  childName,
  childAge,
  locale,
  stars,
  moduleVisits,
  onEditChildProfile,
}: ParentDashboardScreenProps){
  const bearLevel = bearLevelFromCoins(stars);
  const nextMilestone = nextCoinMilestone(stars);
  const favoriteKey = favoriteModuleKey(moduleVisits);
  const exploredCount = modulesExploredCount(moduleVisits);
  const todayModules = topModuleKeys(moduleVisits, 3);

  const todayJourneyLines = useMemo(() => {
    if (!todayModules.length) {
      return [t('parent.todayNoActivity')];
    }
    return todayModules.map((moduleKey) =>
      t('parent.todayModuleLine', { module: t(`module.${moduleKey}`) })
    );
  }, [todayModules]);

  const favoriteModuleLabel = favoriteKey ? t(`module.${favoriteKey}`) : t('parent.progressNoFavorite');
  const leastExploredModuleLabel = useMemo(() => {
    const visited = new Set(Object.keys(moduleVisits));
    const untouched = CHILD_MODULE_TILES.find((tile) => !visited.has(tile.moduleKey));
    return untouched ? t(`module.${untouched.moduleKey}`) : t('parent.progressAllExplored');
  }, [moduleVisits]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{t('parent.title')}</Text>
        <Text style={styles.localeTag}>{locale.toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{t('parent.todayJourney')}</Text>
          <TouchableOpacity style={styles.addChildButton} onPress={onEditChildProfile}>
            <Text style={styles.addChildText}>+ {t('parent.editChildName')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionLabel}>
          {t('parent.todayTitle', { name: childName })}
          {childAge ? ` • ${childAge} yrs` : ''}
        </Text>
        <Text style={styles.cardText}>🔥 {t('child.streak')}</Text>
        {todayJourneyLines.map((line, index) => (
          <Text key={`${index}-${line}`} style={styles.cardText}>{line}</Text>
        ))}
        <Text style={styles.cardText}>🪙 {t('child.coins', { count: stars })}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('parent.aiTitle')}</Text>
        {PARENT_AI_TIP_KEYS.map((tipKey, index) => (
          <Text key={tipKey} style={styles.cardText}>{index === 0 ? '🏠' : index === 1 ? '📖' : '⏰'} {t(tipKey)}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('parent.progressTitle')}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>{t('parent.progressLine1', { coins: stars })}</Text>
          <Text style={styles.statItem}>{t('parent.progressLine2', { count: exploredCount })}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>{t('parent.progressLine3', { module: favoriteModuleLabel })}</Text>
          <Text style={styles.statItem}>{t('parent.progressLine4', { module: leastExploredModuleLabel })}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('parent.rewards')}</Text>
        <Text style={styles.cardText}>{PARENT_REWARD_BADGES.join(' ')}</Text>
        <Text style={styles.cardText}>
          {t('parent.rewardsSummary', { coins: stars, level: bearLevel })}
        </Text>
        <Text style={styles.cardText}>{t('child.petMessage')}</Text>
        <Text style={styles.cardText}>{t('parent.nextReward', { coins: nextMilestone })}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('parent.screenTime')}</Text>
        <Text style={styles.cardText}>{t('parent.screenTimeValue', { count: stars })}</Text>
        <Text style={styles.cardText}>{t('parent.screenTimeHint')}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEditChildProfile}>
        <Text style={styles.editButtonText}>{t('parent.editChildName')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#F7F8FF'},
  topRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  title:{fontSize:28, fontWeight:'900', color:'#172554'},
  localeTag:{fontSize:12, fontWeight:'900', color:'#6B7280', backgroundColor:'#E5E7EB', paddingHorizontal:10, paddingVertical:5, borderRadius:20},
  editButton:{alignSelf:'flex-start', backgroundColor:'#E8ECFF', paddingHorizontal:12, paddingVertical:8, borderRadius:10, marginTop:8, marginBottom:12},
  editButtonText:{fontSize:14, fontWeight:'700', color:'#2E3A8C'},
  card:{backgroundColor:'#fff', padding:16, borderRadius:16, marginBottom:12, borderWidth:1, borderColor:'#E8EAF5'},
  cardTitle:{fontSize:18, fontWeight:'900', marginBottom:8, color:'#1F2937'},
  cardText:{fontSize:14, color:'#374151', marginBottom:6, fontWeight:'600'},
  rowBetween:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6},
  sectionLabel:{fontSize:15, fontWeight:'800', color:'#1D4ED8', marginBottom:8},
  addChildButton:{backgroundColor:'#EEF2FF', paddingHorizontal:10, paddingVertical:6, borderRadius:10},
  addChildText:{fontSize:12, fontWeight:'800', color:'#3730A3'},
  statsRow:{flexDirection:'row', justifyContent:'space-between', gap:8, marginBottom:6},
  statItem:{flex:1, backgroundColor:'#F8FAFF', borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, padding:8, fontSize:13, color:'#374151', fontWeight:'700'}
})
