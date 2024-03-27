export enum WalletEventName {
  ExploreSearchCancel = 'Explore Search Cancel',
  NetworkFilterSelected = 'Network Filter Selected',
  NFTsLoaded = 'NFTs Loaded',
  PortfolioBalanceFreshnessLag = 'Portfolio Balance Freshness Lag',
  SwapSubmitted = 'Swap Submitted to Provider',
  SendRecipientSelected = 'Send Recipient Selected',
  TransferSubmitted = 'Transfer Submitted',
  TransferCompleted = 'Transfer Completed',
  TokenSelected = 'Token Selected',
}

// MOB-2816: move these to analytics-events package
export enum UnitagEventName {
  UnitagBannerActionTaken = 'Unitag Banner Action Taken',
  UnitagOnboardingActionTaken = 'Unitag Onboarding Action Taken',
  UnitagClaimAvailabilityDisplayed = 'Unitag Claim Availability Displayed',
  UnitagClaimed = 'Unitag Claimed',
  UnitagMetadataUpdated = 'Unitag Metadata Updated',
  UnitagChanged = 'Unitag Changed',
  UnitagRemoved = 'Unitag Removed',
}

export enum FiatOnRampEventName {
  FiatOnRampAmountEntered = 'Fiat OnRamp Amount Entered',
  FiatOnRampTransactionUpdated = 'Fiat OnRamp Transaction Updated',
  FiatOnRampTokenSelected = 'Fiat OnRamp Token Selected',
  FiatOnRampWidgetOpened = 'Fiat OnRamp Widget Opened',
}

export enum InstitutionTransferEventName {
  InstitutionTransferTransactionUpdated = 'Institution Transfer Transaction Updated',
  InstitutionTransferWidgetOpened = 'Institution Transfer Widget Opened',
}

export enum WalletAppsFlyerEvents {
  OnboardingCompleted = 'onboarding_complete',
  SwapCompleted = 'swap_completed',
  WalletFunded = 'wallet_funded',
}

export const ModalName = {
  AccountEdit: 'account-edit-modal',
  AccountSwitcher: 'account-switcher-modal',
  AddWallet: 'add-wallet-modal',
  BlockedAddress: 'blocked-address',
  ChooseProfilePhoto: 'choose-profile-photo-modal',
  CloudBackupInfo: 'cloud-backup-info-modal',
  DappRequest: 'dapp-request',
  ENSClaimPeriod: 'ens-claim-period',
  ExchangeTransferModal: 'exchange-transfer-modal',
  Experiments: 'experiments',
  Explore: 'explore-modal',
  FaceIDWarning: 'face-id-warning',
  FOTInfo: 'fee-on-transfer',
  FiatCurrencySelector: 'fiat-currency-selector',
  FiatOnRamp: 'fiat-on-ramp',
  FiatOnRampAggregator: 'fiat-on-ramp-aggregator',
  FiatOnRampCountryList: 'fiat-on-ramp-country-list',
  FiatOnRampTokenSelector: 'fiat-on-ramp-token-selector',
  ForceUpgradeModal: 'force-upgrade-modal',
  ForgotPassword: 'forgot-password',
  LanguageSelector: 'language-selector-modal',
  NetworkFeeInfo: 'network-fee-info',
  NetworkSelector: 'network-selector-modal',
  NftCollection: 'nft-collection',
  OtpInputExpired: 'otp-input-expired',
  OtpScanInput: 'otp-scan-input',
  QRCodeNetworkInfo: 'qr-code-network-info',
  ReceiveCryptoModal: 'receive-crypto-modal',
  RemoveWallet: 'remove-wallet-modal',
  RestoreWallet: 'restore-wallet-modal',
  RemoveSeedPhraseWarningModal: 'remove-seed-phrase-warning-modal',
  Scantastic: 'scantastic',
  ScreenshotWarning: 'screenshot-warning',
  Send: 'send-modal',
  SeedPhraseWarningModal: 'seed-phrase-warning-modal',
  SendWarning: 'send-warning-modal',
  SendReview: 'send-review-modal',
  SlippageInfo: 'slippage-info-modal',
  Swap: 'swap-modal',
  SwapReview: 'swap-review-modal',
  SwapSettings: 'swap-settings-modal',
  SwapWarning: 'swap-warning-modal',
  ViewOnlyRecipientWarning: 'view-only-recipient-warning-modal',
  SwapProtection: 'swap-protection-modal',
  TokenSelector: 'token-selector',
  TokenWarningModal: 'token-warning-modal',
  TooltipContent: 'tooltip-content',
  TransactionActions: 'transaction-actions',
  UnitagsChange: 'unitags-change-modal',
  UnitagsChangeConfirm: 'unitags-change-confirm-modal',
  UnitagsDelete: 'unitags-delete-modal',
  UnitagsIntro: 'unitags-intro-modal',
  UniconsV2: 'unicons-v2-intro-modal',
  UniconsDevModal: 'unicons-dev-modal',
  ViewSeedPhraseWarning: 'view-seed-phrase-warning',
  ViewOnlyExplainer: 'view-only-explainer-modal',
  WalletConnectScan: 'wallet-connect-scan-modal',
  WCDappConnectedNetworks: 'wc-dapp-connected-networks-modal',
  WCPendingConnection: 'wc-pending-connection-modal',
  WCSignRequest: 'wc-sign-request-modal',
  WCViewOnlyWarning: 'wc-view-only-warning-modal',
  // alphabetize additional values.
} as const

export type ModalNameType = (typeof ModalName)[keyof typeof ModalName]

/**
 * Possible names for the telement property in TraceContext
 */
export const ElementName = {
  AcceptNewRate: 'accept-new-rate',
  AccountCard: 'account-card',
  AddManualBackup: 'add-manual-backup',
  AddViewOnlyWallet: 'add-view-only-wallet',
  AddCloudBackup: 'add-cloud-backup',
  AmountInputIn: 'amount-input-in',
  AmountInputOut: 'amount-input-out',
  Back: 'back',
  Buy: 'buy',
  Cancel: 'cancel',
  ChooseInputToken: 'choose-input-token',
  ChooseOutputToken: 'choose-output-token',
  Confirm: 'confirm',
  Continue: 'continue',
  Copy: 'copy',
  CreateAccount: 'create-account',
  Edit: 'edit',
  EmptyStateBuy: 'empty-state-buy',
  EmptyStateGetStarted: 'empty-state-get-started',
  EmptyStateImport: 'empty-state-get-import',
  EmptyStateReceive: 'empty-state-receive',
  Enable: 'enable',
  EtherscanView: 'etherscan-view',
  Favorite: 'favorite',
  FiatOnRampTokenSelector: 'fiat-on-ramp-token-selector',
  FiatOnRampWidgetButton: 'fiat-on-ramp-widget-button',
  FiatOnRampCountryPicker: 'fiat-on-ramp-country-picker',
  GetHelp: 'get-help',
  GetStarted: 'get-started',
  ImportAccount: 'import',
  ImportAccountInput: 'import-account-input',
  Manage: 'manage',
  MoonpayExplorerView: 'moonpay-explorer-view',
  NetworkButton: 'network-button',
  Next: 'next',
  OK: 'ok',
  OnboardingImportBackup: 'onboarding-import-backup',
  OnboardingImportSeedPhrase: 'onboarding-import-seed-phrase',
  OnboardingImportWatchedAccount: 'onboarding-import-watched-account',
  OpenDeviceLanguageSettings: 'open-device-language-settings',
  OpenCameraRoll: 'open-camera-roll',
  OpenNftsList: 'open-nfts-list',
  QRCodeModalToggle: 'qr-code-modal-toggle',
  Receive: 'receive',
  RecoveryHelpButton: 'recovery-help-button',
  Remove: 'remove',
  RestoreFromCloud: 'restore-from-cloud',
  RestoreWallet: 'restore-wallet',
  ReviewSwap: 'review-swap',
  ReviewTransfer: 'review-transfer',
  SearchEtherscanItem: 'search-etherscan-item',
  SearchNFTCollectionItem: 'search-nft-collection-item',
  SelectRecipient: 'select-recipient',
  SearchTokenItem: 'search-token-item',
  SearchTokensAndWallets: 'search-tokens-and-wallets',
  Sell: 'sell',
  Send: 'send',
  SetMaxInput: 'set-max-input',
  SetMaxOutput: 'set-max-output',
  Skip: 'skip',
  Submit: 'submit',
  Swap: 'swap',
  SwapFormHeader: 'swap-form-header',
  SwapReview: 'swap-review',
  SendReview: 'send-review',
  SwapSettings: 'swap-settings',
  SwitchCurrenciesButton: 'switch-currencies-button',
  TimeFrame1H: 'time-frame-1H',
  TimeFrame1D: 'time-frame-1D',
  TimeFrame1W: 'time-frame-1W',
  TimeFrame1M: 'time-frame-1M',
  TimeFrame1Y: 'time-frame-1Y',
  TokenAddress: 'token-address',
  TokenInputSelector: 'token-input-selector',
  TokenLinkEtherscan: 'token-link-etherscan',
  TokenLinkTwitter: 'token-link-twitter',
  TokenLinkWebsite: 'token-link-website',
  TokenOutputSelector: 'token-output-selector',
  TokenSelectorToggle: 'token-selector-toggle',
  TokenWarningAccept: 'token-warning-accept',
  Unwrap: 'unwrap',
  WatchWallet: 'watch-wallet',
  WCDappSwitchAccount: 'wc-dapp-switch-account',
  WCDappNetworks: 'wc-dapp-networks',
  WalletCard: 'wallet-card',
  WalletConnectScan: 'wallet-connect-scan',
  WalletNameInput: 'wallet-name-input',
  WalletQRCode: 'wallet-qr-code',
  WalletSettings: 'WalletSettings',
  Wrap: 'wrap',
  // alphabetize additional values.
} as const

export type ElementNameType = (typeof ElementName)[keyof typeof ElementName]

/**
 * Possible names for the section property in TraceContext
 */
export const SectionName = {
  CurrencyInputPanel: 'currency-input-panel',
  CurrencyOutputPanel: 'currency-output-panel',
  ExploreFavoriteTokensSection: 'explore-favorite-tokens-section',
  ExploreSearch: 'explore-search',
  ExploreTopTokensSection: 'explore-top-tokens-section',
  HomeActivityTab: 'home-activity-tab',
  HomeFeedTab: 'home-feed-tab',
  HomeNFTsTab: 'home-nfts-tab',
  HomeTokensTab: 'home-tokens-tab',
  ImportAccountForm: 'import-account-form',
  ProfileActivityTab: 'profile-activity-tab',
  ProfileNftsTab: 'profile-nfts-tab',
  ProfileTokensTab: 'profile-tokens-tab',
  SwapForm: 'swap-form',
  SwapPending: 'swap-pending',
  SwapReview: 'swap-review',
  TokenSelector: 'token-selector',
  TokenDetails: 'token-details',
  TransferForm: 'transfer-form',
  TransferPending: 'transfer-pending',
  TransferReview: 'transfer-review',
  // alphabetize additional values.
} as const

export type SectionNameType = (typeof SectionName)[keyof typeof SectionName]
