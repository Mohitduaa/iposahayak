// "Continue with Google", drawn the way Google's branding guide asks: white,
// the four-colour G, dark text.

import React, {useRef} from 'react'
import {ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, useColorScheme, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import {authPalette} from './theme'

const GoogleG = () => (
  <Svg width={20} height={20} viewBox='0 0 48 48'>
    <Path
      fill='#EA4335'
      d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
    />
    <Path
      fill='#4285F4'
      d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
    />
    <Path
      fill='#FBBC05'
      d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
    />
    <Path
      fill='#34A853'
      d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
    />
  </Svg>
)

interface Props {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  title?: string
}

export default function GoogleButton({onPress, loading, disabled, title = 'Continue with Google'}: Props) {
  const c = authPalette(useColorScheme() === 'dark')
  const off = disabled || loading

  // Sinks slightly under the finger, like the primary button
  const press = useRef(new Animated.Value(0)).current
  const setPressed = (down: boolean) =>
    Animated.spring(press, {toValue: down ? 1 : 0, friction: 6, tension: 120, useNativeDriver: Platform.OS !== 'web'}).start()
  const pressStyle = {transform: [{scale: press.interpolate({inputRange: [0, 1], outputRange: [1, 0.97]})}]}

  return (
    <Pressable onPress={onPress} disabled={off} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
      <Animated.View style={[styles.button, {backgroundColor: c.googleBg, borderColor: c.googleBorder}, off && styles.off, pressStyle]}>
        {loading ? (
          <ActivityIndicator color={c.googleText} />
        ) : (
          <View style={styles.row}>
            <GoogleG />
            <Text style={[styles.text, {color: c.googleText}]}>{title}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  off: {opacity: 0.7},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
})
