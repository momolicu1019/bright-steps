
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function TeacherDashboardScreen(){
  return (<View style={styles.c}><Text style={styles.t}>Teacher Dashboard</Text><Text>Class: Early Learners - 12 students{'
'}Assign: Visual Schedule - Morning{'
'}Export report PDF</Text></View>)
}
const styles=StyleSheet.create({c:{flex:1, padding:20, backgroundColor:'#F5F5F5'}, t:{fontSize:24, fontWeight:'800'}})
