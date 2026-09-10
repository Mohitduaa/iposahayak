// The one blue call-to-action each auth screen has.
//
// A soft sheen sweeps across it every few seconds so it reads as the thing
// to press; under the finger it sinks slightly and the arrow nudges right.

import React, {useEffect, useRef} from 'react'
import {ActivityIndicator, Animated, Easing, Platform, Pressable, StyleSheet, Text, useColorScheme, View} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import {ArrowRight} from 'lucide-react-native'
import {authPalette} from './theme'

interface Props {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

const NATIVE = Platform.OS !== 'web'

export default function PrimaryButton({title, onPress, loading, disabled}: Props) {
  const c = authPalette(useColorScheme() === 'dark')
  const off = disabled || loading

  const press = useRef(new Animated.Value(0)).current
  const sheen = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(sheen, {toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE}),
        Animated.timing(sheen, {toValue: 0, duration: 0, useNativeDriver: NATIVE}),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [sheen])

  const setPressed = (down: boolean) =>
    Animated.spring(press, {toValue: down ? 1 : 0, friction: 6, tension: 120, useNativeDriver: NATIVE}).start()

  const wrapStyle = {
    transform: [{scale: press.interpolate({inputRange: [0, 1], outputRange: [1, 0.97]})}],
  }
  const arrowStyle = {
    transform: [{translateX: press.interpolate({inputRange: [0, 1], outputRange: [0, 4]})}],
  }
  const sheenStyle = {
    transform: [{translateX: sheen.interpolate({inputRange: [0, 1], outputRange: [-220, 420]})}, {rotate: '18deg'}],
  }

  return (
    <Pressable onPress={onPress} disabled={off} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
      <Animated.View style={[styles.wrap, off && styles.off, wrapStyle]}>
        <LinearGradient colors={c.primary} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.button}>
          {!off && (
            <Animated.View pointerEvents='none' style={[styles.sheen, sheenStyle]}>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
          {loading ? (
            <ActivityIndicator color='#FFFFFF' />
          ) : (
            <View style={styles.row}>
              <Text style={styles.text}>{title}</Text>
              <Animated.View style={arrowStyle}>
                <ArrowRight size={18} color='#FFFFFF' strokeWidth={2.5} />
              </Animated.View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  off: {opacity: 0.7},
  button: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 90,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
