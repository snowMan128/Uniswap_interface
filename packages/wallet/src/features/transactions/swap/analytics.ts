import { SwapEventName } from '@uniswap/analytics-events'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { useEffect } from 'react'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { SwapTradeBaseProperties } from 'uniswap/src/features/telemetry/types'
import { QuoteType } from 'uniswap/src/types/quote'
import { NumberType } from 'utilities/src/format/types'
import {
  LocalizationContextState,
  useLocalizationContext,
} from 'wallet/src/features/language/LocalizationContext'
import { isClassicQuote } from 'wallet/src/features/transactions/swap/trade/tradingApi/utils'
import { QuoteData, Trade } from 'wallet/src/features/transactions/swap/trade/types'
import { DerivedSwapInfo } from 'wallet/src/features/transactions/swap/types'
import { CurrencyField } from 'wallet/src/features/transactions/transactionState/types'
import { getCurrencyAddressForAnalytics } from 'wallet/src/utils/currencyId'
import { ValueType, getCurrencyAmount } from 'wallet/src/utils/getCurrencyAmount'

// hook-based analytics because this one is data-lifecycle dependent
export function useSwapAnalytics(derivedSwapInfo: DerivedSwapInfo): void {
  const formatter = useLocalizationContext()
  const {
    trade: { trade },
  } = derivedSwapInfo

  const quoteId = getQuoteIdFromQuoteData(trade?.quoteData)

  useEffect(() => {
    if (!trade) {
      return
    }

    sendAnalyticsEvent(
      SwapEventName.SWAP_QUOTE_RECEIVED,
      getBaseTradeAnalyticsProperties({ formatter, trade })
    )
    // We only want to re-run this when we get a new `quoteId`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId])

  return
}

export function getBaseTradeAnalyticsProperties({
  formatter,
  trade,
}: {
  formatter: LocalizationContextState
  trade: Trade<Currency, Currency, TradeType>
}): SwapTradeBaseProperties {
  const portionAmount = getPortionAmountFromQuoteData(trade.quoteData)

  const feeCurrencyAmount = getCurrencyAmount({
    value: portionAmount,
    valueType: ValueType.Raw,
    currency: trade.outputAmount.currency,
  })

  const quoteId = getQuoteIdFromQuoteData(trade?.quoteData)

  const finalOutputAmount = feeCurrencyAmount
    ? trade.outputAmount.subtract(feeCurrencyAmount)
    : trade.outputAmount

  return {
    token_in_symbol: trade.inputAmount.currency.symbol,
    token_out_symbol: trade.outputAmount.currency.symbol,
    token_in_address: getCurrencyAddressForAnalytics(trade.inputAmount.currency),
    token_out_address: getCurrencyAddressForAnalytics(trade.outputAmount.currency),
    price_impact_basis_points: trade.priceImpact.multiply(100).toSignificant(),
    // TODO: [MOB-237] add gas fee in USD here once we calculate USD value of `totalGasFee` on swap form instead of just on review
    estimated_network_fee_usd: undefined,
    chain_id: trade.inputAmount.currency.chainId,
    token_in_amount: trade.inputAmount.toExact(),
    token_out_amount: formatter.formatCurrencyAmount({
      value: finalOutputAmount,
      type: NumberType.SwapTradeAmount,
    }),
    allowed_slippage_basis_points: trade.slippageTolerance * 100,
    fee_amount: portionAmount,
    quoteType: trade.quoteData?.quoteType,
    requestId: trade.quoteData?.quote?.requestId,
    quoteId,
  }
}

export function getBaseTradeAnalyticsPropertiesFromSwapInfo({
  derivedSwapInfo,
  formatter,
}: {
  derivedSwapInfo: DerivedSwapInfo
  formatter: LocalizationContextState
}): SwapTradeBaseProperties {
  const { chainId, currencyAmounts } = derivedSwapInfo
  const inputCurrencyAmount = currencyAmounts[CurrencyField.INPUT]
  const outputCurrencyAmount = currencyAmounts[CurrencyField.OUTPUT]
  const slippageTolerance =
    derivedSwapInfo.customSlippageTolerance ?? derivedSwapInfo.autoSlippageTolerance

  const portionAmount = getPortionAmountFromQuoteData(derivedSwapInfo.trade.trade?.quoteData)

  const feeCurrencyAmount = getCurrencyAmount({
    value: portionAmount,
    valueType: ValueType.Raw,
    currency: outputCurrencyAmount?.currency,
  })

  const finalOutputAmount =
    outputCurrencyAmount && feeCurrencyAmount
      ? outputCurrencyAmount.subtract(feeCurrencyAmount)
      : outputCurrencyAmount

  return {
    token_in_symbol: inputCurrencyAmount?.currency.symbol,
    token_out_symbol: outputCurrencyAmount?.currency.symbol,
    token_in_address: inputCurrencyAmount
      ? getCurrencyAddressForAnalytics(inputCurrencyAmount?.currency)
      : '',
    token_out_address: outputCurrencyAmount
      ? getCurrencyAddressForAnalytics(outputCurrencyAmount?.currency)
      : '',
    price_impact_basis_points: derivedSwapInfo.trade.trade?.priceImpact
      .multiply(100)
      .toSignificant(),
    estimated_network_fee_usd: undefined,
    chain_id: chainId,
    token_in_amount: inputCurrencyAmount?.toExact() ?? '',
    token_out_amount: formatter.formatCurrencyAmount({
      value: finalOutputAmount,
      type: NumberType.SwapTradeAmount,
    }),
    allowed_slippage_basis_points: slippageTolerance ? slippageTolerance * 100 : undefined,
    fee_amount: portionAmount,
  }
}

// Index into the quote response for portion amount based on the response type
function getPortionAmountFromQuoteData(quoteData?: QuoteData): string | undefined {
  if (!quoteData?.quote) {
    return undefined
  }

  if (quoteData.quoteType === QuoteType.RoutingApi) {
    return quoteData.quote.portionAmount
  }

  // TODO MOB-2438: remove quote type check when other quote types are supported
  if (!isClassicQuote(quoteData.quote.quote)) {
    return undefined
  }

  return quoteData.quote.quote.portionAmount
}

function getQuoteIdFromQuoteData(quoteData?: QuoteData): string | undefined {
  if (!quoteData?.quote) {
    return undefined
  }

  if (quoteData.quoteType === QuoteType.RoutingApi) {
    return quoteData.quote.quoteId
  }

  // TODO MOB-2438: remove quote type check when other quote types are supported
  if (!isClassicQuote(quoteData.quote.quote)) {
    return undefined
  }

  return quoteData.quote.quote.quoteId
}
