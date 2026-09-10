// The frame the auth screens sit in: gradient page, two soft glows, the
// app's logo and name, then a card that holds whatever form the screen needs.
//
// On open the brand settles in first, the card rises under it, the footer
// fades last. Short phones and the taller sign-up form get a compact header
// so the first field is on screen without scrolling; on tablets the card
// stops at a readable width instead of stretching edge to edge.
//
// The keyboard pushes the card up rather than covering the field being
// typed in, and taps outside a field dismiss it without swallowing the
// button press underneath.

import React, {useEffect, useRef, useState} from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {StatusBar} from 'expo-status-bar'
import {LinearGradient} from 'expo-linear-gradient'
import {authPalette} from './theme'
import Glow from './Glow'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Rendered under the card — the "already have an account?" line */
  footer?: React.ReactNode
  /** Smaller header, for a form that needs the room */
  compact?: boolean
}

// Animated transforms run on the UI thread natively; the web has no such thread
const NATIVE = Platform.OS !== 'web'

export default function AuthScreen({title, subtitle, children, footer, compact}: Props) {
  const isDark = useColorScheme() === 'dark'
  const c = authPalette(isDark)
  const {width, height} = useWindowDimensions()

  // "Is this a short phone?" is a question about the device, not about how much
  // room is left right now. useWindowDimensions shrinks when the keyboard opens,
  // so reading height here flipped `small` mid-focus: on an 875dp phone the
  // window drops to roughly 575dp, crossing the 720 threshold, and the whole
  // header relaid out underneath the field being tapped. Screen dimensions only
  // change on rotation, which is when we actually want to re-evaluate.
  const [screen, setScreen] = useState(() => Dimensions.get('screen'))
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({screen: next}) => setScreen(next))
    return () => sub.remove()
  }, [])

  const small = compact || screen.height < 720
  const landscape = screen.width > screen.height && screen.height < 600

  const brand = useRef(new Animated.Value(0)).current
  const card = useRef(new Animated.Value(0)).current
  const foot = useRef(new Animated.Value(0)).current
  const drift = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(110, [
      Animated.spring(brand, {toValue: 1, friction: 7, tension: 60, useNativeDriver: NATIVE}),
      Animated.timing(card, {toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE}),
      Animated.timing(foot, {toValue: 1, duration: 320, useNativeDriver: NATIVE}),
    ]).start()

    // The glows wander slowly so the page is not a still image
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE}),
        Animated.timing(drift, {toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE}),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [brand, card, foot, drift])

  const brandStyle = {
    opacity: brand,
    transform: [
      {translateY: brand.interpolate({inputRange: [0, 1], outputRange: [-14, 0]})},
      {scale: brand.interpolate({inputRange: [0, 1], outputRange: [0.92, 1]})},
    ],
  }
  const cardStyle = {
    opacity: card,
    transform: [{translateY: card.interpolate({inputRange: [0, 1], outputRange: [28, 0]})}],
  }
  const glowAStyle = {
    transform: [
      {translateX: drift.interpolate({inputRange: [0, 1], outputRange: [0, -26]})},
      {translateY: drift.interpolate({inputRange: [0, 1], outputRange: [0, 18]})},
    ],
  }
  const glowBStyle = {
    transform: [
      {translateX: drift.interpolate({inputRange: [0, 1], outputRange: [0, 22]})},
      {translateY: drift.interpolate({inputRange: [0, 1], outputRange: [0, -16]})},
    ],
  }

  const logoSize = small ? 56 : 76
  const logoInner = small ? 42 : 56

  return (
    <LinearGradient colors={c.bg} style={styles.page}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Depth behind the card */}
      <Glow color={c.glowA} size={520} style={styles.glowA} animatedStyle={glowAStyle} />
      <Glow color={c.glowB} size={440} style={styles.glowB} animatedStyle={glowBStyle} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
          <ScrollView
            contentContainerStyle={[styles.scroll, landscape && styles.scrollLandscape]}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.column, landscape && styles.columnLandscape]}>
              <Animated.View style={[styles.brand, small && styles.brandSmall, landscape && styles.brandLandscape, brandStyle]}>
                <View
                  style={[
                    styles.logoTile,
                    {width: logoSize, height: logoSize, borderRadius: logoSize * 0.29, borderColor: c.cardBorder, backgroundColor: c.card},
                  ]}
                >
                  <Image
                    source={require('../../assets/images/icon.png')}
                    style={{width: logoInner, height: logoInner, borderRadius: logoInner * 0.25}}
                  />
                </View>
                <Text style={[styles.wordmark, small && styles.wordmarkSmall, {color: c.text}]}>IPO Sahayak</Text>
                <Text style={[styles.tagline, {color: c.muted}]}>GMP · Allotment · Alerts</Text>
              </Animated.View>

              <Animated.View style={[styles.cardWrap, landscape && styles.cardWrapLandscape, cardStyle]}>
                <View style={[styles.card, {backgroundColor: c.card, borderColor: c.cardBorder}]}>
                  <Text style={[styles.title, {color: c.text}]}>{title}</Text>
                  {!!subtitle && <Text style={[styles.subtitle, {color: c.muted}]}>{subtitle}</Text>}
                  {children}
                </View>

                {footer ? <Animated.View style={[styles.footer, {opacity: foot}]}>{footer}</Animated.View> : null}
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  page: {flex: 1, overflow: 'hidden'},
  safe: {flex: 1},
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scrollLandscape: {
    paddingVertical: 16,
  },
  // Caps the card on tablets; on a phone the width is the screen's
  column: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  columnLandscape: {
    maxWidth: 860,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  glowA: {top: -220, right: -200},
  glowB: {bottom: -200, left: -190},
  brand: {
    alignItems: 'center',
    marginBottom: 22,
  },
  brandSmall: {
    marginBottom: 14,
  },
  brandLandscape: {
    flex: 1,
    marginBottom: 0,
  },
  logoTile: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#1E40AF',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  wordmarkSmall: {
    fontSize: 20,
  },
  tagline: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  cardWrap: {
    width: '100%',
  },
  cardWrapLandscape: {
    flex: 1.35,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
})
