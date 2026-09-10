import React from 'react'
import {StyleSheet, Text, useColorScheme, View} from 'react-native'
import {authPalette} from './theme'

export default function OrDivider({label = 'or'}: {label?: string}) {
  const c = authPalette(useColorScheme() === 'dark')
  return (
    <View style={styles.row}>
      <View style={[styles.line, {backgroundColor: c.inputBorder}]} />
      <Text style={[styles.text, {color: c.faint}]}>{label}</Text>
      <View style={[styles.line, {backgroundColor: c.inputBorder}]} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  line: {flex: 1, height: 1},
  text: {
    marginHorizontal: 12,
    fontSize: 12.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
})
