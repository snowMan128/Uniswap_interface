import Column from 'components/Column'
import Row from 'components/Row'
import { Trans } from 'i18n'
import { ReactNode } from 'react'
import styled from 'styled-components'
import { ExternalLink } from 'theme/components'
import { AlertTriangle } from 'ui/src/components/icons/AlertTriangle'
import { Text } from 'ui/src/components/text/Text'
import { iconSizes } from 'ui/src/theme'

const Container = styled.div`
  height: 100%;
  width: 100%;
  max-width: 550px;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.surface3};
  background: ${({ theme }) => theme.surface2};
`
const StyledColumn = styled(Column)`
  height: 100%;
`
const IconContainer = styled.div`
  height: 40px;
  width: 40px;
  padding: 10px;
  border-radius: 12px;
  background: ${({ theme }) => theme.critical2};
`

interface PoolWarningProps {
  title: ReactNode
  subtitle: ReactNode
  link: string
}

// TODO (WEB-4097): Replace with generic spore alert component, when available
export function PoolWarning({ title, subtitle, link }: PoolWarningProps) {
  return (
    <Container>
      <Row gap="md" height="100%">
        <StyledColumn>
          <IconContainer>
            <AlertTriangle color="$statusCritical" size={iconSizes.icon20} />
          </IconContainer>
        </StyledColumn>
        <StyledColumn gap="xs">
          <Text variant="body3" color="$neutral1">
            {title}
          </Text>
          <Text variant="body3" color="$neutral2">
            {subtitle}
          </Text>
          <ExternalLink href={link}>
            <Text variant="buttonLabel4" color="$neutral1">
              <Trans>Learn more</Trans>
            </Text>
          </ExternalLink>
        </StyledColumn>
      </Row>
    </Container>
  )
}
