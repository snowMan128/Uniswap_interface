import { SharedEventName } from '@uniswap/analytics-events'
import React from 'react'
import { useTranslation } from 'react-i18next'
import 'react-native-reanimated'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { navigate } from 'src/app/navigation/rootNavigation'
import { closeModal } from 'src/features/modals/modalSlice'
import { selectModalState } from 'src/features/modals/selectModalState'
import { TermsOfService } from 'src/screens/Onboarding/TermsOfService'
import { Screens, UnitagScreens } from 'src/screens/Screens'
import { Button, Flex, GeneratedIcon, Icons, Image, Text, useIsDarkMode } from 'ui/src'
import { UNITAGS_INTRO_BANNER_DARK, UNITAGS_INTRO_BANNER_LIGHT } from 'ui/src/assets'
import { iconSizes } from 'ui/src/theme'
import { BottomSheetModal } from 'wallet/src/components/modals/BottomSheetModal'
import { sendWalletAnalyticsEvent } from 'wallet/src/telemetry'
import { ModalName } from 'wallet/src/telemetry/constants'

export function UnitagsIntroModal(): JSX.Element {
  const { t } = useTranslation()
  const isDarkMode = useIsDarkMode()
  const appDispatch = useAppDispatch()
  const modalState = useAppSelector(selectModalState(ModalName.UnitagsIntro)).initialState
  const address = modalState?.address
  const entryPoint = modalState?.entryPoint

  const onClose = (): void => {
    appDispatch(closeModal({ name: ModalName.UnitagsIntro }))
  }

  const onPressClaimOneNow = (): void => {
    if (!entryPoint) {
      throw new Error('Missing entry point in UnitagsIntroModal')
    }
    navigate(Screens.UnitagStack, {
      screen: UnitagScreens.ClaimUnitag,
      params: {
        entryPoint,
        address,
      },
    })
    if (address) {
      sendWalletAnalyticsEvent(SharedEventName.TERMS_OF_SERVICE_ACCEPTED, { address })
    }
    onClose()
  }

  return (
    <BottomSheetModal name={ModalName.UnitagsIntro} onClose={onClose}>
      <Flex gap="$spacing24" px="$spacing24" py="$spacing16">
        <Flex alignItems="center" gap="$spacing12">
          <Text variant="subheading1">{t('Introducing usernames')}</Text>
          <Text color="$neutral2" textAlign="center" variant="body3">
            {t(
              'Say goodbye to 0x addresses. Usernames are readable names that make it easier to send and receive crypto.'
            )}
          </Text>
        </Flex>
        <Flex alignItems="center" maxHeight={100}>
          <Image
            maxHeight={100}
            resizeMode="contain"
            source={isDarkMode ? UNITAGS_INTRO_BANNER_DARK : UNITAGS_INTRO_BANNER_LIGHT}
          />
        </Flex>
        <Flex gap="$spacing16" px="$spacing20">
          <BodyItem Icon={Icons.UserSquare} title={t('Customizable profiles')} />
          <BodyItem Icon={Icons.Ticket} title={t('Free to claim')} />
          <BodyItem Icon={Icons.Lightning} title={t('Powered by ENS subdomains')} />
        </Flex>
        <Flex gap="$spacing8">
          <Button size="medium" theme="primary" onPress={onPressClaimOneNow}>
            {t('Continue')}
          </Button>
        </Flex>
        <Flex $short={{ py: '$none', mx: '$spacing12' }} mx="$spacing24">
          <TermsOfService />
        </Flex>
      </Flex>
    </BottomSheetModal>
  )
}

function BodyItem({ Icon, title }: { Icon: GeneratedIcon; title: string }): JSX.Element {
  return (
    <Flex row alignItems="center" gap="$spacing16">
      <Icon color="$accent1" size={iconSizes.icon20} strokeWidth={2} />
      <Text color="$neutral2" variant="body3">
        {title}
      </Text>
    </Flex>
  )
}
