import { fireEvent, render, screen } from 'test-utils/render'

import Head from './Head'

describe('ConfirmSwapModalV2/Head', () => {
  it('should render correctly for a classic swap', () => {
    const { asFragment } = render(<Head onDismiss={jest.fn()} isLimitTrade={false} />)
    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByText('Review swap')).toBeInTheDocument()
  })

  it('should render correctly for a Limit order', () => {
    const { asFragment } = render(<Head onDismiss={jest.fn()} isLimitTrade={true} />)
    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByText('Review limit')).toBeInTheDocument()
  })

  it('should call the close callback', () => {
    const callback = jest.fn()
    const component = render(<Head onDismiss={callback} isLimitTrade={false} />)

    const button = component.getByTestId('confirmation-close-icon')

    fireEvent.click(button)

    expect(callback).toHaveBeenCalled()
  })
})
