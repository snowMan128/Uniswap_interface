import { SupportedInterfaceChainId } from 'constants/chains'
import { OffchainOrderType } from 'state/routing/types'
import { UniswapXOrderStatus } from 'types/uniswapx'
import {
  AssetActivityPartsFragment,
  SwapOrderDetailsPartsFragment,
} from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { Prettify } from 'viem/chains'
import { ExactInputSwapTransactionInfo, ExactOutputSwapTransactionInfo } from '../transactions/types'

export type OrderActivity = AssetActivityPartsFragment & { details: SwapOrderDetailsPartsFragment }

export enum SignatureType {
  SIGN_UNISWAPX_ORDER = 'signUniswapXOrder',
  SIGN_UNISWAPX_V2_ORDER = 'signUniswapXV2Order',
  SIGN_LIMIT = 'signLimit',
}

export const OFFCHAIN_ORDER_TYPE_TO_SIGNATURE_TYPE: Partial<Record<OffchainOrderType, SignatureType>> = {
  [OffchainOrderType.DUTCH_AUCTION]: SignatureType.SIGN_UNISWAPX_ORDER,
  [OffchainOrderType.DUTCH_V2_AUCTION]: SignatureType.SIGN_UNISWAPX_V2_ORDER,
  [OffchainOrderType.LIMIT_ORDER]: SignatureType.SIGN_LIMIT,
}

interface BaseSignatureFields {
  type?: SignatureType
  id: string
  addedTime: number
  chainId: SupportedInterfaceChainId
  expiry?: number
  offerer: string
}

/**
 * `UniswapXOrderDetails` is used for both submitting orders and fetching order details.
 * - `type` is required for order submission; marked as optional due to the difficulty in distinguishing between X v1 & v2 orders when fetching details from on-chain data
 * - `encodedOrder` is required for order submission; marked is optional as it's not returned by the GQL TransactionDetails schema when fetching order details
 * - `txHash` is defined for filled order only. `orderHash` !== `txHash`
 */
interface BaseUniswapXOrderDetails extends BaseSignatureFields {
  orderHash: string
  type?: SignatureType
  swapInfo: (ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo) & { isUniswapXOrder: true }
  encodedOrder?: string
}

export interface UnfilledUniswapXOrderDetails extends BaseUniswapXOrderDetails {
  status: Exclude<UniswapXOrderStatus, UniswapXOrderStatus.FILLED>
  txHash?: undefined
}

export interface FilledUniswapXOrderDetails extends BaseUniswapXOrderDetails {
  status: UniswapXOrderStatus.FILLED
  txHash: string
}

export type UniswapXOrderDetails = Prettify<UnfilledUniswapXOrderDetails | FilledUniswapXOrderDetails>

export type SignatureDetails = UniswapXOrderDetails
