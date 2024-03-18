import { PortfolioBalance } from 'wallet/src/features/dataApi/types'
import { portfolioBalances } from 'wallet/src/test/fixtures'

export function portfolioBalancesById(
  inputBalances?: PortfolioBalance[]
): Record<string, PortfolioBalance> {
  const balances = inputBalances ?? portfolioBalances()

  return balances.reduce((acc, balance) => {
    acc[balance.currencyInfo.currencyId] = balance
    return acc
  }, {} as Record<string, PortfolioBalance>)
}
