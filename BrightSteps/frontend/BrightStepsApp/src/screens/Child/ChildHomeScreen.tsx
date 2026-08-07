
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LargeButton from '../../components/LargeButton';
import { speak } from '../../services/tts';

const MODULES = [
  {id:'daily', label:'Daily Living', fil:'Araw-araw', emoji:'🏠', color:'#A8E6CF'},
  {id:'academic', label:'Learn ABC', fil:'Matuto', emoji:'📚', color:'#FFD3B6'},
  {id:'emotional', label:'Feelings', fil:'Damdamin', emoji:'😊', color:'#FFAAA5'},
  {id:'speech', label:'Talk', fil:'Salita', emoji:'🗣️', color:'#FF8B94'},
  {id:'sensory', label:'Calm & Focus', fil:'Kalmado', emoji:'🎮', color:'#DCE775'},
  {id:'cognitive', label:'Think', fil:'Isip', emoji:'🧠', color:'#B39DDB'},
  {id:'motor', label:'Move', fil:'Galaw', emoji:'💪', color:'#81D4FA'},
  {id:'life', label:'Life Skills', fil:'Buhay', emoji:'🌍', color:'#FFE082'},
];

export default function ChildHomeScreen(){
  const [coins,setCoins]=useState(12);
  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <View style={styles.header}>
        <Text style={styles.title}>Hi, Alex! 👋</Text>
        <Text style={styles.coins}>🪙 {coins} coins</Text>
      </View>
      <View style={styles.grid}>
        {MODULES.map(m=>(
          <LargeButton key={m.id} label={`${m.label}
${m.fil}`} emoji={m.emoji} color={m.color}
            onPress={()=>{ speak(m.label); setCoins(c=>c+1); }}/>
        ))}
      </View>
      <View style={styles.petCard}>
        <Text style={{fontSize:24}}>🐻 My Buddy Bear is happy! You brushed teeth today!</Text>
      </View>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFF9E5'},
  header:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginVertical:12},
  title:{fontSize:28, fontWeight:'800'},
  coins:{fontSize:20, fontWeight:'700', backgroundColor:'#fff', padding:8, borderRadius:12},
  grid:{flexDirection:'row', flexWrap:'wrap', justifyContent:'center'},
  petCard:{backgroundColor:'#fff', padding:16, borderRadius:20, marginTop:16, borderWidth:2, borderColor:'#FFD93D'}
})
