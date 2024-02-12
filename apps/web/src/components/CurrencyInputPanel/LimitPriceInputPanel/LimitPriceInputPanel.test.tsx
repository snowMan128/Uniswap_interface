import { SwapTab } from 'components/swap/constants'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { LimitContext } from 'state/limit/LimitContext'
import { SwapAndLimitContext } from 'state/swap/SwapContext'
import { render, screen } from 'test-utils/render'

import { LimitPriceInputPanel } from './LimitPriceInputPanel'

const mockSwapAndLimitContextValue = {
  currencyState: {
    inputCurrency: DAI,
    outputCurrency: undefined,
  },
  prefilledState: {},
  setCurrencyState: jest.fn(),
  currentTab: SwapTab.Limit,
  setCurrentTab: jest.fn(),
}

const mockLimitContextValue = {
  limitState: {
    inputAmount: '',
    limitPrice: '100',
    outputAmount: '',
    expiry: 1,
    isInputAmountFixed: true,
  },
  setLimitState: jest.fn(),
  derivedLimitInfo: {
    currencyBalances: {},
    parsedAmounts: {},
  },
}

describe('LimitPriceInputPanel', () => {
  it('should render the component with no currencies selected', () => {
    const { container } = render(<LimitPriceInputPanel />)
    expect(screen.getByText('Limit price')).toBeVisible()
    expect(screen.getByPlaceholderText('0')).toBeVisible()
    expect(screen.getByText('Current')).toBeVisible()
    expect(screen.getByText('+1%')).toBeVisible()
    expect(screen.getByText('+5%')).toBeVisible()
    expect(screen.getByText('+10%')).toBeVisible()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render correct subheader with inputCurrency defined, but no price', () => {
    const { container } = render(
      <SwapAndLimitContext.Provider value={mockSwapAndLimitContextValue}>
        <LimitPriceInputPanel />
      </SwapAndLimitContext.Provider>
    )
    expect(screen.getByText('Limit price')).toBeVisible()
    expect(screen.getByPlaceholderText('0')).toBeVisible()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render correct subheader with input currency and limit price defined', () => {
    render(
      <SwapAndLimitContext.Provider value={mockSwapAndLimitContextValue}>
        <LimitContext.Provider value={mockLimitContextValue}>
          <LimitPriceInputPanel />
        </LimitContext.Provider>
      </SwapAndLimitContext.Provider>
    )
    expect(screen.getByText('DAI')).toBeVisible()
    expect(screen.getByPlaceholderText('0')).toBeVisible()
  })

  it('should render the output currency when defined', () => {
    const { container } = render(
      <SwapAndLimitContext.Provider
        value={{
          ...mockSwapAndLimitContextValue,
          currencyState: {
            ...mockSwapAndLimitContextValue.currencyState,
            outputCurrency: USDC_MAINNET,
          },
        }}
      >
        <LimitContext.Provider value={mockLimitContextValue}>
          <LimitPriceInputPanel />
        </LimitContext.Provider>
      </SwapAndLimitContext.Provider>
    )
    expect(screen.getByText('DAI')).toBeVisible() // subheader
    expect(container.querySelector('.token-symbol-container')).toHaveTextContent('USDC')
    expect(screen.getByPlaceholderText('0')).toBeVisible()
  })
})
