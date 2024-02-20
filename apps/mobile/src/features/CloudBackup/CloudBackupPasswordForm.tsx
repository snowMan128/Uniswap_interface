import React, { useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Keyboard, TextInput } from 'react-native'
import { PasswordInput } from 'src/components/input/PasswordInput'
import { PasswordError } from 'src/features/onboarding/PasswordError'
import { Button, Flex, Icons, Text } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { useDebounce } from 'utilities/src/time/timing'
import { ElementName } from 'wallet/src/telemetry/constants'
import {
  PASSWORD_VALIDATION_DEBOUNCE_MS,
  PasswordStrength,
  getPasswordStrength,
  getPasswordStrengthTextAndColor,
  isPasswordStrongEnough,
} from 'wallet/src/utils/password'

export enum PasswordErrors {
  WeakPassword = 'WeakPassword',
  PasswordsDoNotMatch = 'PasswordsDoNotMatch',
}

export type CloudBackupPasswordProps = {
  navigateToNextScreen: ({ password }: { password: string }) => void
  isConfirmation?: boolean
  passwordToConfirm?: string
}

export function CloudBackupPasswordForm({
  navigateToNextScreen,
  isConfirmation,
  passwordToConfirm,
}: CloudBackupPasswordProps): JSX.Element {
  const { t } = useTranslation()

  const passwordInputRef = useRef<TextInput>(null)
  const [password, setPassword] = useState('')

  const [error, setError] = useState<PasswordErrors | undefined>(undefined)

  const [passwordStrength, setPasswordStrength] = useState(PasswordStrength.NONE)
  const debouncedPasswordStrength = useDebounce(passwordStrength, PASSWORD_VALIDATION_DEBOUNCE_MS)
  const isStrongPassword = isPasswordStrongEnough({
    minStrength: PasswordStrength.MEDIUM,
    currentStrength: passwordStrength,
  })

  const isButtonDisabled =
    !!error || password.length === 0 || (!isConfirmation && !isStrongPassword)

  const onPasswordChangeText = (newPassword: string): void => {
    if (isConfirmation && newPassword === password) {
      setError(undefined)
    }
    // always reset error if not confirmation
    if (!isConfirmation) {
      setPasswordStrength(getPasswordStrength(newPassword))
      setError(undefined)
    }
    setPassword(newPassword)
  }

  const onPasswordSubmitEditing = (): void => {
    if (!isConfirmation && !isStrongPassword) {
      setError(PasswordErrors.WeakPassword)
      return
    }
    if (isConfirmation && passwordToConfirm !== password) {
      setError(PasswordErrors.PasswordsDoNotMatch)
      return
    }
    setError(undefined)
    Keyboard.dismiss()
  }

  const onPressNext = (): void => {
    if (!isConfirmation && !isStrongPassword) {
      setError(PasswordErrors.WeakPassword)
      return
    }
    if (isConfirmation && passwordToConfirm !== password) {
      setError(PasswordErrors.PasswordsDoNotMatch)
      return
    }

    if (!error) {
      navigateToNextScreen({ password })
    }
  }

  let errorText = ''
  if (error === PasswordErrors.WeakPassword) {
    errorText = t('Weak password')
  } else if (error === PasswordErrors.PasswordsDoNotMatch) {
    errorText = t('Passwords do not match')
  } else if (error) {
    // use the upstream zxcvbn error message
    errorText = error
  }

  return (
    <>
      <Flex gap="$spacing24" mb="$spacing24" mx="$spacing8">
        <Flex gap="$spacing8">
          <PasswordInput
            ref={passwordInputRef}
            placeholder={isConfirmation ? t('Confirm password') : t('Create password')}
            returnKeyType="next"
            value={password}
            onChangeText={(newText: string): void => {
              setError(undefined)
              onPasswordChangeText(newText)
            }}
            onSubmitEditing={onPasswordSubmitEditing}
          />
          {!isConfirmation && <PasswordStrengthText strength={debouncedPasswordStrength} />}
          {error ? <PasswordError errorText={errorText} /> : null}
        </Flex>
        {!isConfirmation && (
          <Flex centered row gap="$spacing12" px="$spacing16">
            <Icons.DiamondExclamation color="$neutral2" size={iconSizes.icon20} />
            <Text color="$neutral2" variant="body3">
              {t(
                'Uniswap Labs does not store your password and can’t recover it, so it’s crucial you remember it.'
              )}
            </Text>
          </Flex>
        )}
      </Flex>
      <Button disabled={isButtonDisabled} testID={ElementName.Next} onPress={onPressNext}>
        {t('Continue')}
      </Button>
    </>
  )
}

function PasswordStrengthText({ strength }: { strength: PasswordStrength }): JSX.Element {
  const { text, color } = getPasswordStrengthTextAndColor(strength)

  const hasPassword = strength !== PasswordStrength.NONE

  return (
    <Flex centered row opacity={hasPassword ? 1 : 0} pt="$spacing12" px="$spacing8">
      <Text color={color} variant="body3">
        <Trans>This is a {text.toLowerCase()} password</Trans>
      </Text>
    </Flex>
  )
}
