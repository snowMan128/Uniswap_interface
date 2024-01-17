import { Path, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const [TrendUp, AnimatedTrendUp] = createIcon({
  name: 'TrendUp',
  getIcon: (props) => (
    <Svg fill="currentColor" viewBox="0 0 16 16" {...props}>
      <Path
        d="M14.6667 4.66667V7.43604C14.6667 7.80404 14.368 8.1027 14 8.1027C13.632 8.1027 13.3333 7.80404 13.3333 7.43604V6.27604L9.60933 10C9.09 10.52 8.24333 10.52 7.72399 10L5.99999 8.27604L2.47133 11.8047C2.34133 11.9347 2.17066 12 1.99999 12C1.82933 12 1.65866 11.9347 1.52866 11.8047C1.26799 11.544 1.26799 11.1226 1.52866 10.862L5.05733 7.33333C5.57666 6.81333 6.42333 6.81333 6.94266 7.33333L8.66666 9.05729L12.3907 5.33333H11.2307C10.8627 5.33333 10.564 5.03467 10.564 4.66667C10.564 4.29867 10.8627 4 11.2307 4H14C14.0867 4 14.1733 4.01794 14.2547 4.05127C14.418 4.11927 14.5473 4.24861 14.6153 4.41195C14.6487 4.49328 14.6667 4.58 14.6667 4.66667Z"
        fill={'currentColor' ?? '#0151FE'}
      />
    </Svg>
  ),
  defaultFill: '#0151FE',
})
