import { SharedEventName } from '@uniswap/analytics-events'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NativeSyntheticEvent } from 'react-native'
import { ContextMenuAction, ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view'
import { SharedValue, StyleProps, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useSelectHasTokenFavorited, useToggleFavoriteCallback } from 'src/features/favorites/hooks'
import { openModal } from 'src/features/modals/modalSlice'
import { ElementName, ModalName, SectionNameType } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { ChainId } from 'uniswap/src/types/chains'
import { CurrencyId } from 'uniswap/src/types/currency'
import { ScannerModalState } from 'wallet/src/components/QRCodeScanner/constants'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
import { AssetType } from 'wallet/src/entities/assets'
import {
  CurrencyField,
  TransactionState,
} from 'wallet/src/features/transactions/transactionState/types'
import { useAppDispatch } from 'wallet/src/state'
import { currencyIdToAddress } from 'wallet/src/utils/currencyId'

interface TokenMenuParams {
  currencyId: CurrencyId
  chainId: ChainId
  analyticsSection: SectionNameType
  // token, which are in favorite section would have it defined
  onEditFavorites?: () => void
}

// Provide context menu related data for token
export function useExploreTokenContextMenu({
  currencyId,
  chainId,
  analyticsSection,
  onEditFavorites,
}: TokenMenuParams): {
  menuActions: Array<ContextMenuAction & { onPress: () => void }>
  onContextMenuPress: (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => void
} {
  const { t } = useTranslation()
  const isFavorited = useSelectHasTokenFavorited(currencyId)
  const dispatch = useAppDispatch()

  const { handleShareToken } = useWalletNavigation()

  // `address` is undefined for native currencies, so we want to extract it from
  // currencyId, where we have hardcoded addresses for native currencies
  const currencyAddress = currencyIdToAddress(currencyId)

  const onPressReceive = useCallback(
    () =>
      dispatch(
        openModal({ name: ModalName.WalletConnectScan, initialState: ScannerModalState.WalletQr })
      ),
    [dispatch]
  )

  const onPressShare = useCallback(async () => {
    handleShareToken({ currencyId })
  }, [currencyId, handleShareToken])

  const toggleFavoriteToken = useToggleFavoriteCallback(currencyId, isFavorited)

  const onPressSwap = useCallback(() => {
    const swapFormState: TransactionState = {
      exactCurrencyField: CurrencyField.INPUT,
      exactAmountToken: '0',
      [CurrencyField.INPUT]: null,
      [CurrencyField.OUTPUT]: {
        chainId,
        address: currencyAddress,
        type: AssetType.Currency,
      },
    }
    dispatch(openModal({ name: ModalName.Swap, initialState: swapFormState }))
    sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
      element: ElementName.Swap,
      section: analyticsSection,
    })
  }, [analyticsSection, chainId, currencyAddress, dispatch])

  const onPressToggleFavorite = useCallback(() => {
    toggleFavoriteToken()
  }, [toggleFavoriteToken])

  const menuActions = useMemo(
    () => [
      {
        title: isFavorited
          ? t('explore.tokens.favorite.action.remove')
          : t('explore.tokens.favorite.action.add'),
        systemIcon: isFavorited ? 'heart.fill' : 'heart',
        onPress: onPressToggleFavorite,
      },
      ...(onEditFavorites
        ? [
            {
              title: t('explore.tokens.favorite.action.edit'),
              systemIcon: 'square.and.pencil',
              onPress: onEditFavorites,
            },
          ]
        : []),
      { title: t('common.button.swap'), systemIcon: 'arrow.2.squarepath', onPress: onPressSwap },
      {
        title: t('common.button.receive'),
        systemIcon: 'qrcode',
        onPress: onPressReceive,
      },
      ...(!onEditFavorites
        ? [
            {
              title: t('common.button.share'),
              systemIcon: 'square.and.arrow.up',
              onPress: onPressShare,
            },
          ]
        : []),
    ],
    [
      isFavorited,
      t,
      onPressToggleFavorite,
      onEditFavorites,
      onPressSwap,
      onPressReceive,
      onPressShare,
    ]
  )

  const onContextMenuPress = useCallback(
    async (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>): Promise<void> => {
      await menuActions[e.nativeEvent.index]?.onPress?.()
    },
    [menuActions]
  )

  return { menuActions, onContextMenuPress }
}

export function useAnimatedCardDragStyle(
  pressProgress: SharedValue<number>,
  dragActivationProgress: SharedValue<number>
): StyleProps {
  return useAnimatedStyle(() => ({
    opacity:
      pressProgress.value >= dragActivationProgress.value
        ? 1
        : interpolate(dragActivationProgress.value, [0, 1], [1, 0.5]),
  }))
}
