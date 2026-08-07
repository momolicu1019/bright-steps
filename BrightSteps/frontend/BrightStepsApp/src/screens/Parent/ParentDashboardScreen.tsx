
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppLocale, t } from '../../i18n';

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
      <TouchableOpacity style={styles.editButton} onPress={onEditChildName}>
        <Text style={styles.editButtonText}>{t('parent.editChildName')}</Text>
      </TouchableOpacity>
      <View style={styles.card}><Text style={styles.cardTitle}>{t('parent.todayTitle', { name: childName })}</Text><Text>{t('parent.todayLine1')} {"\n"}{t('parent.todayLine2')} {"\n"}{t('parent.todayLine3')}</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>{t('parent.aiTitle')}</Text><Text>{t('parent.aiBody')}</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>{t('parent.progressTitle')}</Text><Text>{t('parent.progressLine1')} {"\n"}{t('parent.progressLine2')} {"\n"}{t('parent.progressLine3')} {"\n"}{t('parent.progressLine4')}</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>{t('parent.rewards')}</Text></View>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#F0F7FF'},
  topRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  title:{fontSize:26, fontWeight:'800', marginBottom:12},
  languagePill:{backgroundColor:'#1F2937', paddingHorizontal:10, paddingVertical:6, borderRadius:20},
  languagePillText:{color:'#fff', fontWeight:'800', fontSize:12},
  editButton:{alignSelf:'flex-start', backgroundColor:'#E8ECFF', paddingHorizontal:12, paddingVertical:8, borderRadius:10, marginBottom:12},
  editButtonText:{fontSize:14, fontWeight:'700', color:'#2E3A8C'},
  card:{backgroundColor:'#fff', padding:16, borderRadius:16, marginBottom:12, elevation:2},
  cardTitle:{fontSize:18, fontWeight:'700', marginBottom:6}
})
