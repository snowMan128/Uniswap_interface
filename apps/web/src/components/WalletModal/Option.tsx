import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { TraceEvent } from 'analytics'
import Badge, { BadgeVariant } from 'components/Badge'
import Loader from 'components/Icons/LoadingSpinner'

import { CONNECTOR_ICON_OVERRIDE_MAP, useRecentConnectorId } from 'components/Web3Provider/constants'
import { useConnectWithLogs } from 'connection/activate'
import { Trans } from 'i18n'
import styled from 'styled-components'
import { ThemedText } from 'theme/components'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'
import { isIFramed } from 'utils/isIFramed'
import { Connector, useAccount } from 'wagmi'

const OptionCardLeft = styled.div`
  ${flexColumnNoWrap};
  flex-direction: row;
  align-items: center;
`

const OptionCardClickable = styled.button<{ selected: boolean }>`
  align-items: center;
  background-color: unset;
  border: none;
  cursor: pointer;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  justify-content: space-between;
  opacity: ${({ disabled, selected }) => (disabled && !selected ? '0.5' : '1')};
  padding: 18px;
  transition: ${({ theme }) => theme.transition.duration.fast};
`

const HeaderText = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.accent1 : ({ theme }) => theme.neutral1)};
  font-size: 16px;
  font-weight: 535;
  padding: 0 8px;
`
const IconWrapper = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  img {
    ${({ theme }) => !theme.darkMode && `border: 1px solid ${theme.surface3}`};
    border-radius: 12px;
  }
  & > img,
  span {
    height: 40px;
    width: 40px;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const Wrapper = styled.div<{ disabled: boolean }>`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  width: 100%;

  background-color: ${({ theme }) => theme.surface2};

  &:hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    background-color: ${({ theme, disabled }) => !disabled && theme.surface3};
  }
  &:focus {
    background-color: ${({ theme, disabled }) => !disabled && theme.surface3};
  }
`

const StyledBadge = styled(Badge)`
  border-radius: 4px;
  padding: 1px 4px;
`

const RecentBadge = () => (
  <StyledBadge variant={BadgeVariant.SOFT}>
    <ThemedText.LabelMicro color="accent1">
      <Trans>Recent</Trans>
    </ThemedText.LabelMicro>
  </StyledBadge>
)

export function Option({
  connector,
  connectWithLogs,
}: {
  connector: Connector
  connectWithLogs: ReturnType<typeof useConnectWithLogs>
}) {
  const { isConnecting, isReconnecting } = useAccount()
  const { variables, connect } = connectWithLogs
  const isRecent = connector.id === useRecentConnectorId()
  const isCurrentOptionPending = isConnecting && variables?.connector === connector
  const rightSideDetail = isCurrentOptionPending ? <Loader /> : isRecent ? <RecentBadge /> : null
  const icon = CONNECTOR_ICON_OVERRIDE_MAP[connector.id] ?? connector.icon
  // TODO(WEB-4173): Remove isIFrame check when we can update wagmi to version >= 2.9.4
  const isDisabled = (isConnecting || isReconnecting) && !isIFramed()

  return (
    <Wrapper disabled={isDisabled}>
      <TraceEvent
        events={[BrowserEvent.onClick]}
        name={InterfaceEventName.WALLET_SELECTED}
        properties={{ wallet_type: connector.name }}
        element={InterfaceElementName.WALLET_TYPE_OPTION}
      >
        <OptionCardClickable
          disabled={isDisabled}
          onClick={() => connect(connector)}
          selected={isCurrentOptionPending}
          data-testid={`wallet-option-${connector.type}`}
        >
          <OptionCardLeft>
            <IconWrapper>
              <img src={icon} alt={connector.name} />
            </IconWrapper>
            <HeaderText>{connector.name}</HeaderText>
          </OptionCardLeft>
          {rightSideDetail}
        </OptionCardClickable>
      </TraceEvent>
    </Wrapper>
  )
}
