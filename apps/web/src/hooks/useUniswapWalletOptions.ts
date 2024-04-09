import { useEIP6963Connections } from 'components/WalletModal/useOrderedConnections'
import { Connection } from 'connection/types'
import { FeatureFlags } from 'uniswap/src/features/experiments/flags'
import { useFeatureFlag } from 'uniswap/src/features/experiments/hooks'

export function useUniswapWalletOptions() {
  const isBetaLive = useFeatureFlag(FeatureFlags.ExtensionBetaLaunch)
  const isGALive = useFeatureFlag(FeatureFlags.ExtensionGeneralLaunch)

  const isExtensionInstalled = useEIP6963Connections().eip6963Connections.find(
    (connection: Connection) => connection.getProviderInfo().rdns === 'org.uniswap.app'
  )

  return (isBetaLive && isExtensionInstalled) || isGALive
}
