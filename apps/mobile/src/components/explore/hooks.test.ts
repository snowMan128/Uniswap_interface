import { NativeSyntheticEvent, Share } from 'react-native'
import { ContextMenuAction, ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view'
import configureMockStore from 'redux-mock-store'
import { useExploreTokenContextMenu } from 'src/components/explore/hooks'
import { renderHookWithProviders } from 'src/test/render'
import { Resolvers } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { SectionName } from 'uniswap/src/features/telemetry/constants'
import { FavoritesState } from 'wallet/src/features/favorites/slice'
import { CurrencyField } from 'wallet/src/features/transactions/transactionState/types'
import { SAMPLE_SEED_ADDRESS_1 } from 'wallet/src/test/fixtures/constants'
import { cleanup } from 'wallet/src/test/test-utils'

const tokenId = SAMPLE_SEED_ADDRESS_1
const currencyId = `1-${tokenId}`

const resolvers: Resolvers = {
  Token: {
    id: () => tokenId,
  },
}

const mockStore = configureMockStore()

describe(useExploreTokenContextMenu, () => {
  const tokenMenuParams = {
    currencyId,
    chainId: 1,
    analyticsSection: SectionName.CurrencyInputPanel,
  }

  describe('editing favorite tokens', () => {
    it('renders proper context menu items when onEditFavorites is not provided', async () => {
      const { result } = renderHookWithProviders(
        () => useExploreTokenContextMenu(tokenMenuParams),
        { resolvers }
      )

      expect(result.current.menuActions).toEqual([
        expect.objectContaining({
          title: 'Favorite token',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Swap',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Receive',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Share',
          onPress: expect.any(Function),
        }),
      ])
      cleanup()
    })

    it('renders proper context menu items when onEditFavorites is provided', async () => {
      const onEditFavorites = jest.fn()
      const { result } = renderHookWithProviders(
        () => useExploreTokenContextMenu({ ...tokenMenuParams, onEditFavorites }),
        { resolvers }
      )

      expect(result.current.menuActions).toEqual([
        expect.objectContaining({
          title: 'Favorite token',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Edit favorites',
          onPress: onEditFavorites,
        }),
        expect.objectContaining({
          title: 'Swap',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Receive',
          onPress: expect.any(Function),
        }),
      ])
      cleanup()
    })

    it('calls onEditFavorites when edit favorites is pressed', async () => {
      const onEditFavorites = jest.fn()
      const { result } = renderHookWithProviders(
        () => useExploreTokenContextMenu({ ...tokenMenuParams, onEditFavorites }),
        { resolvers }
      )

      const editFavoritesActionIndex = result.current.menuActions.findIndex(
        (action: ContextMenuAction) => action.title === 'Edit favorites'
      )
      result.current.onContextMenuPress({
        nativeEvent: { index: editFavoritesActionIndex },
      } as NativeSyntheticEvent<ContextMenuOnPressNativeEvent>)

      expect(onEditFavorites).toHaveBeenCalledTimes(1)
      cleanup()
    })
  })

  describe('adding / removing favorite tokens', () => {
    it('renders proper context menu items when token is favorited', async () => {
      const { result } = renderHookWithProviders(
        () => useExploreTokenContextMenu(tokenMenuParams),
        {
          preloadedState: {
            favorites: { tokens: [tokenMenuParams.currencyId.toLowerCase()] } as FavoritesState,
          },
          resolvers,
        }
      )

      expect(result.current.menuActions).toEqual([
        expect.objectContaining({
          title: 'Remove favorite',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Swap',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Receive',
          onPress: expect.any(Function),
        }),
        expect.objectContaining({
          title: 'Share',
          onPress: expect.any(Function),
        }),
      ])
      cleanup()
    })

    it("dispatches add to favorites redux action when 'Favorite token' is pressed", async () => {
      const store = mockStore({ favorites: { tokens: [] }, appearance: { theme: 'system' } })
      const { result } = renderHookWithProviders(
        () => useExploreTokenContextMenu(tokenMenuParams),
        { resolvers, store }
      )

      const favoriteTokenActionIndex = result.current.menuActions.findIndex(
        (action: ContextMenuAction) => action.title === 'Favorite token'
      )
      result.current.onContextMenuPress({
        nativeEvent: { index: favoriteTokenActionIndex },
      } as NativeSyntheticEvent<ContextMenuOnPressNativeEvent>)

      const dispatchedActions = store.getActions()
      expect(dispatchedActions).toEqual([
        {
          type: 'favorites/addFavoriteToken',
          payload: { currencyId: tokenMenuParams.currencyId },
        },
      ])
      cleanup()
    })

    it("dispatches remove from favorites redux action when 'Remove favorite' is pressed", async () => {
      const store = mockStore({
        favorites: { tokens: [tokenMenuParams.currencyId.toLowerCase()] },
        appearance: { theme: 'system' },
      })
      const { result } = renderHookWithProviders(
        () => useExploreTokenContextMenu(tokenMenuParams),
        { resolvers, store }
      )

      const removeFavoriteTokenActionIndex = result.current.menuActions.findIndex(
        (action: ContextMenuAction) => action.title === 'Remove favorite'
      )
      result.current.onContextMenuPress({
        nativeEvent: { index: removeFavoriteTokenActionIndex },
      } as NativeSyntheticEvent<ContextMenuOnPressNativeEvent>)

      const dispatchedActions = store.getActions()
      expect(dispatchedActions).toEqual([
        {
          type: 'favorites/removeFavoriteToken',
          payload: { currencyId: tokenMenuParams.currencyId },
        },
      ])
      cleanup()
    })
  })

  it('dispatches swap redux action when swap is pressed', async () => {
    const store = mockStore({
      favorites: { tokens: [] },
      selectedAppearanceSettings: { theme: 'system' },
    })
    const { result } = renderHookWithProviders(() => useExploreTokenContextMenu(tokenMenuParams), {
      store,
      resolvers,
    })

    const swapActionIndex = result.current.menuActions.findIndex(
      (action: ContextMenuAction) => action.title === 'Swap'
    )
    result.current.onContextMenuPress({
      nativeEvent: { index: swapActionIndex },
    } as NativeSyntheticEvent<ContextMenuOnPressNativeEvent>)

    const dispatchedActions = store.getActions()
    expect(dispatchedActions).toEqual([
      {
        type: 'modals/openModal',
        payload: {
          name: 'swap-modal',
          initialState: {
            exactAmountToken: '0',
            exactCurrencyField: 'input',
            [CurrencyField.INPUT]: null,
            [CurrencyField.OUTPUT]: {
              chainId: 1,
              address: tokenId,
              type: 'currency',
            },
          },
        },
      },
    ])
    cleanup()
  })

  it('opens share modal when share is pressed', async () => {
    const { result } = renderHookWithProviders(() => useExploreTokenContextMenu(tokenMenuParams), {
      resolvers,
    })

    jest.spyOn(Share, 'share')

    const shareActionIndex = result.current.menuActions.findIndex(
      (action: ContextMenuAction) => action.title === 'Share'
    )
    result.current.onContextMenuPress({
      nativeEvent: { index: shareActionIndex },
    } as NativeSyntheticEvent<ContextMenuOnPressNativeEvent>)

    expect(Share.share).toHaveBeenCalledTimes(1)
    cleanup()
  })
})
