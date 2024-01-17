import { Path, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const [TrendDown, AnimatedTrendDown] = createIcon({
  name: 'TrendDown',
  getIcon: (props) => (
    <Svg fill="currentColor" viewBox="0 0 14 8" {...props}>
      <Path
        d="M13.6667 7.33334C13.6667 7.42 13.6487 7.50672 13.6153 7.58806C13.548 7.75072 13.418 7.88073 13.2547 7.94874C13.1733 7.98274 13.0867 8 13 8H10.2307C9.86267 8 9.564 7.70134 9.564 7.33334C9.564 6.96534 9.86267 6.66667 10.2307 6.66667H11.3907L7.66668 2.94271L5.94268 4.66667C5.42334 5.18667 4.57668 5.18667 4.05734 4.66667L0.528676 1.13803C0.268009 0.877359 0.268009 0.455984 0.528676 0.195317C0.789342 -0.0653498 1.21068 -0.0653498 1.47134 0.195317L5.00001 3.72396L6.72401 2C7.24334 1.48 8.09001 1.48 8.60934 2L12.3333 5.72396V4.56397C12.3333 4.19597 12.632 3.8973 13 3.8973C13.368 3.8973 13.6667 4.19597 13.6667 4.56397V7.33334Z"
        fill={'currentColor' ?? '#0151FE'}
      />
    </Svg>
  ),
  defaultFill: '#0151FE',
})
