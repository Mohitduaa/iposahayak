// A soft pool of colour behind the card.
//
// React Native has no radial gradient of its own and blur filters do not
// render on Android, so the glow is an SVG circle filled with a radial
// gradient that fades to nothing at the rim.

import React, {useRef} from 'react'
import {Animated, StyleSheet, ViewStyle} from 'react-native'
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg'

interface Props {
  /** "rgba(r, g, b, a)" — the alpha is the glow's strength at its centre */
  color: string
  size: number
  style?: ViewStyle
  animatedStyle?: object
}

let counter = 0

function split(color: string): {rgb: string; alpha: number} {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i)
  if (!m) return {rgb: color, alpha: 0.3}
  return {rgb: `rgb(${m[1]}, ${m[2]}, ${m[3]})`, alpha: m[4] === undefined ? 1 : Number(m[4])}
}

export default function Glow({color, size, style, animatedStyle}: Props) {
  // Gradient ids are global to the page on the web, so each glow gets its own
  const id = useRef(`glow-${counter++}`).current
  const {rgb, alpha} = split(color)
  const half = size / 2

  return (
    <Animated.View pointerEvents='none' style={[styles.wrap, {width: size, height: size}, style, animatedStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx='50%' cy='50%' r='50%'>
            <Stop offset='0%' stopColor={rgb} stopOpacity={alpha} />
            <Stop offset='55%' stopColor={rgb} stopOpacity={alpha * 0.45} />
            <Stop offset='100%' stopColor={rgb} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={half} cy={half} r={half} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {position: 'absolute'},
})
