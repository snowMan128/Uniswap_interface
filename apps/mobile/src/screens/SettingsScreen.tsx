/* eslint-disable max-lines */
import { useNavigation } from '@react-navigation/core'
import { default as React, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ListRenderItemInfo, SectionList, StyleSheet } from 'react-native'
import { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { SvgProps } from 'react-native-svg'
import { useDispatch } from 'react-redux'
import { useAppDispatch } from 'src/app/hooks'
import {
  OnboardingStackNavigationProp,
  SettingsStackNavigationProp,
  useSettingsStackNavigation,
} from 'src/app/navigation/types'
import { HeaderScrollScreen } from 'src/components/layout/screens/HeaderScrollScreen'
import {
  SettingsRow,
  SettingsSection,
  SettingsSectionItem,
  SettingsSectionItemComponent,
} from 'src/components/Settings/SettingsRow'
import { APP_FEEDBACK_LINK } from 'src/constants/urls'
import { useBiometricContext } from 'src/features/biometrics/context'
import { useBiometricName, useDeviceSupportsBiometricAuth } from 'src/features/biometrics/hooks'
import { useWalletRestore } from 'src/features/wallet/hooks'
import { OnboardingScreens, Screens } from 'src/screens/Screens'
import { getFullAppVersion } from 'src/utils/version'
import {
  AnimatedFlex,
  Button,
  Flex,
  IconProps,
  Icons,
  Text,
  TouchableArea,
  useDeviceInsets,
  useIsDarkMode,
  useSporeColors,
} from 'ui/src'
import { AVATARS_DARK, AVATARS_LIGHT } from 'ui/src/assets'
import BookOpenIcon from 'ui/src/assets/icons/book-open.svg'
import ContrastIcon from 'ui/src/assets/icons/contrast.svg'
import FaceIdIcon from 'ui/src/assets/icons/faceid.svg'
import FingerprintIcon from 'ui/src/assets/icons/fingerprint.svg'
import LikeSquare from 'ui/src/assets/icons/like-square.svg'
import LockIcon from 'ui/src/assets/icons/lock.svg'
import MessageQuestion from 'ui/src/assets/icons/message-question.svg'
import UniswapIcon from 'ui/src/assets/icons/uniswap-logo.svg'
import { iconSizes, spacing } from 'ui/src/theme'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { useTimeout } from 'utilities/src/time/timing'
import { AddressDisplay } from 'wallet/src/components/accounts/AddressDisplay'
import { uniswapUrls } from 'wallet/src/constants/urls'
import { useCurrentAppearanceSetting } from 'wallet/src/features/appearance/hooks'
import { FEATURE_FLAGS } from 'wallet/src/features/experiments/constants'
import { useFeatureFlag } from 'wallet/src/features/experiments/hooks'
import { useAppFiatCurrencyInfo } from 'wallet/src/features/fiatCurrency/hooks'
import { useCurrentLanguageInfo } from 'wallet/src/features/language/hooks'
import { ImportType, OnboardingEntryPoint } from 'wallet/src/features/onboarding/types'
import {
  AccountType,
  BackupType,
  SignerMnemonicAccount,
} from 'wallet/src/features/wallet/accounts/types'
import {
  useAccounts,
  useHideSmallBalancesSetting,
  useHideSpamTokensSetting,
  useSignerAccounts,
} from 'wallet/src/features/wallet/hooks'
import {
  resetWallet,
  setFinishedOnboarding,
  setHideSmallBalances,
  setHideSpamTokens,
} from 'wallet/src/features/wallet/slice'
import { ModalName } from 'wallet/src/telemetry/constants'
import { isAndroid } from 'wallet/src/utils/platform'

export function SettingsScreen(): JSX.Element {
  const navigation = useNavigation<SettingsStackNavigationProp & OnboardingStackNavigationProp>()
  const dispatch = useAppDispatch()
  const colors = useSporeColors()
  const insets = useDeviceInsets()
  const { deviceSupportsBiometrics } = useBiometricContext()
  const { t } = useTranslation()

  const currencyConversionEnabled = useFeatureFlag(FEATURE_FLAGS.CurrencyConversion)

  // check if device supports biometric authentication, if not, hide option
  const { touchId: isTouchIdSupported, faceId: isFaceIdSupported } =
    useDeviceSupportsBiometricAuth()

  const authenticationTypeName = useBiometricName(isTouchIdSupported, true)
  const currentAppearanceSetting = useCurrentAppearanceSetting()
  const currentFiatCurrencyInfo = useAppFiatCurrencyInfo()
  const { originName: currentLanguage } = useCurrentLanguageInfo()

  const hideSmallBalances = useHideSmallBalancesSetting()
  const onToggleHideSmallBalances = useCallback(() => {
    dispatch(setHideSmallBalances(!hideSmallBalances))
  }, [dispatch, hideSmallBalances])

  const hideSpamTokens = useHideSpamTokensSetting()
  const onToggleHideSpamTokens = useCallback(() => {
    dispatch(setHideSpamTokens(!hideSpamTokens))
  }, [dispatch, hideSpamTokens])

  // Signer account info
  const signerAccount = useSignerAccounts()[0]
  // We sync backup state across all accounts under the same mnemonic, so can check status with any account.
  const hasCloudBackup = signerAccount?.backups?.includes(BackupType.Cloud)
  const noSignerAccountImported = !signerAccount
  const { walletNeedsRestore } = useWalletRestore()

  const sections: SettingsSection[] = useMemo((): SettingsSection[] => {
    const svgProps: SvgProps = {
      color: colors.neutral2.get(),
      height: iconSizes.icon24,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '2',
      width: iconSizes.icon24,
    }
    const iconProps: IconProps = {
      color: '$neutral2',
      size: '$icon.24',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }

    // Defining them inline instead of outside component b.c. they need t()
    return [
      {
        subTitle: t('Preferences'),
        data: [
          {
            screen: Screens.SettingsAppearance,
            text: t('Appearance'),
            currentSetting:
              currentAppearanceSetting === 'system'
                ? t('Device')
                : currentAppearanceSetting === 'dark'
                ? t('Dark mode')
                : t('Light mode'),
            icon: <ContrastIcon {...svgProps} />,
          },

          ...(currencyConversionEnabled
            ? ([
                {
                  modal: ModalName.FiatCurrencySelector,
                  text: t('Local currency'),
                  currentSetting: currentFiatCurrencyInfo.code,
                  icon: <Icons.Coins {...iconProps} />,
                },
              ] as SettingsSectionItem[])
            : []),
          {
            modal: ModalName.LanguageSelector,
            text: t('Language'),
            currentSetting: currentLanguage,
            icon: <Icons.Language {...iconProps} />,
          },
          {
            screen: Screens.SettingsPrivacy,
            text: t('Privacy'),
            icon: <Icons.LineChartDots {...iconProps} />,
          },
          {
            text: t('Hide small balances'),
            icon: <Icons.Chart {...iconProps} />,
            isToggleEnabled: hideSmallBalances,
            onToggle: onToggleHideSmallBalances,
          },
          {
            text: t('Hide unknown tokens'),
            icon: <Icons.ShieldQuestion {...iconProps} />,
            isToggleEnabled: hideSpamTokens,
            onToggle: onToggleHideSpamTokens,
          },
          // @TODO: [MOB-250] add back testnet toggle once we support testnets
        ],
      },
      {
        subTitle: t('Security'),
        isHidden: noSignerAccountImported,
        data: [
          ...(deviceSupportsBiometrics
            ? [
                {
                  screen: Screens.SettingsBiometricAuth as Screens.SettingsBiometricAuth,
                  isHidden: !isTouchIdSupported && !isFaceIdSupported,
                  text: authenticationTypeName,
                  icon: isTouchIdSupported ? (
                    <FingerprintIcon {...svgProps} />
                  ) : (
                    <FaceIdIcon {...svgProps} />
                  ),
                },
              ]
            : []),
          {
            screen: Screens.SettingsViewSeedPhrase,
            text: t('Recovery phrase'),
            icon: <Icons.Key {...iconProps} />,
            screenProps: { address: signerAccount?.address ?? '', walletNeedsRestore },
            isHidden: noSignerAccountImported,
          },
          {
            screen: walletNeedsRestore
              ? Screens.OnboardingStack
              : hasCloudBackup
              ? Screens.SettingsCloudBackupStatus
              : Screens.SettingsCloudBackupPasswordCreate,
            screenProps: walletNeedsRestore
              ? {
                  screen: OnboardingScreens.RestoreCloudBackupLoading,
                  params: {
                    entryPoint: OnboardingEntryPoint.Sidebar,
                    importType: ImportType.Restore,
                  },
                }
              : { address: signerAccount?.address ?? '' },
            text: isAndroid ? t('Google Drive backup') : t('iCloud backup'),
            icon: <Icons.OSDynamicCloudIcon color="$neutral2" size="$icon.24" />,
            isHidden: noSignerAccountImported,
          },
        ],
      },
      {
        subTitle: t('Support'),
        data: [
          {
            screen: Screens.WebView,
            screenProps: {
              uriLink: APP_FEEDBACK_LINK,
              headerTitle: t('Send feedback'),
            },
            text: t('Send feedback'),
            icon: <LikeSquare {...svgProps} />,
          },
          {
            screen: Screens.WebView,
            screenProps: {
              uriLink: uniswapUrls.helpUrl,
              headerTitle: t('Get help'),
            },
            text: t('Get help'),
            icon: <MessageQuestion {...svgProps} />,
          },
        ],
      },
      {
        subTitle: t('About'),
        data: [
          {
            screen: Screens.WebView,
            screenProps: {
              uriLink: uniswapUrls.privacyPolicyUrl,
              headerTitle: t('Privacy policy'),
            },
            text: t('Privacy policy'),
            icon: <LockIcon {...svgProps} />,
          },
          {
            screen: Screens.WebView,
            screenProps: {
              uriLink: uniswapUrls.termsOfServiceUrl,
              headerTitle: t('Terms of service'),
            },
            text: t('Terms of service'),
            icon: <BookOpenIcon {...svgProps} />,
          },
        ],
      },
      {
        subTitle: 'Developer settings',
        isHidden: !__DEV__,
        data: [
          {
            screen: Screens.Dev,
            text: 'Dev options',
            icon: <UniswapIcon {...svgProps} />,
          },
          { component: <OnboardingRow iconProps={svgProps} /> },
        ],
      },
    ]
  }, [
    colors.neutral2,
    t,
    currentAppearanceSetting,
    currencyConversionEnabled,
    currentFiatCurrencyInfo.code,
    currentLanguage,
    hideSmallBalances,
    onToggleHideSmallBalances,
    hideSpamTokens,
    onToggleHideSpamTokens,
    deviceSupportsBiometrics,
    isTouchIdSupported,
    isFaceIdSupported,
    authenticationTypeName,
    walletNeedsRestore,
    noSignerAccountImported,
    hasCloudBackup,
    signerAccount?.address,
  ])

  const renderItem = ({
    item,
  }: ListRenderItemInfo<
    SettingsSectionItem | SettingsSectionItemComponent
  >): JSX.Element | null => {
    if (item.isHidden) {
      return null
    }
    if ('component' in item) {
      return item.component
    }
    return <SettingsRow key={item.screen} navigation={navigation} page={item} />
  }

  return (
    <HeaderScrollScreen
      alwaysShowCenterElement
      centerElement={<Text variant="body1">{t('Settings')}</Text>}>
      <Flex pb={insets.bottom - spacing.spacing16} pt="$spacing12" px="$spacing24">
        <SectionList
          ItemSeparatorComponent={renderItemSeparator}
          ListFooterComponent={<FooterSettings />}
          ListHeaderComponent={<WalletSettings />}
          initialNumToRender={20}
          keyExtractor={(_item, index): string => 'settings' + index}
          renderItem={renderItem}
          renderSectionFooter={(): JSX.Element => <Flex pt="$spacing24" />}
          renderSectionHeader={({ section: { subTitle } }): JSX.Element => (
            <Flex bg="$surface1" py="$spacing12">
              <Text color="$neutral2" variant="body1">
                {subTitle}
              </Text>
            </Flex>
          )}
          sections={sections.filter((p) => !p.isHidden)}
          showsVerticalScrollIndicator={false}
        />
      </Flex>
    </HeaderScrollScreen>
  )
}

const renderItemSeparator = (): JSX.Element => <Flex pt="$spacing8" />

function OnboardingRow({ iconProps }: { iconProps: SvgProps }): JSX.Element {
  const dispatch = useDispatch()
  const navigation = useSettingsStackNavigation()

  return (
    <TouchableArea
      onPress={(): void => {
        navigation.goBack()
        dispatch(resetWallet())
        dispatch(setFinishedOnboarding({ finishedOnboarding: false }))
      }}>
      <Flex row alignItems="center" justifyContent="space-between" py="$spacing4">
        <Flex row alignItems="center">
          <Flex centered height={32} width={32}>
            <UniswapIcon {...iconProps} />
          </Flex>
          <Text ml="$spacing12" variant="body1">
            Onboarding
          </Text>
        </Flex>
        <Icons.RotatableChevron
          color="$neutral3"
          direction="end"
          height={iconSizes.icon24}
          width={iconSizes.icon24}
        />
      </Flex>
    </TouchableArea>
  )
}

const DEFAULT_ACCOUNTS_TO_DISPLAY = 6

function WalletSettings(): JSX.Element {
  const { t } = useTranslation()
  const navigation = useSettingsStackNavigation()
  const addressToAccount = useAccounts()
  const [showAll, setShowAll] = useState(false)

  const allAccounts = useMemo(() => {
    const accounts = Object.values(addressToAccount)
    const _mnemonicWallets = accounts
      .filter((a): a is SignerMnemonicAccount => a.type === AccountType.SignerMnemonic)
      .sort((a, b) => {
        return a.derivationIndex - b.derivationIndex
      })
    const _viewOnlyWallets = accounts
      .filter((a) => a.type === AccountType.Readonly)
      .sort((a, b) => {
        return a.timeImportedMs - b.timeImportedMs
      })
    return [..._mnemonicWallets, ..._viewOnlyWallets]
  }, [addressToAccount])

  const toggleViewAll = (): void => {
    setShowAll(!showAll)
  }

  const handleNavigation = (address: string): void => {
    navigation.navigate(Screens.SettingsWallet, { address })
  }

  return (
    <Flex mb="$spacing16">
      <Flex row justifyContent="space-between">
        <Text color="$neutral2" variant="body1">
          {t('Wallet settings')}
        </Text>
      </Flex>
      {allAccounts
        .slice(0, showAll ? allAccounts.length : DEFAULT_ACCOUNTS_TO_DISPLAY)
        .map((account) => (
          <TouchableArea
            key={account.address}
            pl="$spacing4"
            py="$spacing12"
            onPress={(): void => handleNavigation(account.address)}>
            <Flex row alignItems="center" justifyContent="space-between">
              <Flex shrink>
                <AddressDisplay
                  address={account.address}
                  captionVariant="subheading2"
                  size={iconSizes.icon40}
                  variant="body1"
                />
              </Flex>
              <Icons.RotatableChevron
                color="$neutral3"
                direction="end"
                height={iconSizes.icon24}
                width={iconSizes.icon24}
              />
            </Flex>
          </TouchableArea>
        ))}
      {allAccounts.length > DEFAULT_ACCOUNTS_TO_DISPLAY && (
        <Button theme="tertiary" onPress={toggleViewAll}>
          <Text color="$neutral1" variant="buttonLabel4">
            {showAll ? t('View less') : t('View all')}
          </Text>
        </Button>
      )}
    </Flex>
  )
}

function FooterSettings(): JSX.Element {
  const { t } = useTranslation()
  const [showSignature, setShowSignature] = useState(false)
  const isDarkMode = useIsDarkMode()

  // Fade out signature after duration
  useTimeout(
    showSignature
      ? (): void => {
          setShowSignature(false)
        }
      : (): void => undefined,
    SIGNATURE_VISIBLE_DURATION
  )

  return (
    <Flex gap="$spacing12">
      {showSignature ? (
        <AnimatedFlex
          alignItems="center"
          entering={FadeInDown}
          exiting={FadeOutUp}
          gap="$none"
          mt="$spacing16">
          <Flex gap="$spacing4">
            <Text color="$neutral3" textAlign="center" variant="body2">
              {t('Made with love, ')}
            </Text>
            <Text color="$neutral3" textAlign="center" variant="body2">
              {t('Uniswap Team 🦄')}
            </Text>
          </Flex>
          {isDarkMode ? (
            <Image source={AVATARS_DARK} style={ImageStyles.responsiveImage} />
          ) : (
            <Image source={AVATARS_LIGHT} style={ImageStyles.responsiveImage} />
          )}
        </AnimatedFlex>
      ) : null}
      <Text
        color="$neutral3"
        mt="$spacing8"
        pb="$spacing24"
        variant="body2"
        onLongPress={(): void => {
          setShowSignature(true)
        }}>
        {t('Version {{appVersion}}', { appVersion: getFullAppVersion() })}
      </Text>
    </Flex>
  )
}

const ImageStyles = StyleSheet.create({
  responsiveImage: {
    aspectRatio: 135 / 76,
    height: undefined,
    width: '100%',
  },
})

const SIGNATURE_VISIBLE_DURATION = ONE_SECOND_MS * 10
