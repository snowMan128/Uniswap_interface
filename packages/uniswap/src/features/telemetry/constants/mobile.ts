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
  ExtensionPromoBannerActionTaken = 'Extension Promo Banner Action Taken',
  FavoriteItem = 'Favorite Item',
  FiatOnRampQuickActionButtonPressed = 'Fiat OnRamp QuickAction Button Pressed',
  NotificationsToggled = 'Notifications Toggled',
  OnboardingCompleted = 'Onboarding Completed',
  PerformanceReport = 'Performance Report',
  ShareLinkOpened = 'Share Link Opened',
  TokenDetailsOtherChainButtonPressed = 'Token Details Other Chain Button Pressed',
  WalletAdded = 'Wallet Added',
  WalletConnectSheetCompleted = 'Wallet Connect Sheet Completed',
  WidgetClicked = 'Widget Clicked',
  WidgetConfigurationUpdated = 'Widget Configuration Updated',
  // alphabetize additional values.
}

export enum MobileAppsFlyerEvents {
  OnboardingCompleted = 'onboarding_complete',
  SwapCompleted = 'swap_completed',
  WalletFunded = 'wallet_funded',
}
