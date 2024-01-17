import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useSwapTxAndGasInfoLegacy } from 'src/features/transactions/swap/hooks'
import { DerivedSwapInfo } from 'src/features/transactions/swap/types'
import { useSwapFormContext } from 'src/features/transactions/swapRewrite/contexts/SwapFormContext'
import { useSwapTxAndGasInfoTradingApi } from 'src/features/transactions/swapRewrite/tradingApiHooks/useSwapTxAndGasInfoTradingApi'
import { CurrencyField } from 'wallet/src/features/transactions/transactionState/types'

type SwapTxContextState = {
  txRequest: ReturnType<typeof useSwapTxAndGasInfoTradingApi>['txRequest']
  approveTxRequest: ReturnType<typeof useSwapTxAndGasInfoTradingApi>['approveTxRequest']
  approvalError: ReturnType<typeof useSwapTxAndGasInfoTradingApi>['approvalError']
  gasFee: ReturnType<typeof useSwapTxAndGasInfoTradingApi>['gasFee']
}

export const SwapTxContext = createContext<SwapTxContextState | undefined>(undefined)

/**
 * TODO: https://linear.app/uniswap/issue/MOB-2440/remove-conditional-swap-context
 *
 * We create 2 versions of the swap contexts, 1 for each routing API (legacy and trading api).
 *
 * This helps us conditionally render based on the trading-api feature flag, without conditionally rendering hooks.
 */
export function SwapTxContextProviderLegacyApi({ children }: { children: ReactNode }): JSX.Element {
  const { derivedSwapInfo } = useSwapFormContext()
  const balanceLimitedDerivedSwapInfo = useBalanceLimitedDerivedSwapInfo(derivedSwapInfo)

  const { txRequest, approveTxRequest, gasFee } = useSwapTxAndGasInfoLegacy({
    derivedSwapInfo: balanceLimitedDerivedSwapInfo,
    skipGasFeeQuery: false,
  })

  const state = useMemo<SwapTxContextState>(
    (): SwapTxContextState => ({
      txRequest,
      approveTxRequest,
      gasFee,
      approvalError: undefined, // Legacy approval logic doesnt make api request for approval, so can ignore this.
    }),
    [approveTxRequest, gasFee, txRequest]
  )

  return <SwapTxContext.Provider value={state}>{children}</SwapTxContext.Provider>
}

// Same as above, with different hook for data fetching.
export function SwapTxContextProviderTradingApi({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const { derivedSwapInfo } = useSwapFormContext()
  const balanceLimitedDerivedSwapInfo = useBalanceLimitedDerivedSwapInfo(derivedSwapInfo)

  const { txRequest, approveTxRequest, gasFee, approvalError } = useSwapTxAndGasInfoTradingApi({
    derivedSwapInfo: balanceLimitedDerivedSwapInfo,
  })

  const state = useMemo<SwapTxContextState>(
    (): SwapTxContextState => ({
      txRequest,
      approveTxRequest,
      gasFee,
      approvalError,
    }),
    [approvalError, approveTxRequest, gasFee, txRequest]
  )

  return <SwapTxContext.Provider value={state}>{children}</SwapTxContext.Provider>
}

export const useSwapTxContext = (): SwapTxContextState => {
  const swapContext = useContext(SwapTxContext)

  if (swapContext === undefined) {
    throw new Error('`useSwapTxContext` must be used inside of `SwapTxContextProvider`')
  }

  return swapContext
}

// When the balance is insufficient to swap, we want to skip the Tx and Gas queries to avoid a 400 error,
// so we set the amounts to `null` to let the `useSwapTxAndGasInfo` hook (and its dependencies) know that they can skip this logic.
// The UI will show an "insufficient balance" error when this happens.
function useBalanceLimitedDerivedSwapInfo(derivedSwapInfo: DerivedSwapInfo): DerivedSwapInfo {
  const currencyBalanceIn = derivedSwapInfo.currencyBalances[CurrencyField.INPUT]
  const currencyAmountIn = derivedSwapInfo.currencyAmounts[CurrencyField.INPUT]
  const swapBalanceInsufficient = currencyAmountIn && currencyBalanceIn?.lessThan(currencyAmountIn)

  return useMemo(() => {
    if (swapBalanceInsufficient) {
      return {
        ...derivedSwapInfo,
        currencyAmounts: {
          [CurrencyField.INPUT]: null,
          [CurrencyField.OUTPUT]: null,
        },
      }
    }

    return derivedSwapInfo
  }, [derivedSwapInfo, swapBalanceInsufficient])
}
