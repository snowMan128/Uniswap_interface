import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Icons, isWeb, useSporeColors } from 'ui/src'
import { uniswapUrls } from 'uniswap/src/constants/urls'
import { WarningInfo } from 'wallet/src/components/modals/WarningModal/WarningInfo'
import { WarningTooltipProps } from 'wallet/src/components/modals/WarningModal/WarningTooltipProps'
import { LearnMoreLink } from 'wallet/src/components/text/LearnMoreLink'
import { WarningSeverity } from 'wallet/src/features/transactions/WarningModal/types'
import { ModalName } from 'wallet/src/telemetry/constants'

export function NetworkFeeWarning({
  children,
  showGasIcon = false,
  placement = 'top',
}: PropsWithChildren<{
  showGasIcon?: boolean
  placement?: WarningTooltipProps['placement']
}>): JSX.Element {
  const colors = useSporeColors()
  const { t } = useTranslation()

  const caption = t('swap.warning.networkFee.message')

  return (
    <WarningInfo
      infoButton={
        <LearnMoreLink
          textVariant={isWeb ? 'buttonLabel4' : undefined}
          url={uniswapUrls.helpArticleUrls.networkFeeInfo}
        />
      }
      modalProps={{
        backgroundIconColor: colors.surface2.get(),
        caption,
        closeText: t('common.button.close'),
        icon: <Icons.Gas color="$neutral2" size="$icon.24" />,
        modalName: ModalName.NetworkFeeInfo,
        severity: WarningSeverity.None,
        title: t('transaction.networkCost.label'),
      }}
      tooltipProps={{ text: caption, placement }}
      trigger={showGasIcon ? <Icons.Gas color="$neutral2" size="$icon.16" /> : undefined}
      triggerPlacement={showGasIcon ? 'start' : undefined}>
      {children}
    </WarningInfo>
  )
}
