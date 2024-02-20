import { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUniqueId } from 'react-native-device-info'
import { logger } from 'utilities/src/logger/logger'
import { useAsyncData } from 'utilities/src/react/hooks'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { ChainId } from 'wallet/src/constants/chains'
import { useENS } from 'wallet/src/features/ens/useENS'
import { FEATURE_FLAGS } from 'wallet/src/features/experiments/constants'
import { useFeatureFlag } from 'wallet/src/features/experiments/hooks'
import {
  claimUnitag,
  getUnitagAvatarUploadUrl,
  useUnitagByAddressQuery,
  useUnitagClaimEligibilityQuery,
  useUnitagQuery,
} from 'wallet/src/features/unitags/api'
import {
  isLocalFileUri,
  uploadAndUpdateAvatarAfterClaim,
} from 'wallet/src/features/unitags/avatars'
import {
  AVATAR_UPLOAD_CREDS_EXPIRY_SECONDS,
  UNITAG_VALID_REGEX,
} from 'wallet/src/features/unitags/constants'
import { useUnitagUpdater } from 'wallet/src/features/unitags/context'
import {
  UnitagAddressResponse,
  UnitagClaim,
  UnitagClaimContext,
  UnitagErrorCodes,
  UnitagGetAvatarUploadUrlResponse,
  UnitagUsernameResponse,
} from 'wallet/src/features/unitags/types'
import { parseUnitagErrorCode } from 'wallet/src/features/unitags/utils'
import { Account } from 'wallet/src/features/wallet/accounts/types'
import { useWalletSigners } from 'wallet/src/features/wallet/context'
import {
  useAccounts,
  useActiveAccountAddressWithThrow,
  usePendingAccounts,
} from 'wallet/src/features/wallet/hooks'
import { SignerManager } from 'wallet/src/features/wallet/signing/SignerManager'
import { sendWalletAnalyticsEvent } from 'wallet/src/telemetry'
import { UnitagEventName } from 'wallet/src/telemetry/constants'
import { areAddressesEqual } from 'wallet/src/utils/addresses'

const MIN_UNITAG_LENGTH = 3
const MAX_UNITAG_LENGTH = 20

export const useCanActiveAddressClaimUnitag = (): {
  canClaimUnitag: boolean
} => {
  const unitagsFeatureFlagEnabled = useFeatureFlag(FEATURE_FLAGS.Unitags)
  const activeAddress = useActiveAccountAddressWithThrow()
  const { data: deviceId } = useAsyncData(getUniqueId)
  const { refetchUnitagsCounter } = useUnitagUpdater()
  const skip = !unitagsFeatureFlagEnabled || !deviceId

  const { loading, data, refetch } = useUnitagClaimEligibilityQuery({
    address: activeAddress,
    deviceId: deviceId ?? '', // this is fine since we skip if deviceId is undefined
    skip,
  })

  // Force refetch of canClaimUnitag if refetchUnitagsCounter changes
  useEffect(() => {
    if (skip || loading) {
      return
    }

    refetch?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchUnitagsCounter])

  return {
    canClaimUnitag: !loading && !!data?.canClaim,
  }
}

export const useCanAddressClaimUnitag = (
  address?: Address,
  isUsernameChange?: boolean
): { canClaimUnitag: boolean; errorCode?: UnitagErrorCodes } => {
  const unitagsFeatureFlagEnabled = useFeatureFlag(FEATURE_FLAGS.Unitags)
  const { data: deviceId } = useAsyncData(getUniqueId)
  const skip = !unitagsFeatureFlagEnabled || !deviceId
  const { loading, data } = useUnitagClaimEligibilityQuery({
    address,
    deviceId: deviceId ?? '', // this is fine since we skip if deviceId is undefined
    isUsernameChange,
    skip,
  })
  return {
    canClaimUnitag: !loading && !!data?.canClaim,
    errorCode: data?.errorCode,
  }
}

export const useUnitagByAddress = (
  address?: Address,
  forceEnable?: boolean
): { unitag?: UnitagAddressResponse; loading: boolean } => {
  const unitagsFeatureFlagEnabled = useFeatureFlag(FEATURE_FLAGS.Unitags) || forceEnable
  const { data, loading, refetch } = useUnitagByAddressQuery(
    unitagsFeatureFlagEnabled ? address : undefined
  )

  // Force refetch if counter changes
  const { refetchUnitagsCounter } = useUnitagUpdater()
  useEffect(() => {
    if (!unitagsFeatureFlagEnabled || loading) {
      return
    }

    refetch?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchUnitagsCounter])

  return { unitag: data, loading }
}

export const useUnitagByName = (
  name?: string,
  forceEnable?: boolean
): { unitag?: UnitagUsernameResponse; loading: boolean } => {
  const unitagsFeatureFlagEnabled = useFeatureFlag(FEATURE_FLAGS.Unitags) || forceEnable
  const { data, loading, refetch } = useUnitagQuery(unitagsFeatureFlagEnabled ? name : undefined)

  // Force refetch if counter changes
  const { refetchUnitagsCounter } = useUnitagUpdater()
  useEffect(() => {
    if (!unitagsFeatureFlagEnabled || loading) {
      return
    }

    refetch?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchUnitagsCounter])

  return { unitag: data, loading }
}

// Helper function to enforce unitag length and alphanumeric characters
export const getUnitagFormatError = (unitag: string, t: TFunction): string | undefined => {
  if (unitag.length < MIN_UNITAG_LENGTH) {
    return t(`Usernames must be at least {{ minUnitagLength }} characters`, {
      minUnitagLength: MIN_UNITAG_LENGTH,
    })
  } else if (unitag.length > MAX_UNITAG_LENGTH) {
    return t(`Usernames cannot be more than {{ maxUnitagLength }} characters`, {
      maxUnitagLength: MAX_UNITAG_LENGTH,
    })
  } else if (!UNITAG_VALID_REGEX.test(unitag)) {
    return t('Usernames can only contain lowercase letters and numbers')
  }
  return undefined
}

export const useCanClaimUnitagName = (
  unitagAddress: Address | undefined,
  unitag: string | undefined
): { error: string | undefined; loading: boolean; requiresENSMatch: boolean } => {
  const { t } = useTranslation()

  // Check for length and alphanumeric characters
  let error = unitag ? getUnitagFormatError(unitag, t) : undefined

  // Skip the backend calls if we found an error
  const unitagToSearch = error ? undefined : unitag
  const { loading: unitagLoading, data } = useUnitagQuery(unitagToSearch)
  const { loading: ensLoading, address: ensAddress } = useENS(ChainId.Mainnet, unitagToSearch, true)
  const loading = unitagLoading || ensLoading

  // Check for availability and ENS match
  const dataLoaded = !loading && !!data
  const ensAddressMatchesUnitagAddress = areAddressesEqual(unitagAddress, ensAddress)
  if (dataLoaded && !data.available) {
    error = t('This username is not available')
  }
  if (dataLoaded && data.requiresEnsMatch && !ensAddressMatchesUnitagAddress) {
    error = t('This username is not currently available.')
  }
  return { error, loading, requiresENSMatch: data?.requiresEnsMatch ?? false }
}

export const useClaimUnitag = (): ((
  claim: UnitagClaim,
  context: UnitagClaimContext
) => Promise<{ claimError?: string }>) => {
  const { t } = useTranslation()
  const { data: deviceId } = useAsyncData(getUniqueId)
  const accounts = useAccounts()
  const pendingAccounts = usePendingAccounts()
  const signerManager = useWalletSigners()
  const { triggerRefetchUnitags } = useUnitagUpdater()

  return async (claim: UnitagClaim, context: UnitagClaimContext) => {
    const claimAccount = pendingAccounts[claim.address] || accounts[claim.address]
    if (!claimAccount || !deviceId) {
      return { claimError: t('Could not claim username. Try again later.') }
    }

    try {
      const { data: claimResponse } = await claimUnitag({
        username: claim.username,
        deviceId,
        metadata: {
          avatar: claim.avatarUri && isLocalFileUri(claim.avatarUri) ? undefined : claim.avatarUri,
        },
        account: claimAccount,
        signerManager,
      })

      if (claimResponse.errorCode) {
        return { claimError: parseUnitagErrorCode(t, claim.username, claimResponse.errorCode) }
      }

      triggerRefetchUnitags()

      if (claimResponse.success) {
        // Log claim success
        sendWalletAnalyticsEvent(UnitagEventName.UnitagClaimed, context)
        if (claim.avatarUri && isLocalFileUri(claim.avatarUri)) {
          const { success: uploadUpdateAvatarSuccess } = await uploadAndUpdateAvatarAfterClaim({
            username: claim.username,
            imageUri: claim.avatarUri,
            account: claimAccount,
            signerManager,
          })

          if (!uploadUpdateAvatarSuccess) {
            return { claimError: t('Could not set avatar. Try again later.') }
          }
        }

        triggerRefetchUnitags()
      }

      // Return success (no error)
      return { claimError: undefined }
    } catch (e) {
      logger.error(e, { tags: { file: 'useClaimUnitag', function: 'claimUnitag' } })
      return { claimError: t('Could not claim username. Try again later.') }
    }
  }
}

export const useAvatarUploadCredsWithRefresh = ({
  unitag,
  account,
  signerManager,
}: {
  unitag: string
  account: Account
  signerManager: SignerManager
}): {
  avatarUploadUrlLoading: boolean
  avatarUploadUrlResponse?: UnitagGetAvatarUploadUrlResponse
} => {
  const [avatarUploadUrlLoading, setAvatarUploadUrlLoading] = useState(false)
  const [avatarUploadUrlResponse, setAvatarUploadUrlResponse] =
    useState<UnitagGetAvatarUploadUrlResponse>()

  // Re-fetch the avatar upload pre-signed URL every 110 seconds to ensure it's always fresh
  useEffect(() => {
    const fetchAvatarUploadUrl = async (): Promise<void> => {
      try {
        setAvatarUploadUrlLoading(true)
        const { data } = await getUnitagAvatarUploadUrl({
          username: unitag, // Assuming unitag is the username you're working with
          account,
          signerManager,
        })
        setAvatarUploadUrlResponse(data)
      } catch (e) {
        logger.error(e, {
          tags: { file: 'EditUnitagProfileScreen', function: 'fetchAvatarUploadUrl' },
        })
      } finally {
        setAvatarUploadUrlLoading(false)
      }
    }

    // Call immediately on component mount
    fetchAvatarUploadUrl().catch((e) => {
      logger.error(e, {
        tags: { file: 'EditUnitagProfileScreen', function: 'fetchAvatarUploadUrl' },
      })
    })

    // Set up the interval to refetch creds 10 seconds before expiry
    const intervalId = setInterval(
      fetchAvatarUploadUrl,
      (AVATAR_UPLOAD_CREDS_EXPIRY_SECONDS - 10) * ONE_SECOND_MS
    )

    // Clear the interval on component unmount
    return () => clearInterval(intervalId)
  }, [unitag, account, signerManager])

  return { avatarUploadUrlLoading, avatarUploadUrlResponse }
}
