import { SharedEventName } from '@uniswap/analytics-events'
import { useAppDispatch } from 'src/app/hooks'
import { OnboardingStackBaseParams, useOnboardingStackNavigation } from 'src/app/navigation/types'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { MobileAppsFlyerEvents, MobileEventName } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent, sendAppsFlyerEvent } from 'uniswap/src/features/telemetry/send'
import { ImportType, OnboardingEntryPoint } from 'uniswap/src/types/onboarding'
import { MobileScreens } from 'uniswap/src/types/screens/mobile'
import { useTrace } from 'utilities/src/telemetry/trace/TraceContext'
import {
  setHasSkippedUnitagPrompt,
  setHasViewedUniconV2IntroModal,
} from 'wallet/src/features/behaviorHistory/slice'
import { pushNotification } from 'wallet/src/features/notifications/slice'
import { AppNotificationType } from 'wallet/src/features/notifications/types'
import { useClaimUnitag } from 'wallet/src/features/unitags/hooks'
import { Account, BackupType } from 'wallet/src/features/wallet/accounts/types'
import {
  PendingAccountActions,
  pendingAccountActions,
} from 'wallet/src/features/wallet/create/pendingAccountsSaga'
import { usePendingAccounts } from 'wallet/src/features/wallet/hooks'
import { setFinishedOnboarding } from 'wallet/src/features/wallet/slice'

export type OnboardingCompleteProps = OnboardingStackBaseParams

/**
 * Bundles various actions that should be performed to complete onboarding.
 *
 * Used within the final screen of various onboarding flows.
 */
export function useCompleteOnboardingCallback({
  entryPoint,
  importType,
  unitagClaim,
}: OnboardingStackBaseParams): () => Promise<void> {
  const dispatch = useAppDispatch()
  const pendingAccounts = usePendingAccounts()
  const pendingWalletAddresses = Object.keys(pendingAccounts)
  const parentTrace = useTrace()
  const navigation = useOnboardingStackNavigation()

  const claimUnitag = useClaimUnitag()

  const uniconsV2Enabled = useFeatureFlag(FeatureFlags.UniconsV2)

  return async () => {
    sendAnalyticsEvent(
      entryPoint === OnboardingEntryPoint.Sidebar
        ? MobileEventName.WalletAdded
        : MobileEventName.OnboardingCompleted,
      {
        wallet_type: importType,
        accounts_imported_count: pendingWalletAddresses.length,
        wallets_imported: pendingWalletAddresses,
        cloud_backup_used: Object.values(pendingAccounts).some((acc: Account) =>
          acc.backups?.includes(BackupType.Cloud)
        ),
        ...parentTrace,
      }
    )

    // Log TOS acceptance for new wallets before they are activated
    if (entryPoint === OnboardingEntryPoint.FreshInstallOrReplace) {
      pendingWalletAddresses.forEach((address: string) => {
        sendAnalyticsEvent(SharedEventName.TERMS_OF_SERVICE_ACCEPTED, { address })
      })
    }

    // Claim unitag if there's a claim to process
    if (unitagClaim) {
      const { claimError } = await claimUnitag(unitagClaim, {
        source: 'onboarding',
        hasENSAddress: false,
      })
      if (claimError) {
        dispatch(
          pushNotification({
            type: AppNotificationType.Error,
            errorMessage: claimError,
          })
        )
      }
    }

    // Remove pending flag from all new accounts.
    dispatch(pendingAccountActions.trigger(PendingAccountActions.Activate))

    // Dismiss unitags prompt if the onboarding method prompts for unitags (create new)
    if (importType === ImportType.CreateNew) {
      dispatch(setHasSkippedUnitagPrompt(true))
    }

    if (uniconsV2Enabled) {
      // Don't show Unicon V2 intro modal to new users
      dispatch(setHasViewedUniconV2IntroModal(true))
    }

    // Exit flow
    dispatch(setFinishedOnboarding({ finishedOnboarding: true }))
    if (entryPoint === OnboardingEntryPoint.Sidebar) {
      navigation.navigate(MobileScreens.Home)
    }

    if (entryPoint === OnboardingEntryPoint.FreshInstallOrReplace) {
      await sendAppsFlyerEvent(MobileAppsFlyerEvents.OnboardingCompleted, { importType })
    }
  }
}
