import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { useAppDispatch } from 'src/app/hooks'
import { OnboardingStackParamList } from 'src/app/navigation/types'
import Trace from 'src/components/Trace/Trace'
import {
  LANDING_ANIMATION_DURATION,
  LandingBackground,
} from 'src/components/gradients/LandingBackground'
import { Screen } from 'src/components/layout/Screen'
import { openModal } from 'src/features/modals/modalSlice'
import { TermsOfService } from 'src/screens/Onboarding/TermsOfService'
import { OnboardingScreens, UnitagScreens } from 'src/screens/Screens'
import { hideSplashScreen } from 'src/utils/splashScreen'
import { AnimatedFlex, Flex, HapticFeedback, Text, TouchableArea, useIsDarkMode } from 'ui/src'
import { isDevEnv } from 'uniswap/src/utils/env'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { useTimeout } from 'utilities/src/time/timing'
import { ImportType, OnboardingEntryPoint } from 'wallet/src/features/onboarding/types'
import { useCanAddressClaimUnitag } from 'wallet/src/features/unitags/hooks'
import { createAccountActions } from 'wallet/src/features/wallet/create/createAccountSaga'
import {
  PendingAccountActions,
  pendingAccountActions,
} from 'wallet/src/features/wallet/create/pendingAccountsSaga'
import { ElementName, ModalName } from 'wallet/src/telemetry/constants'

type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.Landing>

export function LandingScreen({ navigation }: Props): JSX.Element {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const isDarkMode = useIsDarkMode()

  const actionButtonsOpacity = useSharedValue(0)
  const actionButtonsStyle = useAnimatedStyle(
    () => ({ opacity: actionButtonsOpacity.value }),
    [actionButtonsOpacity]
  )

  useEffect(() => {
    actionButtonsOpacity.value = withDelay(
      LANDING_ANIMATION_DURATION,
      withTiming(1, { duration: ONE_SECOND_MS })
    )
  }, [actionButtonsOpacity])

  const { canClaimUnitag } = useCanAddressClaimUnitag()

  const onPressCreateWallet = useCallback((): void => {
    dispatch(pendingAccountActions.trigger(PendingAccountActions.Delete))
    dispatch(createAccountActions.trigger())

    if (canClaimUnitag) {
      navigation.navigate(UnitagScreens.ClaimUnitag, {
        entryPoint: OnboardingScreens.Landing,
      })
    } else {
      // If can't claim, go direct to welcome screen
      navigation.navigate(OnboardingScreens.WelcomeWallet, {
        importType: ImportType.CreateNew,
        entryPoint: OnboardingEntryPoint.FreshInstallOrReplace,
      })
    }
  }, [canClaimUnitag, dispatch, navigation])

  const onPressImportWallet = (): void => {
    navigation.navigate(OnboardingScreens.ImportMethod, {
      importType: ImportType.NotYetSelected,
      entryPoint: OnboardingEntryPoint.FreshInstallOrReplace,
    })
  }

  // Hides lock screen on next js render cycle, ensuring this component is loaded when the screen is hidden
  useTimeout(hideSplashScreen, 1)

  return (
    // TODO(blocked by MOB-1082): delete bg prop
    // dark mode onboarding asset needs to be re-exported with #131313 (surface1) as background color
    <Screen backgroundColor={isDarkMode ? '$sporeBlack' : '$surface1'} edges={['bottom']}>
      <Flex fill gap="$spacing8">
        <Flex shrink height="100%" width="100%">
          <LandingBackground />
        </Flex>
        <AnimatedFlex grow height="auto" style={actionButtonsStyle}>
          <Flex grow $short={{ gap: '$spacing16' }} gap="$spacing24" mx="$spacing16">
            <Trace logPress element={ElementName.CreateAccount}>
              <Flex centered row>
                <TouchableArea
                  hapticFeedback
                  alignItems="center"
                  backgroundColor="$accent1"
                  borderRadius="$rounded20"
                  flexShrink={1}
                  hitSlop={16}
                  px="$spacing36"
                  py="$spacing16"
                  scaleTo={0.97}
                  shadowColor="$accent1"
                  shadowOpacity={0.4}
                  shadowRadius="$spacing8"
                  onPress={onPressCreateWallet}>
                  <Text color="$sporeWhite" variant="buttonLabel2">
                    {t('onboarding.landing.button.create')}
                  </Text>
                </TouchableArea>
              </Flex>
            </Trace>
            <Trace logPress element={ElementName.ImportAccount}>
              <TouchableArea
                hapticFeedback
                alignItems="center"
                hitSlop={16}
                testID={ElementName.ImportAccount}
                onLongPress={async (): Promise<void> => {
                  if (isDevEnv()) {
                    await HapticFeedback.selection()
                    dispatch(openModal({ name: ModalName.Experiments }))
                  }
                }}
                onPress={onPressImportWallet}>
                <Text
                  $short={{ variant: 'buttonLabel2', fontSize: '$medium' }}
                  color="$accent1"
                  variant="buttonLabel2">
                  {t('onboarding.landing.button.add')}
                </Text>
              </TouchableArea>
            </Trace>
            <Flex $short={{ py: '$none', mx: '$spacing12' }} mx="$spacing24" py="$spacing12">
              <TermsOfService />
            </Flex>
          </Flex>
        </AnimatedFlex>
      </Flex>
    </Screen>
  )
}
