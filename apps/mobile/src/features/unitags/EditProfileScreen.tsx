import { isEqual } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { UnitagStackScreenProp } from 'src/app/navigation/types'
import { TextInput } from 'src/components/input/TextInput'
import { Screen } from 'src/components/layout/Screen'
import { ChoosePhotoOptionsModal } from 'src/components/unitags/ChoosePhotoOptionsModal'
import { ScreenRow } from 'src/components/unitags/ScreenRow'
import { UnitagProfilePicture } from 'src/components/unitags/UnitagProfilePicture'
import { UNITAG_SUFFIX } from 'src/features/unitags/constants'
import { UnitagScreens } from 'src/screens/Screens'
import { Button, Flex, Icons, Text, useDeviceInsets } from 'ui/src'
import { iconSizes, imageSizes } from 'ui/src/theme'
import { ChainId } from 'wallet/src/constants/chains'
import { useENS } from 'wallet/src/features/ens/useENS'
import { useUnitagUpdateMetadataMutation } from 'wallet/src/features/unitags/api'
import { useUnitag } from 'wallet/src/features/unitags/hooks'
import { ProfileMetadata } from 'wallet/src/features/unitags/types'
import { shortenAddress } from 'wallet/src/utils/addresses'

const isProfileMetadataEdited = (
  loading: boolean,
  updatedMetadata: ProfileMetadata,
  initialMetadata?: ProfileMetadata
): boolean => {
  return !!initialMetadata && !loading && isEqual(updatedMetadata, initialMetadata)
}

export function EditProfileScreen({
  route,
}: UnitagStackScreenProp<UnitagScreens.EditProfile>): JSX.Element {
  const { address } = route.params
  const unitag = useUnitag(address)
  const { name: ensName } = useENS(ChainId.Mainnet, address)
  const insets = useDeviceInsets()
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [imageUri, setImageUri] = useState<string>()
  const [bioInput, setBioInput] = useState<string>()
  const [urlInput, setUrlInput] = useState<string>()
  const [twitterInput, setTwitterInput] = useState<string>()
  const updatedMetadata: ProfileMetadata = {
    avatar: imageUri,
    description: bioInput,
    url: urlInput,
    twitter: twitterInput,
  }
  const [
    updateUnitagMetadata,
    { called: updateRequestMade, loading: updateResponseLoading, data: updateResponse },
  ] = useUnitagUpdateMetadataMutation(unitag?.username ?? address) // Save button can't be pressed until unitag is loaded anyways so this is fine
  const profileMetadataEdited = isProfileMetadataEdited(
    updateResponseLoading,
    updatedMetadata,
    updateResponse?.metadata ?? unitag?.metadata
  )

  useEffect(() => {
    // Only want to set values on first time unitag loads, when we have not yet made the PUT request
    if (!updateRequestMade && unitag?.metadata) {
      setImageUri(unitag.metadata.avatar)
      setBioInput(unitag.metadata.description)
      setUrlInput(unitag.metadata.url)
      setTwitterInput(unitag.metadata.twitter)
    }
  }, [updateRequestMade, unitag?.metadata])

  const openModal = (): void => {
    setShowModal(true)
  }

  const onCloseModal = (): void => {
    setShowModal(false)
  }

  const onPressSaveChanges = async (): Promise<void> => {
    await updateUnitagMetadata({
      address,
      metadata: updatedMetadata,
    })
  }

  return (
    <Screen edges={['right', 'left']}>
      <Flex
        grow
        $short={{ gap: '$none' }}
        gap="$spacing16"
        pb="$spacing16"
        px="$spacing16"
        style={{ marginTop: insets.top, marginBottom: insets.bottom }}
        onPress={Keyboard.dismiss}>
        <ScreenRow
          headingText={t('Edit profile')}
          tooltipButton={<Flex width={iconSizes.icon16} />} //  Need this to center Edit profile text
        />
        <Flex fill justifyContent="space-between">
          <Flex gap="$spacing24" justifyContent="flex-start" py="$spacing24">
            <Flex pb="$spacing48">
              <Flex
                backgroundColor="$accentSoft"
                borderRadius="$rounded20"
                height={imageSizes.image100}
              />
              <Flex bottom={0} mx="$spacing16" position="absolute" width={imageSizes.image100}>
                <Flex onPress={openModal}>
                  <UnitagProfilePicture
                    address={address}
                    profilePictureUri={imageUri}
                    size={imageSizes.image100}
                  />
                </Flex>
                <Flex
                  backgroundColor="$neutral1"
                  borderRadius="$roundedFull"
                  bottom={0}
                  p="$spacing8"
                  position="absolute"
                  right={0}
                  onPress={openModal}>
                  <Icons.Edit color="$surface1" size={iconSizes.icon16} />
                </Flex>
              </Flex>
            </Flex>

            <Flex gap="$spacing4" px="$spacing16">
              <Text color="$neutral1" variant="heading2">
                {unitag?.username}
                {UNITAG_SUFFIX}
              </Text>
              <Text color="$neutral2" variant="subheading2">
                {shortenAddress(address)}
              </Text>
            </Flex>
            <Flex gap="$spacing24" px="$spacing16">
              <Flex row alignItems="flex-start" justifyContent="flex-start">
                <Text color="$neutral2" flex={1} pt="$spacing4" variant="subheading1">
                  {t('Bio')}
                </Text>
                <TextInput
                  autoCorrect
                  blurOnSubmit
                  multiline
                  flex={2}
                  fontFamily="$body"
                  fontSize="$small"
                  numberOfLines={6}
                  p="$none"
                  placeholder={t('Type a bio for your profile')}
                  placeholderTextColor="$neutral3"
                  returnKeyType="done"
                  textAlign="left"
                  value={bioInput}
                  onChangeText={setBioInput}
                />
              </Flex>
              <Flex row alignItems="flex-start" justifyContent="flex-start">
                <Text color="$neutral2" flex={1} pt="$spacing4" variant="subheading1">
                  {t('Website')}
                </Text>
                <TextInput
                  autoCorrect
                  blurOnSubmit
                  multiline
                  flex={2}
                  fontFamily="$body"
                  fontSize="$small"
                  numberOfLines={6}
                  p="$none"
                  placeholder={t('Type your website url here')}
                  placeholderTextColor="$neutral3"
                  returnKeyType="done"
                  textAlign="left"
                  value={urlInput}
                  onChangeText={setUrlInput}
                />
              </Flex>
              <Flex row alignItems="flex-end" justifyContent="flex-start">
                <Text color="$neutral2" flex={1} variant="subheading1">
                  {t('Twitter')}
                </Text>
                <TextInput
                  autoCorrect
                  blurOnSubmit
                  flex={2}
                  fontFamily="$body"
                  fontSize="$small"
                  p="$none"
                  placeholder={t('Type your handle here')}
                  placeholderTextColor="$neutral3"
                  returnKeyType="done"
                  textAlign="left"
                  value={twitterInput}
                  onChangeText={setTwitterInput}
                />
              </Flex>
              {ensName && (
                <Flex row justifyContent="flex-start">
                  <Text color="$neutral2" flex={1} variant="subheading1">
                    {t('ENS')}
                  </Text>
                  <Text color="$neutral2" flex={2} variant="body2">
                    {ensName}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
          <Button
            disabled={!profileMetadataEdited}
            size="medium"
            theme="primary"
            onPress={onPressSaveChanges}>
            {t('Save changes')}
          </Button>
        </Flex>
      </Flex>
      {showModal && (
        <ChoosePhotoOptionsModal
          address={address}
          setPhotoUri={setImageUri}
          showRemoveOption={!!imageUri}
          onClose={onCloseModal}
        />
      )}
    </Screen>
  )
}
