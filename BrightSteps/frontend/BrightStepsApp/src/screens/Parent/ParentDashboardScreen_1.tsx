
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
export default function ParentDashboardScreen(){
  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16}}>
      <Text style={styles.title}>Parent Dashboard 👨‍👩‍👧</Text>
      <View style={styles.card}><Text style={styles.cardTitle}>Today - Alex (5 yrs)</Text><Text>✅ Morning routine 80%{"\n"}✅ Letter A tracing{"\n"}⭐ Earned 3 stickers</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>AI Coach Suggestion</Text><Text>Based on focus pattern, try 5-min bubble pop before reading. Practice turn-taking with toy cars - home idea in Filipino: Maglaro ng salitan.</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>Progress Analyzer</Text><Text>Attention: 75% ⬆️{"\n"}Accuracy: 82%{"\n"}Favorite: Sensory games{"\n"}Needs support: Sharing</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>Rewards: 🪙 42 | 🐻 Bear Level 3</Text></View>
    </ScrollView>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#F0F7FF'},
  title:{fontSize:26, fontWeight:'800', marginBottom:12},
  card:{backgroundColor:'#fff', padding:16, borderRadius:16, marginBottom:12, elevation:2},
  cardTitle:{fontSize:18, fontWeight:'700', marginBottom:6}
})
