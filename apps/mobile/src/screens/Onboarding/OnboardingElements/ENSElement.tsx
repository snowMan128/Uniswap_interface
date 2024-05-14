import { Flex, Image } from 'ui/src'
import { ENS_LOGO } from 'ui/src/assets'
import { colors, imageSizes, opacify } from 'ui/src/theme'

export const ENSElement = (): JSX.Element => {
  return (
    <Flex
      borderRadius="$rounded12"
      p="$spacing12"
      style={{ backgroundColor: opacify(20, colors.blue300) }}
      transform={[{ rotateZ: '8deg' }]}>
      <Image
        height={imageSizes.image24}
        resizeMode="contain"
        source={ENS_LOGO}
        width={imageSizes.image24}
      />
    </Flex>
  )
}
