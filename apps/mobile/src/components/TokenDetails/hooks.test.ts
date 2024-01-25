import { useCrossChainBalances, useTokenDetailsNavigation } from 'src/components/TokenDetails/hooks'
import { Screens } from 'src/screens/Screens'
import { act, renderHook, waitFor } from 'src/test/test-utils'
import { USDBC_BASE, USDC_ARBITRUM } from 'wallet/src/constants/tokens'
import { Chain } from 'wallet/src/data/__generated__/types-and-hooks'
import { fromGraphQLChain } from 'wallet/src/features/chains/utils'
import { currencyIdToContractInput } from 'wallet/src/features/dataApi/utils'
import { mockWalletPreloadedState, SAMPLE_CURRENCY_ID_1 } from 'wallet/src/test/fixtures'
import { Portfolio, Portfolio2, PortfolioBalancesById } from 'wallet/src/test/gqlFixtures'

const mockedNavigation = {
  navigate: jest.fn(),
  canGoBack: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
}

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native')
  return {
    ...actualNav,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    useNavigation: () => mockedNavigation,
  }
})

describe(useCrossChainBalances, () => {
  describe('currentChainBalance', () => {
    it('returns null if there are no balances for the specified currency', async () => {
      const { result } = renderHook(() => useCrossChainBalances(SAMPLE_CURRENCY_ID_1, null), {
        preloadedState: mockWalletPreloadedState,
      })

      await act(() => undefined)

      expect(result.current).toEqual(
        expect.objectContaining({
          currentChainBalance: null,
        })
      )
    })

    it('returns balance if there is at least one for the specified currency', async () => {
      const { result } = renderHook(() => useCrossChainBalances(SAMPLE_CURRENCY_ID_1, null), {
        preloadedState: mockWalletPreloadedState,
        resolvers: {
          Query: {
            portfolios: () => [Portfolio],
          },
        },
      })

      await waitFor(() => {
        expect(result.current).toEqual(
          expect.objectContaining({
            currentChainBalance: PortfolioBalancesById[SAMPLE_CURRENCY_ID_1],
          })
        )
      })
    })
  })

  describe('otherChainBalances', () => {
    // Current chain balance will be determined by the following currency id
    const currencyId1 = `${fromGraphQLChain(Chain.Base)}-${USDBC_BASE.address.toLocaleLowerCase()}`
    const currencyId2 = `${fromGraphQLChain(
      Chain.Arbitrum
    )}-${USDC_ARBITRUM.address.toLocaleLowerCase()}`

    it('returns null if there are no bridged currencies', async () => {
      const { result } = renderHook(() => useCrossChainBalances(SAMPLE_CURRENCY_ID_1, null), {
        preloadedState: mockWalletPreloadedState,
      })

      await act(() => undefined)

      expect(result.current).toEqual(
        expect.objectContaining({
          otherChainBalances: null,
        })
      )
    })

    it('does not include current chain balance in other chain balances', async () => {
      const bridgeInfo: { chain: Chain; address?: string }[] = [
        { chain: Chain.Base, address: USDBC_BASE.address.toLocaleLowerCase() },
        { chain: Chain.Arbitrum, address: USDC_ARBITRUM.address.toLocaleLowerCase() },
      ]
      const { result } = renderHook(() => useCrossChainBalances(currencyId1, bridgeInfo), {
        preloadedState: mockWalletPreloadedState,
        resolvers: {
          Query: {
            portfolios: () => [Portfolio2],
          },
        },
      })

      await waitFor(() => {
        expect(result.current).toEqual(
          expect.objectContaining({
            currentChainBalance: PortfolioBalancesById[currencyId1],
            otherChainBalances: [PortfolioBalancesById[currencyId2]],
          })
        )
      })
    })
  })
})

describe(useTokenDetailsNavigation, () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns correct result', () => {
    const { result } = renderHook(() => useTokenDetailsNavigation())

    expect(result.current).toEqual({
      preload: expect.any(Function),
      navigate: expect.any(Function),
      navigateWithPop: expect.any(Function),
    })
  })

  it('preloads token details when preload function is called', async () => {
    const queryResolver = jest.fn()
    const { result } = renderHook(() => useTokenDetailsNavigation(), {
      resolvers: {
        Query: {
          token: queryResolver,
        },
      },
    })

    await act(() => result.current.preload(SAMPLE_CURRENCY_ID_1))

    expect(queryResolver).toHaveBeenCalledTimes(1)
    expect(queryResolver.mock.calls[0][1]).toEqual(currencyIdToContractInput(SAMPLE_CURRENCY_ID_1))
  })

  it('navigates to token details when navigate function is called', async () => {
    const { result } = renderHook(() => useTokenDetailsNavigation())

    await act(() => result.current.navigate(SAMPLE_CURRENCY_ID_1))

    expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigation.navigate).toHaveBeenNthCalledWith(1, Screens.TokenDetails, {
      currencyId: SAMPLE_CURRENCY_ID_1,
    })
  })

  describe('navigationWithPop', () => {
    it('pops the last screen from the stack and navigates to token details if can go back', async () => {
      mockedNavigation.canGoBack.mockReturnValueOnce(true)
      const { result } = renderHook(() => useTokenDetailsNavigation())

      await act(() => result.current.navigateWithPop(SAMPLE_CURRENCY_ID_1))

      expect(mockedNavigation.pop).toHaveBeenCalledTimes(1)
      expect(mockedNavigation.push).toHaveBeenCalledTimes(1)
      expect(mockedNavigation.push).toHaveBeenNthCalledWith(1, Screens.TokenDetails, {
        currencyId: SAMPLE_CURRENCY_ID_1,
      })
    })

    it('pushes token details screen to the stack without popping if there is no previous screen', async () => {
      mockedNavigation.canGoBack.mockReturnValueOnce(false)
      const { result } = renderHook(() => useTokenDetailsNavigation())

      await act(() => result.current.navigateWithPop(SAMPLE_CURRENCY_ID_1))

      expect(mockedNavigation.pop).not.toHaveBeenCalled()
      expect(mockedNavigation.push).toHaveBeenCalledTimes(1)
      expect(mockedNavigation.push).toHaveBeenNthCalledWith(1, Screens.TokenDetails, {
        currencyId: SAMPLE_CURRENCY_ID_1,
      })
    })
  })
})
