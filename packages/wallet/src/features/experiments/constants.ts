/**
 * Feature flag names
 * These should match the Gate Key on Statsig
 */
export enum FEATURE_FLAGS {
  CloudflareGateway = 'cloudflare-gateway',
  CurrencyConversion = 'currency_conversion',
  UwULink = 'uwu-link',
  FeedTab = 'feed-tab',
  ForAggregator = 'for-aggregator',
  LanguageSelection = 'language-selection',
  MevBlocker = 'mev-blocker',
  PortionFields = 'portion-fields',
  RestoreWallet = 'restore-wallet',
  Scantastic = 'scantastic',
  SeedPhraseRefactorNative = 'refactor-seed-phrase-native',
  SendRewrite = 'send-rewrite',
  Unitags = 'unitags',
  UniconsV2 = 'unicons-v2',
  TradingApi = 'trading-api',
}

/**
 * Experiment names
 * These should match Experiment Name on Statsig
 */
export enum EXPERIMENT_NAMES {
  OnboardingNewCreateImportFlow = 'onboarding-ab-1',
  SkeletonLoading = 'skeleton_loading_1',
}

/**
 * Experiment parameter names
 *
 * These should match parameter names on Statsig within an experiment
 */
export enum EXPERIMENT_PARAMS {
  Enabled = 'enabled',
}

// Add experiment values here as needed.
export const EXPERIMENT_VALUES_BY_EXPERIMENT: Record<
  string,
  Record<string, Record<string, string>>
> = {}

/**
 * Dynamic Configs
 * These should match the dynamic config's `Config Name` on Statsig
 * https://console.statsig.com/5M2TFMQiHkbY9RML95FAEa/dynamic_configs
 */
export enum DYNAMIC_CONFIGS {
  ForceUpgrade = 'force_upgrade',
}
