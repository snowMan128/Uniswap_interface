import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { BackHeader } from 'src/components/layout/BackHeader'
import { Screen } from 'src/components/layout/Screen'
import { selectAllowAnalytics } from 'src/features/telemetry/selectors'
import { setAllowAnalytics } from 'src/features/telemetry/slice'
import { Flex, Text } from 'ui/src'
import { Switch } from 'wallet/src/components/buttons/Switch'

export function SettingsPrivacyScreen(): JSX.Element {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const analyticsAllowed = useAppSelector(selectAllowAnalytics)

  const onChangeAllowAnalytics = (enabled: boolean): void => {
    dispatch(setAllowAnalytics({ enabled }))
  }

  return (
    <Screen>
      <BackHeader alignment="center" mx="$spacing16" pt="$spacing16">
        <Text variant="body1">{t('Privacy')}</Text>
      </BackHeader>
      <Flex row gap="$spacing12" m="$spacing24">
        <Flex shrink gap="$spacing4">
          <Text variant="body2">{t('Allow analytics')}</Text>
          <Text color="$neutral2" variant="body3">
            {t(
              'We use anonymous usage data to enhance your experience across Uniswap Labs products. When disabled, we only track errors and essential usage.'
            )}
          </Text>
        </Flex>
        <Switch value={analyticsAllowed} onValueChange={onChangeAllowAnalytics} />
      </Flex>
    </Screen>
  )
}
