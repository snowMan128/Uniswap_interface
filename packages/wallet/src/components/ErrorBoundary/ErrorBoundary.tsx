import React, { ErrorInfo, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet } from 'react-native'
import { Button, Flex, Text } from 'ui/src'
import { DEAD_LUNI } from 'ui/src/assets'
import { logger } from 'utilities/src/logger/logger'
import { restartApp } from 'wallet/src/components/ErrorBoundary/restart'
import { useAccounts } from 'wallet/src/features/wallet/hooks'
import { setFinishedOnboarding } from 'wallet/src/features/wallet/slice'
import { useAppDispatch } from 'wallet/src/state'

interface ErrorBoundaryState {
  error: Error | null
}

// Uncaught errors during renders of subclasses will be caught here
// Errors in handlers (e.g. press handler) will not reach here
export class ErrorBoundary extends React.Component<PropsWithChildren<unknown>, ErrorBoundaryState> {
  constructor(props: PropsWithChildren<unknown>) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error & { cause?: Error }, errorInfo: ErrorInfo): void {
    // Based on https://github.com/getsentry/sentry-javascript/blob/develop/packages/react/src/errorboundary.tsx
    const errorBoundaryError = new Error(error.message)
    errorBoundaryError.name = `React ErrorBoundary ${errorBoundaryError.name}`
    errorBoundaryError.stack = errorInfo.componentStack
    error.cause = errorBoundaryError

    logger.error(error, {
      level: 'fatal',
      tags: {
        file: 'ErrorBoundary',
        function: 'componentDidCatch',
      },
    })
  }

  render(): React.ReactNode {
    const { error } = this.state
    if (error !== null) {
      return <ErrorScreen error={error} />
    }

    return this.props.children
  }
}

const LUNI_SIZE = 150

function ErrorScreen({ error }: { error: Error }): JSX.Element {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const accounts = useAccounts()

  // If there is no active account, we need to reset the onboarding flow
  if (error.message === 'No active account' && Object.values(accounts).length === 0) {
    dispatch(setFinishedOnboarding({ finishedOnboarding: false }))
  }

  return (
    <Flex
      centered
      fill
      backgroundColor="$surface1"
      gap="$spacing16"
      px="$spacing16"
      py="$spacing48">
      <Flex centered grow gap="$spacing36">
        <Image resizeMode="contain" source={DEAD_LUNI} style={styles.errorImage} />
        <Flex centered gap="$spacing8">
          <Text variant="subheading1">{t('errors.crash.title')}</Text>
          <Text variant="body2">{t('errors.crash.message')}</Text>
        </Flex>
        {error.message && __DEV__ && <Text variant="body2">{error.message}</Text>}
      </Flex>
      <Flex alignSelf="stretch">
        <Button onPress={restartApp}>{t('errors.crash.restart')}</Button>
      </Flex>
    </Flex>
  )
}

const styles = StyleSheet.create({
  errorImage: {
    height: LUNI_SIZE,
    width: LUNI_SIZE,
  },
})
