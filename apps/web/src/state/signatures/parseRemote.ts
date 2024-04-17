import { TradeType } from '@uniswap/sdk-core'
import { asSupportedChain } from 'constants/chains'
import { parseUnits } from 'ethers/lib/utils'
import { gqlToCurrency, logSentryErrorForUnsupportedChain, supportedChainIdFromGQLChain } from 'graphql/data/util'
import store from 'state'
import { TransactionType as LocalTransactionType } from 'state/transactions/types'
import { UniswapXOrderStatus } from 'types/uniswapx'
import {
  AssetActivityPartsFragment,
  SwapOrderDetailsPartsFragment,
  SwapOrderStatus,
  SwapOrderType,
} from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { currencyId } from 'utils/currencyId'
import { addSignature } from './reducer'
import { SignatureDetails, SignatureType, UniswapXOrderDetails } from './types'

export type OrderActivity = AssetActivityPartsFragment & { details: SwapOrderDetailsPartsFragment }

const SIGNATURE_TYPE_MAP: { [key in SwapOrderType]: SignatureType } = {
  [SwapOrderType.Limit]: SignatureType.SIGN_LIMIT,
  [SwapOrderType.Dutch]: SignatureType.SIGN_UNISWAPX_ORDER,
  [SwapOrderType.DutchV2]: SignatureType.SIGN_UNISWAPX_V2_ORDER,
}

const ORDER_STATUS_MAP: { [key in SwapOrderStatus]: UniswapXOrderStatus } = {
  [SwapOrderStatus.Open]: UniswapXOrderStatus.OPEN,
  [SwapOrderStatus.Expired]: UniswapXOrderStatus.EXPIRED,
  [SwapOrderStatus.Error]: UniswapXOrderStatus.ERROR,
  [SwapOrderStatus.InsufficientFunds]: UniswapXOrderStatus.INSUFFICIENT_FUNDS,
  [SwapOrderStatus.Filled]: UniswapXOrderStatus.FILLED,
  [SwapOrderStatus.Cancelled]: UniswapXOrderStatus.CANCELLED,
}

export function parseRemote({ chain, details, timestamp }: OrderActivity): SignatureDetails {
  const supportedChain = asSupportedChain(supportedChainIdFromGQLChain(chain))
  if (!supportedChain) {
    const error = new Error('Invalid activity from unsupported chain received from GQL')
    logSentryErrorForUnsupportedChain({ extras: { details }, errorMessage: error.message })
    throw error
  }

  const status = ORDER_STATUS_MAP[details.orderStatus]
  const isFilled = status == UniswapXOrderStatus.FILLED

  const inputTokenQuantity = parseUnits(details.inputTokenQuantity, details.inputToken.decimals).toString()
  const outputTokenQuantity = parseUnits(details.outputTokenQuantity, details.outputToken.decimals).toString()

  if (inputTokenQuantity === '0' || outputTokenQuantity === '0') {
    // TODO(WEB-3765): This is a temporary mitigation for a bug where the backend sends "0.000000" for small amounts.
    throw new Error('Invalid activity received from GQL')
  }

  const signature: UniswapXOrderDetails = {
    id: details.id,
    type: SIGNATURE_TYPE_MAP[details.swapOrderType],
    offerer: details.offerer,
    chainId: supportedChain,
    orderHash: details.hash,
    expiry: details.expiry,
    encodedOrder: details.encodedOrder,
    status,
    addedTime: timestamp,
    // only if completed
    txHash: isFilled ? details.hash : undefined,

    swapInfo: {
      isUniswapXOrder: true,
      type: LocalTransactionType.SWAP,
      // This doesn't affect the display, but we don't know this value from the remote activity.
      tradeType: TradeType.EXACT_INPUT,
      inputCurrencyId: currencyId(gqlToCurrency(details.inputToken)),
      outputCurrencyId: currencyId(gqlToCurrency(details.outputToken)),
      inputCurrencyAmountRaw: inputTokenQuantity,
      expectedOutputCurrencyAmountRaw: outputTokenQuantity,
      minimumOutputCurrencyAmountRaw: outputTokenQuantity,
      settledOutputCurrencyAmountRaw: isFilled ? outputTokenQuantity : undefined,
    },
  }

  if (status === UniswapXOrderStatus.OPEN) {
    store.dispatch(addSignature(signature))
  }

  return signature
}
