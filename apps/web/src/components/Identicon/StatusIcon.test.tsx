import StatusIcon from 'components/Identicon/StatusIcon'
import { mocked } from 'test-utils/mocked'
import { render, waitFor } from 'test-utils/render'
import { useAccount } from 'wagmi'

const ACCOUNT = '0x0'

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
}))

jest.mock('uniswap/src/features/unitags/hooks', () => ({
  useUnitagByAddress: () => ({ unitag: undefined, loading: false }),
}))

jest.mock('../../hooks/useSocksBalance', () => ({
  useHasSocks: () => true,
}))

describe('StatusIcon', () => {
  describe('with no account', () => {
    it('renders children in correct order', () => {
      mocked(useAccount).mockReturnValue({
        address: undefined,
        connector: undefined,
      } as unknown as ReturnType<typeof useAccount>)
      const component = render(<StatusIcon />)
      expect(component.getByTestId('StatusIconRoot')).toMatchSnapshot()
      expect(component.queryByTestId('MiniIcon')).not.toBeInTheDocument()
    })
  })

  describe('with account', () => {
    it('renders children in correct order', () => {
      jest.spyOn(console, 'error').mockImplementation(() => null)
      mocked(useAccount).mockReturnValue({
        address: ACCOUNT,
        connector: { id: 'io.metamask' },
      } as unknown as ReturnType<typeof useAccount>)

      const component = render(<StatusIcon />)
      expect(component.getByTestId('StatusIconRoot')).toMatchSnapshot()
      expect(component.getByTestId('MiniIcon')).toBeInTheDocument()
    })
  })

  it('renders without mini icons', async () => {
    mocked(useAccount).mockReturnValue({
      address: ACCOUNT,
      connector: { id: 'io.metamask' },
    } as unknown as ReturnType<typeof useAccount>)

    const component = render(<StatusIcon showMiniIcons={false} />)
    await waitFor(() => expect(component.queryByTestId('IdenticonLoader')).not.toBeInTheDocument())
    expect(component.queryByTestId('MiniIcon')).not.toBeInTheDocument()
  })
})
