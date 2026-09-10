// The line under a form that says why it did not go through. It shakes
// once as it appears, which is what draws the eye to it.

import React, {useEffect, useRef} from 'react'
import {Animated, Platform, StyleSheet, Text, useColorScheme} from 'react-native'
import {AlertCircle} from 'lucide-react-native'
import {authPalette} from './theme'

export default function FormError({message, style}: {message?: string; style?: object}) {
  const c = authPalette(useColorScheme() === 'dark')
  const shake = useRef(new Animated.Value(0)).current
  const fade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!message) return
    fade.setValue(0)
    shake.setValue(0)
    Animated.parallel([
      Animated.timing(fade, {toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web'}),
      Animated.sequence(
        [8, -8, 6, -6, 3, 0].map((x) =>
          Animated.timing(shake, {toValue: x, duration: 45, useNativeDriver: Platform.OS !== 'web'})
        )
      ),
    ]).start()
  }, [message, fade, shake])

  if (!message) return null

  return (
    <Animated.View style={[styles.box, {backgroundColor: c.errorBg, opacity: fade, transform: [{translateX: shake}]}, style]}>
      <AlertCircle size={16} color={c.error} />
      <Text style={[styles.text, {color: c.error}]}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
})
