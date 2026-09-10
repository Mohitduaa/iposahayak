// Six boxes for the sign-up code.
//
// One invisible TextInput holds the whole value; the boxes only display
// it. That way typing, backspace and pasting a code from the email all
// behave the way people expect, with no focus juggling between six fields.

import React, {useEffect, useRef, useState} from 'react'
import {Pressable, StyleSheet, Text, TextInput, useColorScheme, View} from 'react-native'
import {authPalette} from './theme'

interface Props {
  value: string
  onChange: (code: string) => void
  length?: number
  error?: boolean
  autoFocus?: boolean
}

export default function OtpInput({value, onChange, length = 6, error, autoFocus}: Props) {
  const c = authPalette(useColorScheme() === 'dark')
  const input = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (autoFocus) {
      // Give the screen a moment to finish its transition first
      const t = setTimeout(() => input.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [autoFocus])

  const digits = value.replace(/\D/g, '').slice(0, length)
  const activeIndex = Math.min(digits.length, length - 1)

  return (
    <Pressable onPress={() => input.current?.focus()} style={styles.wrap}>
      <View style={styles.row}>
        {Array.from({length}).map((_, i) => {
          const filled = i < digits.length
          const active = focused && i === activeIndex
          const border = error ? c.error : active ? c.focus : filled ? c.focus : c.inputBorder
          return (
            <View key={i} style={[styles.box, {backgroundColor: c.inputBg, borderColor: border}, active && styles.boxActive]}>
              <Text style={[styles.digit, {color: c.text}]}>{digits[i] || ''}</Text>
              {active && !digits[i] && <View style={[styles.caret, {backgroundColor: c.focus}]} />}
            </View>
          )
        })}
      </View>
      <TextInput
        ref={input}
        value={digits}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType='number-pad'
        textContentType='oneTimeCode'
        autoComplete='sms-otp'
        maxLength={length}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {marginBottom: 6},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Was a blue shadow, for the same reason AuthInput's focus ring was — and it
  // carried the same defect. Toggling shadow props on a mounted View recreates
  // the native view on Android's New Architecture, and `active` changes on
  // every keystroke here, so each digit rebuilt a box next to the hidden input
  // that is holding the code. Border width is a paint change, not a rebuild.
  boxActive: {
    borderWidth: 2,
  },
  digit: {
    fontSize: 22,
    fontWeight: '700',
  },
  caret: {
    position: 'absolute',
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
})
