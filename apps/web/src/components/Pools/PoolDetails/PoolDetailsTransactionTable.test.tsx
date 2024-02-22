import { ApolloError } from '@apollo/client'
import { getLocaleTimeString } from 'components/Table/utils'
import { PoolTransactionType, usePoolTransactions } from 'graphql/thegraph/PoolTransactions'
import Router from 'react-router-dom'
import { mocked } from 'test-utils/mocked'
import { usdcWethPoolAddress, validParams } from 'test-utils/pools/fixtures'
import { render, screen } from 'test-utils/render'

import { PoolDetailsTransactionsTable } from './PoolDetailsTransactionsTable'

jest.mock('graphql/thegraph/PoolTransactions')
jest.mock('components/Table/utils')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

describe('PoolDetailsTransactionsTable', () => {
  beforeEach(() => {
    jest.spyOn(Router, 'useParams').mockReturnValue(validParams)
  })

  it('renders loading state', () => {
    mocked(usePoolTransactions).mockReturnValue({
      loading: true,
      error: undefined,
      transactions: [],
      loadMore: jest.fn(),
    })

    const { asFragment } = render(<PoolDetailsTransactionsTable poolAddress={usdcWethPoolAddress} />)
    expect(screen.getAllByTestId('cell-loading-bubble')).not.toBeNull()
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders error state', () => {
    mocked(usePoolTransactions).mockReturnValue({
      loading: false,
      error: new ApolloError({ errorMessage: 'error fetching data' }),
      transactions: [],
      loadMore: jest.fn(),
    })

    const { asFragment } = render(<PoolDetailsTransactionsTable poolAddress={usdcWethPoolAddress} />)
    expect(screen.getByText('Error fetching Pool Transactions')).not.toBeNull()
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders data filled state', () => {
    const mockData = [
      {
        timestamp: 1000000,
        transaction: '0x123',
        pool: {
          token0: {
            id: 'Token0',
            symbol: 'Token0',
          },
          token1: {
            id: 'Token1',
            symbol: 'Token1',
          },
        },
        maker: '0xabc',
        amount0: 200,
        amount1: 300,
        amountUSD: '400',
        type: PoolTransactionType.BUY,
      },
    ]
    mocked(usePoolTransactions).mockReturnValue({
      transactions: mockData,
      loading: false,
      error: undefined,
      loadMore: jest.fn(),
    })
    mocked(getLocaleTimeString).mockReturnValue('01/12, 05:46am')

    const { asFragment } = render(<PoolDetailsTransactionsTable poolAddress={usdcWethPoolAddress} />)
    expect(screen.getByTestId('pool-details-transactions-table')).not.toBeNull()
    expect(asFragment()).toMatchSnapshot()
  })
})
