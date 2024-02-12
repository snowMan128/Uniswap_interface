import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { default as React, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { navigate } from 'src/app/navigation/rootNavigation'
import { UnitagStackParamList } from 'src/app/navigation/types'
import Trace from 'src/components/Trace/Trace'
import { SafeKeyboardOnboardingScreen } from 'src/features/onboarding/SafeKeyboardOnboardingScreen'
import { OnboardingScreens, Screens, UnitagScreens } from 'src/screens/Screens'
import { useAddBackButton } from 'src/utils/useAddBackButton'
import {
  AnimatedFlex,
  AnimatePresence,
  Button,
  Flex,
  Icons,
  Text,
  TouchableArea,
  useSporeColors,
} from 'ui/src'
import Unitag from 'ui/src/assets/graphics/unitag.svg'
import InfoCircle from 'ui/src/assets/icons/info-circle.svg'
import { fonts, iconSizes, imageSizes, spacing } from 'ui/src/theme'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { useDebounce } from 'utilities/src/time/timing'
import { TextInput } from 'wallet/src/components/input/TextInput'
import { WarningModal } from 'wallet/src/components/modals/WarningModal/WarningModal'
import { Pill } from 'wallet/src/components/text/Pill'
import { ImportType, OnboardingEntryPoint } from 'wallet/src/features/onboarding/types'
import { UNITAG_SUFFIX } from 'wallet/src/features/unitags/constants'
import { useUnitagError } from 'wallet/src/features/unitags/hooks'
import { useActiveAccountAddress, usePendingAccounts } from 'wallet/src/features/wallet/hooks'
import { ElementName, ModalName } from 'wallet/src/telemetry/constants'
import { shortenAddress } from 'wallet/src/utils/addresses'
import { useDynamicFontSizing } from 'wallet/src/utils/useDynamicFontSizing'

const MAX_UNITAG_CHAR_LENGTH = 20

const MAX_INPUT_FONT_SIZE = 36
const MIN_INPUT_FONT_SIZE = 26
const MAX_CHAR_PIXEL_WIDTH = 24

type Props = NativeStackScreenProps<UnitagStackParamList, UnitagScreens.ClaimUnitag>

export function ClaimUnitagScreen({ navigation, route }: Props): JSX.Element {
  const { entryPoint } = route.params

  useAddBackButton(navigation)
  const { t } = useTranslation()
  const colors = useSporeColors()

  const activeAddress = useActiveAccountAddress()
  const pendingAccountAddress = Object.values(usePendingAccounts())?.[0]?.address
  const unitagAddress = activeAddress || pendingAccountAddress

  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showTextInputView, setShowTextInputView] = useState(true)
  const [unitagInputValue, setUnitagInputValue] = useState<string | undefined>(undefined)

  const addressViewOpacity = useSharedValue(1)
  const unitagInputContainerTranslateY = useSharedValue(0)
  const addressViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: addressViewOpacity.value,
    }
  })

  const debouncedInputValue = useDebounce(unitagInputValue, ONE_SECOND_MS)
  const { unitagError, loading } = useUnitagError(unitagAddress, debouncedInputValue)

  const isUnitagValid = !unitagError && !loading && !!unitagInputValue

  const { onLayout, fontSize, onSetFontSize } = useDynamicFontSizing(
    MAX_CHAR_PIXEL_WIDTH,
    MAX_INPUT_FONT_SIZE,
    MIN_INPUT_FONT_SIZE
  )

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // When returning back to this screen, handle animating the Unitag logo out and text input in
      if (showTextInputView) {
        return
      }

      unitagInputContainerTranslateY.value = withTiming(
        unitagInputContainerTranslateY.value - imageSizes.image100 - spacing.spacing48,
        {
          duration: 500,
        }
      )
      setTimeout(() => {
        setShowTextInputView(true)
        addressViewOpacity.value = withTiming(1, { duration: 500 })
      }, ONE_SECOND_MS)
    })

    return unsubscribe
  }, [
    navigation,
    showTextInputView,
    setShowTextInputView,
    addressViewOpacity,
    unitagInputContainerTranslateY,
  ])

  const onChangeTextInput = useCallback(
    (text: string): void => {
      if (text.length > MAX_UNITAG_CHAR_LENGTH) {
        return
      }

      onSetFontSize(text)
      setUnitagInputValue(text?.trim())
    },
    [onSetFontSize, setUnitagInputValue]
  )

  const onPressAddressTooltip = (): void => {
    Keyboard.dismiss()
    setShowInfoModal(true)
  }

  const onPressMaybeLater = (): void => {
    navigate(Screens.OnboardingStack, {
      screen: OnboardingScreens.EditName,
      params: {
        importType: ImportType.CreateNew,
        entryPoint: OnboardingEntryPoint.FreshInstallOrReplace,
      },
    })
  }

  const onPressContinue = (): void => {
    if (!unitagInputValue) {
      return
    }

    // Animate the Unitag logo in and text input out
    setShowTextInputView(false)
    addressViewOpacity.value = withTiming(0, { duration: 500 })
    // Intentionally delay 1s to allow enter/exit animations to finish
    unitagInputContainerTranslateY.value = withDelay(
      ONE_SECOND_MS,
      withTiming(unitagInputContainerTranslateY.value + imageSizes.image100 + spacing.spacing48, {
        duration: 500,
      })
    )
    // Navigate to ChooseProfilePicture screen after 1s delay to allow animations to finish
    setTimeout(() => {
      navigate(
        entryPoint === OnboardingScreens.Landing ? Screens.OnboardingStack : Screens.UnitagStack,
        {
          screen: UnitagScreens.ChooseProfilePicture,
          params: { entryPoint, unitag: unitagInputValue },
        }
      )
    }, ONE_SECOND_MS)
  }

  return (
    <SafeKeyboardOnboardingScreen
      subtitle={t('This is your personalized address that people can send crypto to.')}
      title={t('Claim your username')}>
      <Flex centered gap="$spacing16">
        {/* Fixed text that animates in when TextInput is animated out */}
        <AnimatedFlex
          centered
          height={fonts.heading2.lineHeight}
          style={{ transform: [{ translateY: unitagInputContainerTranslateY }] }}>
          {!showTextInputView && (
            <Flex
              row
              alignSelf="center"
              animation="lazy"
              // eslint-disable-next-line react-native/no-inline-styles
              enterStyle={{ o: 0 }}
              // eslint-disable-next-line react-native/no-inline-styles
              exitStyle={{ o: 0 }}
              gap="$spacing20"
              opacity={showTextInputView ? 0 : 1}
              position="absolute">
              <Text
                color="$neutral1"
                fontFamily="$heading"
                fontSize={fontSize}
                fontWeight={fonts.heading2.fontWeight}
                lineHeight={fonts.heading2.lineHeight}>
                {unitagInputValue}
              </Text>
              <Flex
                row
                animation="lazy"
                // eslint-disable-next-line react-native/no-inline-styles
                enterStyle={{ o: 0, scale: 0.8, x: 20 }}
                // eslint-disable-next-line react-native/no-inline-styles
                exitStyle={{ o: 0, scale: 0.8, x: -20 }}
                position="absolute"
                right={-iconSizes.icon8}
                top={-iconSizes.icon8}>
                <Unitag height={iconSizes.icon24} width={iconSizes.icon24} />
              </Flex>
            </Flex>
          )}
          <AnimatePresence>
            {showTextInputView && (
              <Flex
                key="input-container"
                row
                animation="quick"
                // eslint-disable-next-line react-native/no-inline-styles
                enterStyle={{ o: 0, x: 40 }}
                // eslint-disable-next-line react-native/no-inline-styles
                exitStyle={{ o: 0, x: 40 }}
                gap="$none"
                onLayout={onLayout}>
                <TextInput
                  autoFocus
                  blurOnSubmit
                  adjustsFontSizeToFit={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  borderWidth={0}
                  fontFamily="$heading"
                  fontSize={fontSize}
                  fontWeight="$large"
                  numberOfLines={1}
                  p="$none"
                  placeholder="yourname"
                  placeholderTextColor="$neutral3"
                  returnKeyType="done"
                  textAlign="left"
                  value={unitagInputValue}
                  onChangeText={onChangeTextInput}
                />
                <Text
                  key="uni.eth"
                  animation="lazy"
                  color="$neutral1"
                  // eslint-disable-next-line react-native/no-inline-styles
                  enterStyle={{ o: 0, x: 40 }}
                  // eslint-disable-next-line react-native/no-inline-styles
                  exitStyle={{ o: 0, x: 40 }}
                  fontFamily="$heading"
                  fontSize={fontSize}
                  fontWeight={fonts.heading2.fontWeight}
                  lineHeight={fonts.heading2.lineHeight}>
                  {UNITAG_SUFFIX}
                </Text>
              </Flex>
            )}
          </AnimatePresence>
        </AnimatedFlex>
        <AnimatedFlex
          row
          alignItems="center"
          gap="$spacing8"
          style={addressViewAnimatedStyle}
          onPress={onPressAddressTooltip}>
          <Text color="$neutral2" variant="subheading2">
            {shortenAddress(unitagAddress ?? ADDRESS_ZERO)}
          </Text>
          <TouchableArea
            onPress={(): void => {
              Keyboard.dismiss()
              setShowInfoModal(true)
            }}>
            <InfoCircle color={colors.neutral2.get()} height={20} width={20} />
          </TouchableArea>
        </AnimatedFlex>
        {!loading && unitagError && (
          <Flex centered row gap="$spacing8">
            <Text color={unitagError ? '$statusCritical' : '$statusSuccess'} variant="body2">
              {unitagError}
            </Text>
          </Flex>
        )}
      </Flex>
      <Flex gap="$spacing24" justifyContent="flex-end">
        {entryPoint === OnboardingScreens.Landing && (
          <Trace logPress element={ElementName.Skip}>
            <TouchableArea onPress={onPressMaybeLater}>
              <Text color="$accent1" textAlign="center" variant="buttonLabel2">
                {t('Maybe later')}
              </Text>
            </TouchableArea>
          </Trace>
        )}
        <Button disabled={!isUnitagValid} size="medium" theme="primary" onPress={onPressContinue}>
          {t('Continue')}
        </Button>
      </Flex>
      {showInfoModal && (
        <InfoModal
          unitag={unitagInputValue}
          unitagAddress={unitagAddress}
          onClose={(): void => setShowInfoModal(false)}
        />
      )}
    </SafeKeyboardOnboardingScreen>
  )
}

const InfoModal = ({
  unitag,
  unitagAddress,
  onClose,
}: {
  unitag: string | undefined
  unitagAddress: string | undefined
  onClose: () => void
}): JSX.Element => {
  const colors = useSporeColors()
  const { t } = useTranslation()

  return (
    <WarningModal
      backgroundIconColor={colors.surface1.get()}
      caption={t(
        `Usernames are free, readable names that map to your 0x address. They’re easier to remember and share than a typical crypto address.`
      )}
      closeText={t('Close')}
      icon={
        <Flex centered row gap="$spacing4">
          <Pill
            customBackgroundColor={colors.surface1.val}
            foregroundColor={colors.neutral2.val}
            label={shortenAddress(unitagAddress ?? ADDRESS_ZERO)}
            px="$spacing12"
            shadowColor="$neutral3"
            shadowOpacity={0.4}
            shadowRadius="$spacing4"
            textVariant="buttonLabel4"
          />
          <Flex p="$spacing2" shadowColor="$accent1" shadowOpacity={1} shadowRadius="$spacing16">
            <Icons.LinkHorizontalAlt color={colors.neutral2.get()} size={iconSizes.icon24} />
          </Flex>
          <Pill
            customBackgroundColor={colors.surface1.val}
            foregroundColor={colors.accent1.val}
            px="$spacing12"
            shadowColor="$neutral3"
            shadowOpacity={0.4}
            shadowRadius="$spacing4"
            textVariant="buttonLabel4">
            <Text color="$accent1" variant="buttonLabel2">
              {unitag ? unitag : 'yourname'}
              <Text color="$neutral2" variant="buttonLabel2">
                {UNITAG_SUFFIX}
              </Text>
            </Text>
          </Pill>
        </Flex>
      }
      modalName={ModalName.TooltipContent}
      title={t('A simplified address')}
      onClose={onClose}
    />
  )
}
