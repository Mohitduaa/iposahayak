// One labelled field: icon, input, an eye toggle for passwords, and the
// error line under it. Errors show inline rather than in a popup, so the
// person sees which field is wrong while it is still on screen.

import React, {forwardRef, useState} from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import {Eye, EyeOff} from 'lucide-react-native'
import {authPalette} from './theme'

interface Props extends TextInputProps {
  label: string
  icon: React.ReactNode
  error?: string
  secure?: boolean
}

const AuthInput = forwardRef<TextInput, Props>(({label, icon, error, secure, style, ...rest}, ref) => {
  const c = authPalette(useColorScheme() === 'dark')
  const [focused, setFocused] = useState(false)
  const [shown, setShown] = useState(false)

  const border = error ? c.error : focused ? c.focus : c.inputBorder

  return (
    <View style={styles.field}>
      <Text style={[styles.label, {color: c.text}]}>{label}</Text>
      <View style={[styles.box, {backgroundColor: c.inputBg, borderColor: border}, focused && styles.boxFocused]}>
        <View style={styles.icon}>{icon}</View>
        <TextInput
          ref={ref}
          style={[styles.input, {color: c.text}, style]}
          placeholderTextColor={c.faint}
          secureTextEntry={secure && !shown}
          {...rest}
          onFocus={(e) => {
            setFocused(true)
            rest.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            rest.onBlur?.(e)
          }}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShown((s) => !s)} hitSlop={10} style={styles.eye}>
            {shown ? <EyeOff size={19} color={c.muted} /> : <Eye size={19} color={c.muted} />}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={[styles.error, {color: c.error}]}>{error}</Text>}
    </View>
  )
})

AuthInput.displayName = 'AuthInput'
export default AuthInput

const styles = StyleSheet.create({
  field: {marginBottom: 14},
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  // There used to be a `boxFocused` style here that added a blue shadow while
  // the field had focus. On Android under the New Architecture, adding shadow
  // props to a mounted View recreates the native view — which destroyed the
  // EditText inside it at the exact moment it took focus. Android then moved
  // focus to the next field, that one was recreated too, and the keyboard
  // closed again within ~250ms. The field was untypable on a real device while
  // working perfectly on web, where there is no such view recreation.
  //
  // Focus is shown with `border` (colour) and `boxFocused` (width) instead.
  // Border width and colour are plain layout/paint props: they update the
  // existing view rather than replacing it.
  boxFocused: {
    borderWidth: 2,
  },
  icon: {marginRight: 10},
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    // The browser draws its own focus ring; the box already shows focus
    ...(Platform.OS === 'web' ? ({outlineStyle: 'none'} as any) : null),
  },
  eye: {paddingLeft: 8},
  error: {
    marginTop: 6,
    fontSize: 12.5,
    fontWeight: '500',
  },
})
