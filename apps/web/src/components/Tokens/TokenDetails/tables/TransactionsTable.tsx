import { Trans } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import { ChainId, Token } from '@uniswap/sdk-core'
import Row from 'components/Row'
import { Table } from 'components/Table'
import { Cell } from 'components/Table/Cell'
import { Filter } from 'components/Table/Filter'
import {
  ClickableHeaderRow,
  FilterHeaderRow,
  HeaderArrow,
  StyledExternalLink,
  TimestampCell,
  TokenLinkCell,
} from 'components/Table/styled'
import { TokenTransactionType, useTokenTransactions } from 'graphql/thegraph/TokenTransactions'
import { OrderDirection, Swap_OrderBy } from 'graphql/thegraph/__generated__/types-and-hooks'
import { useActiveLocalCurrency } from 'hooks/useActiveLocalCurrency'
import { useCallback, useMemo, useReducer, useState } from 'react'
import styled from 'styled-components'
import { EllipsisStyle, ThemedText } from 'theme/components'
import { shortenAddress } from 'utils/addresses'
import { useFormatter } from 'utils/formatNumbers'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const StyledSwapAmount = styled(ThemedText.BodyPrimary)`
  display: inline-block;
  ${EllipsisStyle}
  max-width: 75px;
`
interface SwapTransaction {
  hash: string
  timestamp: number
  input: SwapLeg
  output: SwapLeg
  usdValue: number
  makerAddress: string
}

interface SwapLeg {
  address: string
  symbol: string
  amount: number
}

type TokenTxTableSortState = {
  sortBy: Swap_OrderBy
  sortDirection: OrderDirection
}

export function TransactionsTable({ chainId, referenceToken }: { chainId: ChainId; referenceToken: Token }) {
  const activeLocalCurrency = useActiveLocalCurrency()
  const { formatNumber, formatFiatPrice } = useFormatter()
  const [filterModalIsOpen, toggleFilterModal] = useReducer((s) => !s, false)
  const [filter, setFilters] = useState<TokenTransactionType[]>([TokenTransactionType.BUY, TokenTransactionType.SELL])
  const [sortState, setSortMethod] = useState<TokenTxTableSortState>({
    sortBy: Swap_OrderBy.Timestamp,
    sortDirection: OrderDirection.Desc,
  })
  const { transactions, loading, loadMore, error } = useTokenTransactions(
    referenceToken.address,
    chainId,
    sortState.sortBy,
    sortState.sortDirection,
    filter
  )

  const handleHeaderClick = useCallback(
    (newSortMethod: Swap_OrderBy) => {
      if (sortState.sortBy === newSortMethod) {
        setSortMethod({
          sortBy: newSortMethod,
          sortDirection: sortState.sortDirection === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc,
        })
      } else {
        setSortMethod({
          sortBy: newSortMethod,
          sortDirection: OrderDirection.Desc,
        })
      }
    },
    [sortState.sortBy, sortState.sortDirection]
  )

  const data = useMemo(
    () =>
      transactions.map((transaction) => {
        const swapLeg0 = {
          address: transaction.pool.token0.id,
          symbol: transaction.pool.token0.symbol,
          amount: transaction.amount0,
        }
        const swapLeg1 = {
          address: transaction.pool.token1.id,
          symbol: transaction.pool.token1.symbol,
          amount: transaction.amount1,
        }
        let input, output
        if (swapLeg0.amount > 0) {
          input = swapLeg0
          output = swapLeg1
        } else {
          input = swapLeg1
          output = swapLeg0
        }
        return {
          hash: transaction.transaction.id,
          timestamp: transaction.timestamp,
          input,
          output,
          usdValue: transaction.amountUSD,
          makerAddress: transaction.origin,
        }
      }),
    [transactions]
  )
  // TODO(WEB-3236): once GQL BE Transaction query is supported add usd, token0 amount, and token1 amount sort support
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<SwapTransaction>()
    return [
      columnHelper.accessor((row) => row, {
        id: 'timestamp',
        header: () => (
          <Cell minWidth={164} justifyContent="flex-start" grow>
            <ClickableHeaderRow $justify="flex-start" onClick={() => handleHeaderClick(Swap_OrderBy.Timestamp)}>
              {sortState.sortBy === Swap_OrderBy.Timestamp && <HeaderArrow direction={sortState.sortDirection} />}
              <ThemedText.BodySecondary>
                <Trans>Time</Trans>
              </ThemedText.BodySecondary>
            </ClickableHeaderRow>
          </Cell>
        ),
        cell: (row) => (
          <Cell loading={loading} minWidth={164} justifyContent="flex-start" grow>
            <TimestampCell
              timestamp={Number(row.getValue?.().timestamp)}
              link={getExplorerLink(chainId, row.getValue?.().hash, ExplorerDataType.TRANSACTION)}
            />
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.output.address, {
        id: 'swap-type',
        header: () => (
          <Cell minWidth={75} justifyContent="flex-start" grow>
            <FilterHeaderRow modalOpen={filterModalIsOpen} onClick={toggleFilterModal}>
              <Filter
                allFilters={Object.values(TokenTransactionType)}
                activeFilter={filter}
                setFilters={setFilters}
                isOpen={filterModalIsOpen}
                toggleFilterModal={toggleFilterModal}
              />
              <ThemedText.BodySecondary>
                <Trans>Type</Trans>
              </ThemedText.BodySecondary>
            </FilterHeaderRow>
          </Cell>
        ),
        cell: (outputTokenAddress) => (
          <Cell loading={loading} minWidth={75} justifyContent="flex-start" grow>
            <ThemedText.BodyPrimary>
              {String(outputTokenAddress.getValue?.()).toLowerCase() === referenceToken.address.toLowerCase() ? (
                <Trans>Buy</Trans>
              ) : (
                <Trans>Sell</Trans>
              )}
            </ThemedText.BodyPrimary>
          </Cell>
        ),
      }),
      columnHelper.accessor(
        (row) =>
          row.input.address.toLowerCase() === referenceToken.address.toLowerCase()
            ? row.input.amount
            : row.output.amount,
        {
          id: 'reference-amount',
          header: () => (
            <Cell minWidth={100} justifyContent="flex-end">
              <ThemedText.BodySecondary>${referenceToken.symbol}</ThemedText.BodySecondary>
            </Cell>
          ),
          cell: (inputTokenAmount) => (
            <Cell loading={loading} minWidth={100} justifyContent="flex-end">
              <ThemedText.BodyPrimary>
                {formatNumber({
                  input: Math.abs(inputTokenAmount.getValue?.()) || 0,
                })}
              </ThemedText.BodyPrimary>
            </Cell>
          ),
        }
      ),
      columnHelper.accessor(
        (row) => {
          const nonReferenceSwapLeg =
            row.input.address.toLowerCase() === referenceToken.address.toLowerCase() ? row.output : row.input
          return (
            <Row gap="8px" justify="flex-end">
              <StyledSwapAmount>
                {formatNumber({
                  input: Math.abs(nonReferenceSwapLeg.amount) || 0,
                })}
              </StyledSwapAmount>
              <TokenLinkCell chainId={chainId} tokenAddress={nonReferenceSwapLeg.address} />
            </Row>
          )
        },
        {
          id: 'non-reference-amount',
          header: () => (
            <Cell minWidth={160} justifyContent="flex-end">
              <ThemedText.BodySecondary>
                <Trans>For</Trans>
              </ThemedText.BodySecondary>
            </Cell>
          ),
          cell: (swapOutput) => (
            <Cell loading={loading} minWidth={160} justifyContent="flex-end">
              {swapOutput.getValue?.()}
            </Cell>
          ),
        }
      ),
      columnHelper.accessor((row) => row.usdValue, {
        id: 'fiat-value',
        header: () => (
          <Cell minWidth={125} justifyContent="flex-end">
            <ClickableHeaderRow $justify="flex-end" onClick={() => handleHeaderClick(Swap_OrderBy.AmountUsd)}>
              {sortState.sortBy === Swap_OrderBy.AmountUsd && <HeaderArrow direction={sortState.sortDirection} />}
              <ThemedText.BodySecondary>{activeLocalCurrency}</ThemedText.BodySecondary>
            </ClickableHeaderRow>
          </Cell>
        ),
        cell: (fiat) => (
          <Cell loading={loading} minWidth={125} justifyContent="flex-end">
            <ThemedText.BodyPrimary>{formatFiatPrice({ price: fiat.getValue?.() })}</ThemedText.BodyPrimary>
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.makerAddress, {
        id: 'maker-address',
        header: () => (
          <Cell minWidth={100} justifyContent="flex-end">
            <ThemedText.BodySecondary>
              <Trans>Wallet</Trans>
            </ThemedText.BodySecondary>
          </Cell>
        ),
        cell: (makerAddress) => (
          <Cell loading={loading} minWidth={100} justifyContent="flex-end">
            <StyledExternalLink href={getExplorerLink(chainId, makerAddress.getValue?.(), ExplorerDataType.ADDRESS)}>
              {shortenAddress(makerAddress.getValue?.(), 0)}
            </StyledExternalLink>
          </Cell>
        ),
      }),
    ]
  }, [
    activeLocalCurrency,
    chainId,
    filter,
    filterModalIsOpen,
    formatFiatPrice,
    formatNumber,
    handleHeaderClick,
    loading,
    referenceToken.address,
    referenceToken.symbol,
    sortState.sortBy,
    sortState.sortDirection,
  ])

  if (error) {
    return (
      <ThemedText.BodyPrimary>
        <Trans>Error loading Transactions</Trans>
      </ThemedText.BodyPrimary>
    )
  }

  return <Table columns={columns} data={data} loading={loading} loadMore={loadMore} maxHeight={600} />
}
