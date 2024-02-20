import Column from 'components/Column'
import styled from 'styled-components'
import { BREAKPOINTS } from 'theme'
import { Buttons, Copy, Profile } from '.'
import { PopupContainer } from '../shared/styled'
import pfp1 from './assets/pfp1.png'
import pfp2 from './assets/pfp2.png'
import pfp3 from './assets/pfp3.png'
import pfp4 from './assets/pfp4.png'
import { useUniTagBanner } from './useUniTagBanner'

const StyledPopupContainer = styled(PopupContainer)`
  height: 160px;
  width: 390px;
  right: 28px;
  bottom: 46px;
  @media screen and (max-width: ${BREAKPOINTS.md}px) {
    height: 136px;
    width: 369px;
    right: unset;
    left: unset;
    bottom: 73px;
  }
  border: none;
  background: none;
  overflow: hidden;
`
const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  background: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 20px;
  box-shadow: 0px 0px 10px 0px rgba(34, 34, 34, 0.04);
  overflow: hidden;
`
const CopyContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  height: 68px;
  width: 280px;
  gap: 4px;
`
const ButtonsContainer = styled.div`
  position: absolute;
  top: 104px;
  left: 16px;
  gap: 12px;
  z-index: 1;
  width: calc(100% - 32px);
  @media screen and (max-width: ${BREAKPOINTS.md}px) {
    top: 88px;
    left: 16px;
  }
`
const GraphicsContainer = styled(Column)`
  position: absolute;
  top: 0px;
  left: 318px;
  @media screen and (max-width: ${BREAKPOINTS.md}px) {
    left: 275px;
  }
  gap: 6px;
  opacity: 0.8;
`
export function LargeUniTagBanner() {
  const { shouldHideUniTagBanner, handleAccept, handleReject } = useUniTagBanner()

  return (
    <StyledPopupContainer show={!shouldHideUniTagBanner} data-testid="large-unitag-banner">
      <Container>
        <CopyContainer>
          <Copy large />
        </CopyContainer>
        <ButtonsContainer>
          <Buttons large onAccept={handleAccept} onReject={handleReject} />
        </ButtonsContainer>
      </Container>
      <GraphicsContainer>
        <Profile pfp={pfp1} name="maggie" color="#67bcff" rotation={-2} offset={5} large />
        <Profile pfp={pfp2} name="hayden" color="#8CD698" rotation={3} offset={-88} large />
        <Profile pfp={pfp3} name="unicorn" color="#E89DE5" rotation={-2} offset={5} large />
        <Profile pfp={pfp4} name="bryan" color="#FE7C00" rotation={-2} offset={-80} large />
      </GraphicsContainer>
    </StyledPopupContainer>
  )
}
