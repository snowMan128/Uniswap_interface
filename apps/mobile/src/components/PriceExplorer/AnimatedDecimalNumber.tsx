import React, { memo, useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
import { AnimatedText } from 'src/components/text/AnimatedText'
import { Flex, useDeviceDimensions, useSporeColors } from 'ui/src'
import { fonts, TextVariantTokens } from 'ui/src/theme'
import { ValueAndFormatted } from './usePrice'

type AnimatedDecimalNumberProps = {
  number: ValueAndFormatted
  separator: string
  variant: TextVariantTokens
  wholePartColor?: string
  decimalPartColor?: string
  decimalThreshold?: number // below this value (not including) decimal part would have wholePartColor too
  testID?: string
  maxWidth?: number
  maxCharPixelWidth?: number
}

// Utility component to display decimal numbers where the decimal part
// is dimmed using AnimatedText
export const AnimatedDecimalNumber = memo(function AnimatedDecimalNumber(
  props: AnimatedDecimalNumberProps
): JSX.Element {
  const colors = useSporeColors()
  const { fullWidth } = useDeviceDimensions()
  const { fontScale } = useWindowDimensions()

  const {
    number,
    separator,
    variant,
    wholePartColor = colors.neutral1.val,
    decimalPartColor = colors.neutral3.val,
    decimalThreshold = 1,
    testID,
    maxWidth = fullWidth,
    maxCharPixelWidth: maxCharPixelWidthProp,
  } = props

  const wholePart = useDerivedValue(
    () => number.formatted.value.split(separator)[0] || '',
    [number, separator]
  )
  const decimalPart = useDerivedValue(
    () => separator + (number.formatted.value.split(separator)[1] || ''),
    [number, separator]
  )

  const wholeStyle = useMemo(() => {
    return {
      color: wholePartColor,
    }
  }, [wholePartColor])

  const decimalStyle = useAnimatedStyle(() => {
    return {
      color: number.value.value < decimalThreshold ? wholePartColor : decimalPartColor,
    }
  }, [decimalThreshold, wholePartColor, decimalPartColor])

  const fontSize = fonts[variant].fontSize * fontScale
  // Choose the arbitrary value that looks good for the font used
  const maxCharPixelWidth = maxCharPixelWidthProp ?? (2 / 3) * fontSize

  const adjustedFontSize = useDerivedValue(() => {
    const value = number.formatted.value
    const approxWidth = value.length * maxCharPixelWidth

    if (approxWidth <= maxWidth) {
      return fontSize
    }

    const scale = Math.min(1, maxWidth / approxWidth)
    return fontSize * scale
  })

  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: adjustedFontSize.value,
  }))

  return (
    <Flex row testID={testID}>
      <AnimatedText
        style={[wholeStyle, animatedStyle]}
        testID="wholePart"
        text={wholePart}
        variant={variant}
      />
      {decimalPart.value !== separator && (
        <AnimatedText
          style={[decimalStyle, animatedStyle]}
          testID="decimalPart"
          text={decimalPart}
          variant={variant}
        />
      )}
    </Flex>
  )
})
