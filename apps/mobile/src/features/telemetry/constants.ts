import { RootParamList } from 'src/app/navigation/types'
import { AppScreen, Screens } from 'src/screens/Screens'

export function getAuthMethod(
  isSettingEnabled: boolean,
  isTouchIdSupported: boolean,
  isFaceIdSupported: boolean
): AuthMethod {
  if (!isSettingEnabled) {
    return AuthMethod.None
  }

  // both cannot be true since no iOS device supports both
  if (isFaceIdSupported) {
    return AuthMethod.FaceId
  }
  if (isTouchIdSupported) {
    return AuthMethod.TouchId
  }

  return AuthMethod.None
}

export function getEventParams(
  screen: AppScreen,
  params: RootParamList[AppScreen]
): Record<string, unknown> | undefined {
  switch (screen) {
    case Screens.SettingsWallet:
      return {
        address: (params as RootParamList[Screens.SettingsWallet]).address,
      }
    case Screens.SettingsWalletEdit:
      return {
        address: (params as RootParamList[Screens.SettingsWalletEdit]).address,
      }
    default:
      return undefined
  }
}

/**
 * Event names that occur in this specific application
 */
export enum MobileEventName {
  AppRating = 'App Rating',
  BalancesReport = 'Balances Report',
  DeepLinkOpened = 'Deep Link Opened',
  ExploreFilterSelected = 'Explore Filter Selected',
  ExploreSearchResultClicked = 'Explore Search Result Clicked',
  ExploreTokenItemSelected = 'Explore Token Item Selected',
  FavoriteItem = 'Favorite Item',
  FiatOnRampBannerPressed = 'Fiat OnRamp Banner Pressed',
  FiatOnRampQuickActionButtonPressed = 'Fiat OnRamp QuickAction Button Pressed',
  FiatOnRampAmountEntered = 'Fiat OnRamp Amount Entered',
  FiatOnRampWidgetOpened = 'Fiat OnRamp Widget Opened',
  OnboardingCompleted = 'Onboarding Completed',
  PerformanceReport = 'Performance Report',
  PerformanceGraphql = 'Performance GraphQL',
  ShareButtonClicked = 'Share Button Clicked',
  ShareLinkOpened = 'Share Link Opened',
  TokenDetailsOtherChainButtonPressed = 'Token Details Other Chain Button Pressed',
  TokenSelected = 'Token Selected',
  WalletAdded = 'Wallet Added',
  WalletConnectSheetCompleted = 'Wallet Connect Sheet Completed',
  WidgetConfigurationUpdated = 'Widget Configuration Updated',
  WidgetClicked = 'Widget Clicked',
  // alphabetize additional values.
}

/**
 * Views not within the navigation stack that we still want to
 * log Pageview events for. (Usually presented as nested views within another screen)
 */
export const enum ManualPageViewScreen {
  WriteDownRecoveryPhrase = 'WriteDownRecoveryPhrase',
  ConfirmRecoveryPhrase = 'ConfirmRecoveryPhrase',
}

/**
 * User properties tied to user rather than events
 */
export enum UserPropertyName {
  ActiveWalletAddress = 'active_wallet_address',
  ActiveWalletType = 'active_wallet_type',
  AndroidPerfClass = 'android_perf_class',
  AppOpenAuthMethod = 'app_open_auth_method',
  AppVersion = 'app_version',
  DarkMode = 'is_dark_mode',
  IsCloudBackedUp = 'is_cloud_backed_up',
  IsHideSmallBalancesEnabled = 'is_hide_small_balances_enabled',
  IsHideSpamTokensEnabled = 'is_hide_spam_tokens_enabled',
  IsPushEnabled = 'is_push_enabled',
  Language = 'language',
  Currency = 'currency',
  TransactionAuthMethod = 'transaction_auth_method',
  WalletSignerAccounts = `wallet_signer_accounts`,
  WalletSignerCount = 'wallet_signer_count',
  WalletSwapProtectionSetting = 'wallet_swap_protection_setting',
  WalletViewOnlyCount = 'wallet_view_only_count',
  // alphabetize additional values.
}

export enum AuthMethod {
  FaceId = 'FaceId',
  None = 'None',
  TouchId = 'TouchId',
  // alphabetize additional values.
}

export enum ShareableEntity {
  NftItem = 'NftItem',
  NftCollection = 'NftCollection',
  Token = 'Token',
  Wallet = 'Wallet',
}
