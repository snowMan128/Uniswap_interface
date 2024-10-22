/* eslint-disable complexity */
import { TFunction } from 'i18next'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, isWeb, Text, useIsShortMobileDevice } from 'ui/src'
import { GraduationCap } from 'ui/src/components/icons'
import { ElementName } from 'uniswap/src/features/telemetry/constants'
import Trace from 'uniswap/src/features/telemetry/Trace'
import {
  selectHasSubmittedHoldToSwap,
  selectHasViewedReviewScreen,
} from 'wallet/src/features/behaviorHistory/selectors'
import { useSwapFormContext } from 'wallet/src/features/transactions/contexts/SwapFormContext'
import {
  SwapScreen,
  useSwapScreenContext,
} from 'wallet/src/features/transactions/contexts/SwapScreenContext'
import { useTransactionModalContext } from 'wallet/src/features/transactions/contexts/TransactionModalContext'
import { useParsedSwapWarnings } from 'wallet/src/features/transactions/hooks/useParsedTransactionWarnings'
import {
  HoldToSwapProgressCircle,
  PROGRESS_CIRCLE_SIZE,
} from 'wallet/src/features/transactions/swap/HoldToSwapProgressCircle'
import { ViewOnlyModal } from 'wallet/src/features/transactions/swap/modals/ViewOnlyModal'
import { isWrapAction } from 'wallet/src/features/transactions/swap/utils'
import { WrapType } from 'wallet/src/features/transactions/types'
import { createTransactionId } from 'wallet/src/features/transactions/utils'
import { useIsBlockedActiveAddress } from 'wallet/src/features/trm/hooks'
import { AccountType } from 'wallet/src/features/wallet/accounts/types'
import { useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'
import { useAppSelector } from 'wallet/src/state'

export const HOLD_TO_SWAP_TIMEOUT = 3000

export function SwapFormButton(): JSX.Element {
  const { t } = useTranslation()
  const isShortMobileDevice = useIsShortMobileDevice()
  const activeAccount = useActiveAccountWithThrow()

  const { walletNeedsRestore } = useTransactionModalContext()
  const { screen, setScreen } = useSwapScreenContext()
  const { derivedSwapInfo, isSubmitting, updateSwapForm } = useSwapFormContext()
  const { blockingWarning } = useParsedSwapWarnings()

  const [showViewOnlyModal, setShowViewOnlyModal] = useState(false)

  const { wrapType, trade } = derivedSwapInfo

  const { isBlocked, isBlockedLoading } = useIsBlockedActiveAddress()

  const noValidSwap = !isWrapAction(wrapType) && !trade.trade

  const isSwapDataLoading = !isWrapAction(wrapType) && trade.loading

  const reviewButtonDisabled =
    isSwapDataLoading ||
    noValidSwap ||
    !!blockingWarning ||
    isBlocked ||
    isBlockedLoading ||
    walletNeedsRestore

  const isHoldToSwapPressed = screen === SwapScreen.SwapReviewHoldingToSwap || isSubmitting

  const hasViewedReviewScreen = useAppSelector(selectHasViewedReviewScreen)
  const hasSubmittedHoldToSwap = useAppSelector(selectHasSubmittedHoldToSwap)

  const isViewOnlyWallet = activeAccount.type === AccountType.Readonly
  const showHoldToSwapTip = hasViewedReviewScreen && !hasSubmittedHoldToSwap && !isViewOnlyWallet

  // Force users to view regular review screen before enabling hold to swap
  // Disable for view only because onSwap action will fail
  const enableHoldToSwap = !isWeb && hasViewedReviewScreen && !isViewOnlyWallet

  const onReview = useCallback(
    (nextScreen: SwapScreen) => {
      updateSwapForm({ txId: createTransactionId() })
      setScreen(nextScreen)
    },
    [setScreen, updateSwapForm]
  )

  const onReviewPress = useCallback(() => {
    if (isViewOnlyWallet) {
      setShowViewOnlyModal(true)
    } else {
      onReview(SwapScreen.SwapReview)
    }
  }, [onReview, isViewOnlyWallet])

  const onLongPressHoldToSwap = useCallback(() => {
    if (enableHoldToSwap) {
      onReview(SwapScreen.SwapReviewHoldingToSwap)
    } else if (isViewOnlyWallet) {
      setShowViewOnlyModal(true)
    }
  }, [enableHoldToSwap, onReview, isViewOnlyWallet])

  const onReleaseHoldToSwap = useCallback(() => {
    if (isHoldToSwapPressed && !isSubmitting) {
      setScreen(SwapScreen.SwapForm)
    }
  }, [isHoldToSwapPressed, isSubmitting, setScreen])

  const holdButtonText = useMemo(() => getHoldButtonActionText(wrapType, t), [t, wrapType])

  const hasButtonWarning = !!blockingWarning?.buttonText
  const buttonText = blockingWarning?.buttonText ?? t('swap.button.review')
  const buttonTextColor = hasButtonWarning ? '$neutral2' : '$white'
  const buttonBgColor = hasButtonWarning
    ? '$surface3'
    : isHoldToSwapPressed
    ? '$accent2'
    : '$accent1'

  return (
    <Flex alignItems="center" gap={isShortMobileDevice ? '$spacing8' : '$spacing16'}>
      {!isWeb && !isHoldToSwapPressed && showHoldToSwapTip && <HoldToInstantSwapRow />}

      <Trace logPress element={ElementName.SwapReview}>
        <Button
          hapticFeedback
          backgroundColor={buttonBgColor}
          disabled={reviewButtonDisabled && !isHoldToSwapPressed && !isViewOnlyWallet}
          // Override opacity only for view-only wallets
          opacity={isViewOnlyWallet ? 0.4 : undefined}
          size={isShortMobileDevice ? 'small' : isWeb ? 'medium' : 'large'}
          testID={ElementName.ReviewSwap}
          width="100%"
          onLongPress={onLongPressHoldToSwap}
          onPress={onReviewPress}
          onResponderRelease={onReleaseHoldToSwap}
          onResponderTerminate={onReleaseHoldToSwap}>
          {isHoldToSwapPressed ? (
            <Flex row gap="$spacing4" px="$spacing4">
              <HoldToSwapProgressCircle />

              <Text
                color="$accent1"
                flex={1}
                pr={PROGRESS_CIRCLE_SIZE}
                textAlign="center"
                variant="buttonLabel1">
                {holdButtonText}
              </Text>
            </Flex>
          ) : (
            <Text color={buttonTextColor} variant="buttonLabel1">
              {buttonText}
            </Text>
          )}
        </Button>
      </Trace>

      {showViewOnlyModal && <ViewOnlyModal onDismiss={(): void => setShowViewOnlyModal(false)} />}
    </Flex>
  )
}

function HoldToInstantSwapRow(): JSX.Element {
  const { t } = useTranslation()
  const isShortMobileDevice = useIsShortMobileDevice()

  return (
    <Flex centered row gap="$spacing4">
      <GraduationCap color="$neutral3" size="$icon.16" />
      <Text color="$neutral3" variant={isShortMobileDevice ? 'body4' : 'body3'}>
        {t('swap.hold.tip')}
      </Text>
    </Flex>
  )
}

function getHoldButtonActionText(wrapType: WrapType, t: TFunction): string {
  switch (wrapType) {
    case WrapType.Wrap:
      return t('swap.hold.wrap')
    case WrapType.Unwrap:
      return t('swap.hold.unwrap')
    case WrapType.NotApplicable:
      return t('swap.hold.swap')
  }
}
