import { G, Path, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const [Pen, AnimatedPen] = createIcon({
  name: 'Pen',
  getIcon: (props) => (
    <Svg fill="none" viewBox="0 0 13 13" {...props}>
      <G id="pen">
        <Path
          d="M8.94259 6.29432C8.99932 6.35105 8.99932 6.44362 8.94259 6.50035L4.56096 10.863H2.13672V8.4388L6.49941 4.05723C6.55614 4.00001 6.64828 4.00001 6.70549 4.05723L8.94259 6.29432ZM10.5779 3.49822L9.50154 2.42181C9.12142 2.04169 8.50477 2.04169 8.12465 2.42181L7.21402 3.33238C7.15729 3.38911 7.15729 3.4812 7.21402 3.53793L9.46177 5.78568C9.51849 5.84241 9.61065 5.84241 9.66738 5.78568L10.5779 4.87517C10.958 4.49505 10.958 3.87834 10.5779 3.49822Z"
          fill="white"
          id="pen_2"
        />
      </G>
    </Svg>
  ),
})
