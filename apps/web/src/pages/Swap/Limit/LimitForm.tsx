import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceSectionName,
  SharedEventName,
  SwapEventName,
} from '@uniswap/analytics-events'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { useWeb3React } from '@web3-react/core'
import { Trace, TraceEvent } from 'analytics'
import { useOpenAccountDrawer, useToggleAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonError, ButtonLight } from 'components/Button'
import Column from 'components/Column'
import { ConfirmSwapModal } from 'components/ConfirmSwapModal'
import { LimitPriceInputPanel } from 'components/CurrencyInputPanel/LimitPriceInputPanel/LimitPriceInputPanel'
import SwapCurrencyInputPanel from 'components/CurrencyInputPanel/SwapCurrencyInputPanel'
import { Field } from 'components/swap/constants'
import { ArrowContainer, ArrowWrapper, SwapSection } from 'components/swap/styled'
import { getChainInfo, isUniswapXSupportedChain, useIsSupportedChainId } from 'constants/chains'
import { ZERO_PERCENT } from 'constants/misc'
import usePermit2Allowance, { AllowanceState } from 'hooks/usePermit2Allowance'
import { SwapResult, useSwapCallback } from 'hooks/useSwapCallback'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { Trans } from 'i18n'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { LimitContextProvider, useLimitContext } from 'state/limit/LimitContext'
import { LimitState } from 'state/limit/types'
import { LimitOrderTrade, TradeFillType } from 'state/routing/types'
import { useSwapActionHandlers, useSwapAndLimitContext } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components'
import {
  NumberType,
  formatCurrencyAmount as formatCurrencyAmountWithoutUserLocale,
  useFormatter,
} from 'utils/formatNumbers'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { MenuState, miniPortfolioMenuStateAtom } from 'components/AccountDrawer/DefaultMenu'
import { OpenLimitOrdersButton } from 'components/AccountDrawer/MiniPortfolio/Limits/OpenLimitOrdersButton'
import {
  LimitPriceErrorType,
  useCurrentPriceAdjustment,
} from 'components/CurrencyInputPanel/LimitPriceInputPanel/useCurrentPriceAdjustment'
import Row from 'components/Row'
import { CurrencySearchFilters } from 'components/SearchModal/CurrencySearch'
import { SupportArticleURL } from 'constants/supportArticles'
import { useAtom } from 'jotai'
import { LimitPriceError } from 'pages/Swap/Limit/LimitPriceError'
import { getDefaultPriceInverted } from 'state/limit/hooks'
import { CurrencyState } from 'state/swap/types'
import { ExternalLink, ThemedText } from 'theme/components'
import { AlertTriangle } from 'ui/src/components/icons'
import { LimitExpirySection } from './LimitExpirySection'

const CustomHeightSwapSection = styled(SwapSection)`
  height: unset;
`

const ShortArrowWrapper = styled(ArrowWrapper)`
  margin-top: -22px;
  margin-bottom: -22px;
`

const StyledAlertIcon = styled(AlertTriangle)`
  align-self: flex-start;
  flex-shrink: 0;
  margin-right: 12px;
`

const LimitDisclaimerContainer = styled(Row)`
  background-color: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
`

const DisclaimerText = styled(ThemedText.LabelSmall)`
  line-height: 20px;
`

export const LIMIT_FORM_CURRENCY_SEARCH_FILTERS: CurrencySearchFilters = {
  showCommonBases: true,
}

type LimitFormProps = {
  onCurrencyChange?: (selected: CurrencyState) => void
}

function LimitForm({ onCurrencyChange }: LimitFormProps) {
  const { chainId, account } = useWeb3React()
  const isSupportedChain = useIsSupportedChainId(chainId)
  const {
    currencyState: { inputCurrency, outputCurrency },
    setCurrencyState,
  } = useSwapAndLimitContext()

  const { limitState, setLimitState, derivedLimitInfo } = useLimitContext()
  const { currencyBalances, parsedAmounts, parsedLimitPrice, limitOrderTrade, marketPrice } = derivedLimitInfo
  const [showConfirm, setShowConfirm] = useState(false)
  const [swapResult, setSwapResult] = useState<SwapResult>()
  const [swapError, setSwapError] = useState()

  const theme = useTheme()
  const { onSwitchTokens } = useSwapActionHandlers()
  const { formatCurrencyAmount } = useFormatter()
  const openAccountDrawer = useOpenAccountDrawer()
  const [, setMenu] = useAtom(miniPortfolioMenuStateAtom)

  const { currentPriceAdjustment, priceError } = useCurrentPriceAdjustment({
    parsedLimitPrice,
    marketPrice: limitState.limitPriceInverted ? marketPrice?.invert() : marketPrice,
    baseCurrency: limitState.limitPriceInverted ? outputCurrency : inputCurrency,
    quoteCurrency: limitState.limitPriceInverted ? inputCurrency : outputCurrency,
    limitPriceInverted: limitState.limitPriceInverted,
  })

  useEffect(() => {
    if (limitState.limitPriceEdited || !marketPrice || !inputCurrency || !outputCurrency) return

    const marketPriceString = formatCurrencyAmountWithoutUserLocale({
      amount: (() => {
        if (limitState.limitPriceInverted) {
          return marketPrice.invert().quote(CurrencyAmount.fromRawAmount(outputCurrency, 10 ** outputCurrency.decimals))
        } else {
          return marketPrice.quote(CurrencyAmount.fromRawAmount(inputCurrency, 10 ** inputCurrency.decimals))
        }
      })(),
      type: NumberType.SwapTradeAmount,
      placeholder: '',
      locale: 'en-US',
    })

    setLimitState((prev) => ({
      ...prev,
      limitPrice: marketPriceString,
    }))
  }, [
    formatCurrencyAmount,
    inputCurrency,
    limitState.limitPriceEdited,
    limitState.limitPriceInverted,
    marketPrice,
    outputCurrency,
    setLimitState,
  ])

  const onTypeInput = useCallback(
    (type: keyof LimitState) => (newValue: string) => {
      setLimitState((prev) => ({
        ...prev,
        [type]: newValue,
        limitPriceEdited: type === 'limitPrice' ? true : prev.limitPriceEdited,
        isInputAmountFixed: type !== 'outputAmount',
      }))
    },
    [setLimitState]
  )

  const switchTokens = useCallback(() => {
    onSwitchTokens({ newOutputHasTax: false, previouslyEstimatedOutput: limitState.outputAmount })
    setLimitState((prev) => ({ ...prev, limitPriceInverted: getDefaultPriceInverted(outputCurrency, inputCurrency) }))
  }, [inputCurrency, limitState.outputAmount, onSwitchTokens, outputCurrency, setLimitState])

  const onSelectCurrency = useCallback(
    (type: keyof CurrencyState, newCurrency: Currency) => {
      if ((type === 'inputCurrency' ? outputCurrency : inputCurrency)?.equals(newCurrency)) {
        return switchTokens()
      }
      const [newInput, newOutput] =
        type === 'inputCurrency' ? [newCurrency, outputCurrency] : [inputCurrency, newCurrency]
      const newCurrencyState = {
        inputCurrency: newInput,
        outputCurrency: newOutput,
      }
      const [otherCurrency, currencyToBeReplaced] =
        type === 'inputCurrency' ? [outputCurrency, inputCurrency] : [inputCurrency, outputCurrency]
      // Checking if either of the currencies are native, then checking if there also exists a wrapped version of the native currency.
      // If so, then we remove the currency that wasn't selected and put back in the one that was going to be replaced.
      // Ex: Initial state: inputCurrency: USDC, outputCurrency: WETH. Select ETH for input currency. Final state: inputCurrency: ETH, outputCurrency: USDC
      if (otherCurrency && (newCurrency.isNative || otherCurrency.isNative)) {
        const [nativeCurrency, nonNativeCurrency] = newCurrency.isNative
          ? [newCurrency, otherCurrency]
          : [otherCurrency, newCurrency]
        if (nativeCurrency.wrapped.equals(nonNativeCurrency)) {
          newCurrencyState[type === 'inputCurrency' ? 'outputCurrency' : 'inputCurrency'] = currencyToBeReplaced
        }
      }
      setLimitState((prev) => ({ ...prev, limitPriceEdited: false }))
      onCurrencyChange?.(newCurrencyState)
      setCurrencyState(newCurrencyState)
    },
    [inputCurrency, onCurrencyChange, outputCurrency, setCurrencyState, setLimitState, switchTokens]
  )

  useEffect(() => {
    if (!outputCurrency && isSupportedChain) {
      onSelectCurrency('outputCurrency', getChainInfo({ chainId }).spotPriceStablecoinAmount.currency)
    }
  }, [chainId, onSelectCurrency, outputCurrency, isSupportedChain])

  useEffect(() => {
    if (isSupportedChain && inputCurrency && outputCurrency && (inputCurrency.isNative || outputCurrency.isNative)) {
      const [nativeCurrency, nonNativeCurrency] = inputCurrency.isNative
        ? [inputCurrency, outputCurrency]
        : [outputCurrency, inputCurrency]
      if (nativeCurrency.wrapped.equals(nonNativeCurrency)) {
        onSelectCurrency('outputCurrency', getChainInfo({ chainId }).spotPriceStablecoinAmount.currency)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  )
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onTypeInput('inputAmount')(maxInputAmount.toExact())
  }, [maxInputAmount, onTypeInput])

  const hasInsufficientFunds =
    parsedAmounts.INPUT && currencyBalances.INPUT ? currencyBalances.INPUT.lessThan(parsedAmounts.INPUT) : false

  const allowance = usePermit2Allowance(
    parsedAmounts.INPUT?.currency?.isNative ? undefined : (parsedAmounts.INPUT as CurrencyAmount<Token>),
    isSupportedChain ? UNIVERSAL_ROUTER_ADDRESS(chainId) : undefined,
    TradeFillType.UniswapX
  )

  const fiatValueTradeInput = useUSDPrice(parsedAmounts.INPUT)
  const fiatValueTradeOutput = useUSDPrice(parsedAmounts.OUTPUT)

  const formattedAmounts = useMemo(() => {
    // if there is no Price field, then just default to user-typed amounts
    if (!limitState.limitPrice) {
      return {
        [Field.INPUT]: limitState.inputAmount,
        [Field.OUTPUT]: limitState.outputAmount,
      }
    }

    const formattedInput = limitState.isInputAmountFixed
      ? limitState.inputAmount
      : formatCurrencyAmount({
          amount: derivedLimitInfo.parsedAmounts[Field.INPUT],
          type: NumberType.SwapTradeAmount,
          placeholder: '',
        })
    const formattedOutput = limitState.isInputAmountFixed
      ? formatCurrencyAmount({
          amount: derivedLimitInfo.parsedAmounts[Field.OUTPUT],
          type: NumberType.SwapTradeAmount,
          placeholder: '',
        })
      : limitState.outputAmount

    return {
      [Field.INPUT]: formattedInput,
      [Field.OUTPUT]: formattedOutput,
    }
  }, [
    limitState.limitPrice,
    limitState.isInputAmountFixed,
    limitState.inputAmount,
    limitState.outputAmount,
    formatCurrencyAmount,
    derivedLimitInfo.parsedAmounts,
  ])

  const fiatValues = useMemo(() => {
    return { amountIn: fiatValueTradeInput.data, amountOut: fiatValueTradeOutput.data }
  }, [fiatValueTradeInput.data, fiatValueTradeOutput.data])

  const swapCallback = useSwapCallback(
    limitOrderTrade,
    fiatValues,
    ZERO_PERCENT,
    allowance.state === AllowanceState.ALLOWED ? allowance.permitSignature : undefined
  )

  const handleSubmit = useCallback(async () => {
    if (!swapCallback) {
      return
    }
    try {
      const result = await swapCallback()
      setSwapResult(result)
    } catch (error) {
      setSwapError(error)
    }
  }, [swapCallback])

  return (
    <Column gap="xs">
      <CustomHeightSwapSection>
        <LimitPriceInputPanel onCurrencySelect={onSelectCurrency} />
      </CustomHeightSwapSection>
      <SwapSection>
        <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
          <SwapCurrencyInputPanel
            label={<Trans>Sell</Trans>}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={showMaxButton}
            currency={inputCurrency ?? null}
            onUserInput={onTypeInput('inputAmount')}
            onCurrencySelect={(currency) => onSelectCurrency('inputCurrency', currency)}
            otherCurrency={outputCurrency}
            onMax={handleMaxInput}
            currencySearchFilters={LIMIT_FORM_CURRENCY_SEARCH_FILTERS}
            id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
          />
        </Trace>
      </SwapSection>
      <ShortArrowWrapper clickable={isSupportedChain}>
        <TraceEvent
          events={[BrowserEvent.onClick]}
          name={SwapEventName.SWAP_TOKENS_REVERSED}
          element={InterfaceElementName.SWAP_TOKENS_REVERSE_ARROW_BUTTON}
        >
          <ArrowContainer data-testid="swap-currency-button" onClick={switchTokens} color={theme.neutral1}>
            <ArrowDown size="16" color={theme.neutral1} />
          </ArrowContainer>
        </TraceEvent>
      </ShortArrowWrapper>
      <SwapSection>
        <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
          <SwapCurrencyInputPanel
            label={<Trans>Buy</Trans>}
            value={formattedAmounts[Field.OUTPUT]}
            showMaxButton={false}
            currency={outputCurrency ?? null}
            onUserInput={onTypeInput('outputAmount')}
            onCurrencySelect={(currency) => onSelectCurrency('outputCurrency', currency)}
            otherCurrency={inputCurrency}
            currencySearchFilters={LIMIT_FORM_CURRENCY_SEARCH_FILTERS}
            id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
          />
        </Trace>
      </SwapSection>
      {parsedLimitPrice && <LimitExpirySection />}
      <SubmitOrderButton
        inputCurrency={inputCurrency}
        handleContinueToReview={() => {
          setShowConfirm(true)
        }}
        trade={limitOrderTrade}
        hasInsufficientFunds={hasInsufficientFunds}
        limitPriceError={priceError}
      />
      {!!priceError && inputCurrency && outputCurrency && limitOrderTrade && (
        <LimitPriceError
          priceError={priceError}
          priceAdjustmentPercentage={currentPriceAdjustment}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          priceInverted={limitState.limitPriceInverted}
        />
      )}
      {account && (
        <OpenLimitOrdersButton
          account={account}
          openLimitsMenu={() => {
            setMenu(MenuState.LIMITS)
            openAccountDrawer()
          }}
        />
      )}
      <LimitDisclaimerContainer>
        <StyledAlertIcon size={20} color={!isUniswapXSupportedChain(chainId) ? theme.critical : theme.neutral2} />
        <DisclaimerText>
          {!isUniswapXSupportedChain(chainId) ? (
            <Trans>
              Only Ethereum mainnet tokens are available for limits.{' '}
              <ExternalLink href={SupportArticleURL.LIMITS_SUPPORTED_NETWORKS}>
                <Trans>Learn more</Trans>
              </ExternalLink>
            </Trans>
          ) : (
            <Trans>
              Limits may not execute exactly when tokens reach the specified price.{' '}
              <ExternalLink href={SupportArticleURL.LIMIT_FAILURE}>
                <Trans>Learn more</Trans>
              </ExternalLink>
            </Trans>
          )}
        </DisclaimerText>
      </LimitDisclaimerContainer>
      {limitOrderTrade && showConfirm && (
        <ConfirmSwapModal
          allowance={allowance}
          trade={limitOrderTrade}
          inputCurrency={inputCurrency}
          allowedSlippage={ZERO_PERCENT}
          clearSwapState={() => {
            setSwapError(undefined)
            setSwapResult(undefined)
          }}
          fiatValueInput={fiatValueTradeInput}
          fiatValueOutput={fiatValueTradeOutput}
          onCurrencySelection={(field: Field, currency) => {
            onSelectCurrency(field === Field.INPUT ? 'inputCurrency' : 'outputCurrency', currency)
          }}
          onConfirm={handleSubmit}
          onDismiss={() => {
            setShowConfirm(false)
            setSwapResult(undefined)
          }}
          swapResult={swapResult}
          swapError={swapError}
        />
      )}
    </Column>
  )
}

function SubmitOrderButton({
  trade,
  handleContinueToReview,
  inputCurrency,
  hasInsufficientFunds,
  limitPriceError,
}: {
  trade?: LimitOrderTrade
  handleContinueToReview: () => void
  inputCurrency?: Currency
  hasInsufficientFunds: boolean
  limitPriceError?: LimitPriceErrorType
}) {
  const toggleWalletDrawer = useToggleAccountDrawer()
  const { account, chainId } = useWeb3React()

  if (!isUniswapXSupportedChain(chainId)) {
    return (
      <ButtonError disabled>
        <Trans>Select supported tokens</Trans>
      </ButtonError>
    )
  }

  if (!account) {
    return (
      <ButtonLight onClick={toggleWalletDrawer} fontWeight={535} $borderRadius="16px">
        <Trans>Connect wallet</Trans>
      </ButtonLight>
    )
  }

  if (hasInsufficientFunds) {
    return (
      <ButtonError disabled>
        <Text fontSize={20}>
          {inputCurrency ? (
            <Trans>Insufficient {{ sym: inputCurrency.symbol }} balance</Trans>
          ) : (
            <Trans>Insufficient balance</Trans>
          )}
        </Text>
      </ButtonError>
    )
  }

  return (
    <TraceEvent events={[BrowserEvent.onClick]} name={SharedEventName.ELEMENT_CLICKED} element="limit-order-button">
      <ButtonError
        onClick={handleContinueToReview}
        id="submit-order-button"
        data-testid="submit-order-button"
        disabled={!trade || !!limitPriceError}
      >
        <Text fontSize={20}>Confirm</Text>
      </ButtonError>
    </TraceEvent>
  )
}

export function LimitFormWrapper(props: LimitFormProps) {
  return (
    <Trace page="limit-page">
      <LimitContextProvider>
        <LimitForm {...props} />
      </LimitContextProvider>
    </Trace>
  )
}
