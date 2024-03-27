import { useTranslation } from 'react-i18next'
import { Flex, Icons, ImpactFeedbackStyle, Text, TouchableArea } from 'ui/src'
import { iconSizes } from 'ui/src/theme'

export function HiddenTokensRow({
  padded = false,
  numHidden,
  isExpanded,
  onPress,
}: {
  padded?: boolean
  numHidden: number
  isExpanded: boolean
  onPress: () => void
}): JSX.Element {
  const { t } = useTranslation()

  return (
    <TouchableArea
      hapticFeedback
      activeOpacity={1}
      hapticStyle={ImpactFeedbackStyle.Light}
      onPress={onPress}>
      <Flex
        row
        alignItems="center"
        justifyContent="space-between"
        px={padded ? '$spacing24' : '$none'}
        py="$spacing12">
        <Text color="$neutral2" variant="subheading2">
          {t('tokens.hidden.label', { numHidden })}
        </Text>
        {/* just used for opacity styling, the parent TouchableArea handles event */}
        <TouchableArea hapticFeedback hapticStyle={ImpactFeedbackStyle.Light} onPress={onPress}>
          <Flex
            row
            alignItems="center"
            backgroundColor="$surface2"
            borderRadius="$roundedFull"
            gap="$spacing2"
            justifyContent="center"
            pl="$spacing12"
            pr="$spacing8"
            py="$spacing8">
            <Text
              allowFontScaling={false}
              color="$neutral2"
              textAlign="center"
              userSelect="none"
              variant="buttonLabel3">
              {isExpanded ? t('common.button.hide') : t('common.button.show')}
            </Text>
            <Icons.RotatableChevron
              animation="semiBouncy"
              color="$neutral2"
              direction={isExpanded ? 'up' : 'down'}
              height={iconSizes.icon20}
              width={iconSizes.icon20}
            />
          </Flex>
        </TouchableArea>
      </Flex>
    </TouchableArea>
  )
}
