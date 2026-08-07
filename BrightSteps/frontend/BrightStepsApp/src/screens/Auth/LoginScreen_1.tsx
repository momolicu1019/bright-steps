
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export default function LoginScreen({navigation}){
  return (
    <View style={styles.c}>
      <Text style={styles.logo}>🌈 BrightSteps</Text>
      <Text style={styles.sub}>AI Learning for Every Child</Text>
      <Text style={styles.subFil}>Para sa Bawat Bata</Text>
      <TouchableOpacity style={styles.btn} onPress={()=>navigation.replace('Main')}><Text style={styles.btnT}>Continue as Parent Demo</Text></TouchableOpacity>
    </View>
  )
}
const styles=StyleSheet.create({
  c:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFF9E5', padding:24},
  logo:{fontSize:42, fontWeight:'900', color:'#FF8B94'},
  sub:{fontSize:18, marginTop:8},
  subFil:{fontSize:16, color:'#666', marginBottom:32},
  btn:{backgroundColor:'#A8E6CF', padding:20, borderRadius:24, width:'100%', alignItems:'center'},
  btnT:{fontSize:18, fontWeight:'800'}
})
