import { t, Trans } from '@lingui/macro'
import Row from 'components/Row'
import { Expiry, useLimitContext } from 'state/limit/LimitContext'
import styled from 'styled-components'
import { ClickableStyle, ThemedText } from 'theme/components'

const ExpirySection = styled(Row)`
  width: 100%;
  padding: 12px 16px;
  justify-content: space-between;
`

const LimitExpiryButton = styled.button<{ $selected: boolean }>`
  display: flex;
  padding: 4px 8px;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 999px;
  background-color: ${({ theme, $selected }) => ($selected ? theme.surface3 : 'unset')};
  ${ClickableStyle}
`

const ExpiryButtonLabel = styled(ThemedText.LabelSmall)`
  color: ${({ theme }) => theme.neutral1};
`

const EXPIRY_OPTIONS = [Expiry.Day, Expiry.Week, Expiry.Month, Expiry.Year]

function getExpiryLabelText(expiry: Expiry) {
  switch (expiry) {
    case Expiry.Day:
      return t`1 Day`
    case Expiry.Week:
      return t`1 Week`
    case Expiry.Month:
      return t`1 Month`
    case Expiry.Year:
      return t`1 Year`
  }
}

export function LimitExpirySection() {
  const { limitState, setLimitState } = useLimitContext()

  return (
    <ExpirySection>
      <ThemedText.SubHeaderSmall>
        <Trans>Expiry</Trans>
      </ThemedText.SubHeaderSmall>
      <Row justify="flex-end" gap="xs">
        {EXPIRY_OPTIONS.map((expiry) => (
          <LimitExpiryButton
            key={expiry}
            $selected={expiry === limitState.expiry}
            onClick={() => {
              if (expiry === limitState.expiry) return
              setLimitState((prev) => ({
                ...prev,
                expiry,
              }))
            }}
          >
            <ExpiryButtonLabel>{getExpiryLabelText(expiry)}</ExpiryButtonLabel>
          </LimitExpiryButton>
        ))}
      </Row>
    </ExpirySection>
  )
}
