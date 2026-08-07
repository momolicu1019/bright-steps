
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type LargeButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  emoji?: string;
};

export default function LargeButton({label, onPress, color="#FFD93D", emoji="⭐"}: LargeButtonProps){
  return (
    <TouchableOpacity style={[styles.btn,{backgroundColor:color}]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}
const styles=StyleSheet.create({
  btn:{padding:24, borderRadius:24, alignItems:'center', margin:8, minWidth:140, minHeight:140, justifyContent:'center', elevation:3},
  label:{fontSize:20, fontWeight:'800', color:'#333', marginTop:8, textAlign:'center'},
  emoji:{fontSize:48}
})
