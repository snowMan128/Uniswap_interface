import { ChainId, Currency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { ButtonEmpty } from 'components/Button'
import Card, { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Modal from 'components/Modal'
import { AutoRow, RowBetween } from 'components/Row'
import { Trans } from 'i18n'
import { useState } from 'react'
import styled from 'styled-components'
import { CloseIcon, ExternalLink, ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'

import { useCurrencyInfo } from 'hooks/Tokens'
import { SafetyLevel } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'

const DetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.neutral2};
  background-color: ${({ theme }) => theme.surface2};
  z-index: ${Z_INDEX.deprecated_zero};

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
  text-align: center;
`

const StyledButtonEmpty = styled(ButtonEmpty)`
  text-decoration: none;
`

const AddressText = styled(ThemedText.DeprecatedBlue)`
  font-size: 12px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 10px;
`}
`

export default function UnsupportedCurrencyFooter({
  show,
  currencies,
}: {
  show: boolean
  currencies: (Currency | undefined | null)[]
}) {
  const { chainId } = useWeb3React()
  const [showDetails, setShowDetails] = useState(false)

  const tokens =
    chainId && currencies
      ? currencies.map((currency) => {
          return currency?.wrapped
        })
      : []

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding="2rem">
          <AutoColumn gap="lg">
            <RowBetween>
              <ThemedText.DeprecatedMediumHeader>
                <Trans>Unsupported assets</Trans>
              </ThemedText.DeprecatedMediumHeader>
              <CloseIcon onClick={() => setShowDetails(false)} data-testid="close-icon" />
            </RowBetween>
            {tokens.map((token) => {
              return (
                <UnsupportedTokenCard key={token?.address?.concat('not-supported')} token={token} chainId={chainId} />
              )
            })}
            <AutoColumn gap="lg">
              <ThemedText.DeprecatedBody fontWeight={535}>
                <Trans>
                  Some assets are not available through this interface because they may not work well with the smart
                  contracts or we are unable to allow trading for legal reasons.
                </Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      <StyledButtonEmpty padding="0" onClick={() => setShowDetails(true)} data-testid="read-more-button">
        <ThemedText.DeprecatedBlue>
          <Trans>Read more about unsupported assets</Trans>
        </ThemedText.DeprecatedBlue>
      </StyledButtonEmpty>
    </DetailsFooter>
  )
}

function UnsupportedTokenCard({ token, chainId }: { token?: Token; chainId?: ChainId }) {
  const currencyInfo = useCurrencyInfo(token)

  if (!token || (!currencyInfo?.isSpam && currencyInfo?.safetyLevel === SafetyLevel.Verified)) {
    return null
  }

  return (
    <OutlineCard key={token?.address?.concat('not-supported')} data-testid="unsupported-token-card">
      <AutoColumn gap="10px">
        <AutoRow gap="5px" align="center">
          <CurrencyLogo currency={token} size={24} />
          <ThemedText.DeprecatedBody fontWeight={535}>{token.symbol}</ThemedText.DeprecatedBody>
        </AutoRow>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)}>
            <AddressText>{token.address}</AddressText>
          </ExternalLink>
        )}
      </AutoColumn>
    </OutlineCard>
  )
}
