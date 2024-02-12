import { UnitagProfilePicture } from 'src/components/unitags/UnitagProfilePicture'
import { Flex, Text } from 'ui/src'
import { imageSizes, spacing } from 'ui/src/theme'
import { UNITAG_SUFFIX } from 'wallet/src/features/unitags/constants'

export const UnitagWithProfilePicture = ({
  unitag,
  address,
  profilePictureUri,
}: {
  unitag: string
  address: Address
  profilePictureUri?: string
}): JSX.Element => {
  return (
    <Flex centered gap={-spacing.spacing24}>
      <UnitagProfilePicture
        address={address}
        profilePictureUri={profilePictureUri}
        size={imageSizes.image100}
      />
      <Flex
        row
        backgroundColor="$surface1"
        borderRadius="$rounded32"
        px="$spacing12"
        py="$spacing8"
        shadowColor="$neutral3"
        shadowOpacity={0.4}
        shadowRadius="$spacing4"
        transform={[{ rotateZ: '-2deg' }]}
        zIndex="$popover">
        <Text color="$accent1" variant="buttonLabel1">
          {unitag}
          <Text color="$neutral2" variant="buttonLabel1">
            {UNITAG_SUFFIX}
          </Text>
        </Text>
      </Flex>
    </Flex>
  )
}
