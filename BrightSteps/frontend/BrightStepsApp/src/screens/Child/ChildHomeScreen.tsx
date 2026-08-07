
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { speak, stop } from '../../services/tts';
import { AppLocale, t } from '../../i18n';
import { CHILD_MODULE_TILES } from '../../constants/prototypeContent';

type ChildHomeScreenProps = {
  childName: string;
  childAge: string;
  locale: AppLocale;
};

export default function ChildHomeScreen({ childName, childAge, locale }: ChildHomeScreenProps){
  const [coins,setCoins]=useState(12);
  const navigation = useNavigation<any>();

  useEffect(() => () => stop(), []);

  const handleReadAloud = () => {
    speak(t('child.learnPrompt'), locale);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <View style={styles.heroCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{t('child.greeting', { name: childName })}</Text>
            {!!childAge && <Text style={styles.ageTag}>{childAge} yrs</Text>}
            <Text style={styles.prompt}>{t('child.learnPrompt')}</Text>
          </View>
          <Text style={styles.localeTag}>{locale.toUpperCase()}</Text>
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
        {CHILD_MODULE_TILES.map((m)=>(
          <TouchableOpacity
            key={m.id}
            style={[styles.tile, { backgroundColor: m.color }]}
            onPress={()=>{
              stop();
              speak(t(`module.${m.moduleKey}`), locale);
              setCoins((c: number)=>c+1);
              if (m.moduleKey === 'emotional') {
                navigation.navigate('ActivityDetail', {
                  moduleKey: m.moduleKey,
                  moduleEmoji: m.emoji,
                  taskKey: 'emotions',
                  childName,
                });
                return;
              }

              if (m.moduleKey === 'speech') {
                navigation.navigate('ActivityDetail', {
                  moduleKey: m.moduleKey,
                  moduleEmoji: m.emoji,
                  taskKey: 'aac',
                  childName,
                });
                return;
              }

              if (m.moduleKey === 'sensory') {
                navigation.navigate('ActivityDetail', {
                  moduleKey: m.moduleKey,
                  moduleEmoji: m.emoji,
                  taskKey: 'bubble_pop',
                  childName,
                });
                return;
              }

              if (m.moduleKey === 'motor') {
                navigation.navigate('ActivityDetail', {
                  moduleKey: m.moduleKey,
                  moduleEmoji: m.emoji,
                  taskKey: 'head_to_toe',
                  childName,
                });
                return;
              }

              navigation.navigate('ModuleActivities', {
                moduleKey: m.moduleKey,
                moduleEmoji: m.emoji,
                childName,
              });
            }}
          >
            <View style={styles.tileTopRow}>
              <Text style={styles.tileEmoji}>{m.emoji}</Text>
            </View>
            <Text style={styles.tileTitle}>{t(`module.${m.moduleKey}`)}</Text>
            <Text style={styles.tileSubtitle}>{t(m.subtitleKey)}</Text>
          </TouchableOpacity>
        ))}
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
  localeTag:{fontSize:12, fontWeight:'900', color:'#6B7280', backgroundColor:'#E5E7EB', paddingHorizontal:10, paddingVertical:5, borderRadius:20},
  ageTag:{fontSize:12, fontWeight:'800', color:'#1D4ED8', marginTop:4},
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
  tileTitle:{fontSize:16, fontWeight:'900', color:'#111827', marginTop:8},
  tileSubtitle:{fontSize:12, color:'#4B5563', marginTop:4, fontWeight:'600'},
  petCard:{backgroundColor:'#FFFDF2', padding:14, borderRadius:16, marginTop:8, borderWidth:1, borderColor:'#FDE68A'},
  petText:{fontSize:18, fontWeight:'700', color:'#78350F'}
})
