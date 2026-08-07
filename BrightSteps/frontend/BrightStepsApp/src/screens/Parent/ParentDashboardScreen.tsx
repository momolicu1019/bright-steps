
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppLocale, t } from '../../i18n';
import { PARENT_AI_TIP_KEYS, PARENT_PROGRESS_KEYS, PARENT_REWARD_BADGES } from '../../constants/prototypeContent';

type ParentDashboardScreenProps = {
  childName: string;
  locale: AppLocale;
  onToggleLanguage: () => void;
  onEditChildName: () => void;
};

export default function ParentDashboardScreen({ childName, locale, onToggleLanguage, onEditChildName }: ParentDashboardScreenProps){
  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{t('parent.title')}</Text>
        <TouchableOpacity style={styles.languagePill} onPress={onToggleLanguage}>
          <Text style={styles.languagePillText}>{locale === 'en' ? 'FIL' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{t('parent.todayJourney')}</Text>
          <TouchableOpacity style={styles.addChildButton} onPress={onEditChildName}>
            <Text style={styles.addChildText}>+ {t('parent.editChildName')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionLabel}>{t('parent.todayTitle', { name: childName })}</Text>
        <Text style={styles.cardText}>{t('parent.todayLine1')}</Text>
        <Text style={styles.cardText}>{t('parent.todayLine2')}</Text>
        <Text style={styles.cardText}>{t('parent.todayLine3')}</Text>
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
          <Text style={styles.statItem}>{t(PARENT_PROGRESS_KEYS[0])}</Text>
          <Text style={styles.statItem}>{t(PARENT_PROGRESS_KEYS[1])}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>{t(PARENT_PROGRESS_KEYS[2])}</Text>
          <Text style={styles.statItem}>{t(PARENT_PROGRESS_KEYS[3])}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('parent.rewards')}</Text>
        <Text style={styles.cardText}>{PARENT_REWARD_BADGES.join(' ')}</Text>
        <Text style={styles.cardText}>🐻 Milo the Bear • Level 3</Text>
        <Text style={styles.cardText}>Next: Chef Hat at 50 coins</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('parent.screenTime')}</Text>
        <Text style={styles.cardText}>30 min</Text>
        <Text style={styles.cardText}>{t('parent.screenTimeHint')}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEditChildName}>
        <Text style={styles.editButtonText}>{t('parent.editChildName')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#F7F8FF'},
  topRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  title:{fontSize:28, fontWeight:'900', color:'#172554'},
  languagePill:{backgroundColor:'#1F2937', paddingHorizontal:10, paddingVertical:6, borderRadius:20},
  languagePillText:{color:'#fff', fontWeight:'800', fontSize:12},
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
