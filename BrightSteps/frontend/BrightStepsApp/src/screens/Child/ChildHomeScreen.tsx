
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LargeButton from '../../components/LargeButton';
import { speak } from '../../services/tts';
import { AppLocale, t } from '../../i18n';

const MODULES = [
  {id:'daily', moduleKey:'daily_living', emoji:'🏠', color:'#A8E6CF'},
  {id:'academic', moduleKey:'academic', emoji:'📚', color:'#FFD3B6'},
  {id:'emotional', moduleKey:'emotional', emoji:'😊', color:'#FFAAA5'},
  {id:'speech', moduleKey:'speech', emoji:'🗣️', color:'#FF8B94'},
  {id:'sensory', moduleKey:'sensory', emoji:'🎮', color:'#DCE775'},
  {id:'cognitive', moduleKey:'cognitive', emoji:'🧠', color:'#B39DDB'},
  {id:'motor', moduleKey:'motor', emoji:'💪', color:'#81D4FA'},
  {id:'life', moduleKey:'life_skills', emoji:'🌍', color:'#FFE082'},
];

type ChildHomeScreenProps = {
  childName: string;
  locale: AppLocale;
  onToggleLanguage: () => void;
};

export default function ChildHomeScreen({ childName, locale, onToggleLanguage }: ChildHomeScreenProps){
  const [coins,setCoins]=useState(12);
  const navigation = useNavigation<any>();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('child.greeting', { name: childName })}</Text>
          <Text style={styles.coins}>🪙 {t('child.coins', { count: coins })}</Text>
        </View>
        <TouchableOpacity style={styles.languagePill} onPress={onToggleLanguage}>
          <Text style={styles.languagePillText}>{locale === 'en' ? 'FIL' : 'EN'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {MODULES.map(m=>(
          <LargeButton key={m.id} label={`${t(`module.${m.moduleKey}`)}
${t(`module.secondary.${m.moduleKey}`)}`} emoji={m.emoji} color={m.color}
            onPress={()=>{
              speak(t(`module.${m.moduleKey}`), locale);
              setCoins((c: number)=>c+1);
              navigation.navigate('ModuleActivities', {
                moduleKey: m.moduleKey,
                moduleEmoji: m.emoji,
                childName,
              });
            }}/>
        ))}
      </View>
      <View style={styles.petCard}>
        <Text style={{fontSize:24}}>{t('child.petMessage')}</Text>
      </View>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFF9E5'},
  header:{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginVertical:12},
  title:{fontSize:28, fontWeight:'800'},
  coins:{fontSize:20, fontWeight:'700', backgroundColor:'#fff', padding:8, borderRadius:12, marginTop:8, alignSelf:'flex-start'},
  languagePill:{backgroundColor:'#1F2937', paddingHorizontal:10, paddingVertical:6, borderRadius:20},
  languagePillText:{color:'#fff', fontWeight:'800', fontSize:12},
  grid:{flexDirection:'row', flexWrap:'wrap', justifyContent:'center'},
  petCard:{backgroundColor:'#fff', padding:16, borderRadius:20, marginTop:16, borderWidth:2, borderColor:'#FFD93D'}
})
