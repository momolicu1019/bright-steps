
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { speak } from '../../services/tts';
import { AppLocale, t } from '../../i18n';

const MODULES = [
  {id:'daily', moduleKey:'daily_living', subtitleKey:'module.desc.daily_living', emoji:'🏠', color:'#D8F4E8'},
  {id:'academic', moduleKey:'academic', subtitleKey:'module.desc.academic', emoji:'📚', color:'#FFE7D6'},
  {id:'emotional', moduleKey:'emotional', subtitleKey:'module.desc.emotional', emoji:'😊', color:'#FFDDE2'},
  {id:'speech', moduleKey:'speech', subtitleKey:'module.desc.speech', emoji:'🗣️', color:'#FFD8E9'},
  {id:'sensory', moduleKey:'sensory', subtitleKey:'module.desc.sensory', emoji:'🎮', color:'#EAF7BF'},
  {id:'cognitive', moduleKey:'cognitive', subtitleKey:'module.desc.cognitive', emoji:'🧠', color:'#E9DDFB'},
  {id:'motor', moduleKey:'motor', subtitleKey:'module.desc.motor', emoji:'💪', color:'#D9F2FF'},
  {id:'life', moduleKey:'life_skills', subtitleKey:'module.desc.life_skills', emoji:'🌍', color:'#FFF0C7'},
];

type ChildHomeScreenProps = {
  childName: string;
  locale: AppLocale;
  onToggleLanguage: () => void;
};

export default function ChildHomeScreen({ childName, locale, onToggleLanguage }: ChildHomeScreenProps){
  const [coins,setCoins]=useState(12);
  const navigation = useNavigation<any>();

  const handleReadAloud = () => {
    speak(t('child.learnPrompt'), locale);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <View style={styles.heroCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{t('child.greeting', { name: childName })}</Text>
            <Text style={styles.prompt}>{t('child.learnPrompt')}</Text>
          </View>
          <TouchableOpacity style={styles.languagePill} onPress={onToggleLanguage}>
            <Text style={styles.languagePillText}>{locale === 'en' ? 'FIL' : 'EN'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroActions}>
          <View style={styles.streakChip}>
            <Text style={styles.streakText}>🔥 {t('child.streak')}</Text>
          </View>
          <TouchableOpacity style={styles.readButton} onPress={handleReadAloud}>
            <Text style={styles.readButtonText}>🔊 {t('child.readAloud')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coinsCard}>
          <Text style={styles.coinsLabel}>{t('child.yourStars')}</Text>
          <Text style={styles.coinsValue}>🪙 {t('child.coins', { count: coins })}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {MODULES.map(m=>(
          <TouchableOpacity
            key={m.id}
            style={[styles.tile, { backgroundColor: m.color }]}
            onPress={()=>{
              speak(t(`module.${m.moduleKey}`), locale);
              setCoins((c: number)=>c+1);
              navigation.navigate('ModuleActivities', {
                moduleKey: m.moduleKey,
                moduleEmoji: m.emoji,
                childName,
              });
            }}
          >
            <View style={styles.tileTopRow}>
              <Text style={styles.tileEmoji}>{m.emoji}</Text>
              <Text style={styles.tileArrow}>↗</Text>
            </View>
            <Text style={styles.tileTitle}>{t(`module.${m.moduleKey}`)}</Text>
            <Text style={styles.tileSubtitle}>{t(m.subtitleKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.a11yRow}>
        <Text style={styles.a11yTitle}>ACCESSIBILITY</Text>
        <Text style={styles.a11yChip}>Aa {t('child.largeText')} OFF</Text>
        <Text style={styles.a11yChip}>◐ {t('child.highContrast')} OFF</Text>
        <Text style={styles.a11yChip}>🔊 TTS ON</Text>
        <Text style={styles.a11yChip}>● {t('child.offlineReady')}</Text>
      </View>

      <View style={styles.petCard}>
        <Text style={styles.petText}>{t('child.petMessage')}</Text>
      </View>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#F7F8FF'},
  heroCard:{backgroundColor:'#FFFFFF', borderRadius:20, padding:16, marginBottom:14, borderWidth:1, borderColor:'#E7EAF8'},
  headerTop:{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'},
  title:{fontSize:30, fontWeight:'900', color:'#172554'},
  prompt:{fontSize:15, color:'#4B5563', marginTop:4},
  languagePill:{backgroundColor:'#111827', paddingHorizontal:10, paddingVertical:6, borderRadius:20},
  languagePillText:{color:'#fff', fontWeight:'800', fontSize:12},
  heroActions:{marginTop:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  streakChip:{backgroundColor:'#FFF3D0', paddingHorizontal:12, paddingVertical:8, borderRadius:999},
  streakText:{fontSize:12, fontWeight:'800', color:'#7C2D12'},
  readButton:{backgroundColor:'#E6F0FF', paddingHorizontal:12, paddingVertical:8, borderRadius:12},
  readButtonText:{fontSize:12, fontWeight:'800', color:'#1D4ED8'},
  coinsCard:{marginTop:12, backgroundColor:'#F8FAFF', borderWidth:1, borderColor:'#E5E9F8', borderRadius:14, padding:12},
  coinsLabel:{fontSize:12, color:'#6B7280', fontWeight:'700'},
  coinsValue:{fontSize:20, fontWeight:'900', color:'#111827', marginTop:2},
  grid:{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between'},
  tile:{width:'48%', borderRadius:18, borderWidth:1, borderColor:'#E5E7EB', padding:12, marginBottom:10},
  tileTopRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  tileEmoji:{fontSize:24},
  tileArrow:{fontSize:18, fontWeight:'900', color:'#374151'},
  tileTitle:{fontSize:16, fontWeight:'900', color:'#111827', marginTop:8},
  tileSubtitle:{fontSize:12, color:'#4B5563', marginTop:4, fontWeight:'600'},
  a11yRow:{marginTop:6, marginBottom:8, padding:10, backgroundColor:'#FFFFFF', borderRadius:14, borderWidth:1, borderColor:'#E8EAF5', flexDirection:'row', flexWrap:'wrap', gap:8},
  a11yTitle:{width:'100%', fontSize:11, fontWeight:'900', color:'#6B7280', letterSpacing:1},
  a11yChip:{fontSize:11, fontWeight:'700', color:'#374151', backgroundColor:'#F3F4F6', paddingHorizontal:8, paddingVertical:6, borderRadius:999},
  petCard:{backgroundColor:'#FFFDF2', padding:14, borderRadius:16, marginTop:8, borderWidth:1, borderColor:'#FDE68A'},
  petText:{fontSize:18, fontWeight:'700', color:'#78350F'}
})
