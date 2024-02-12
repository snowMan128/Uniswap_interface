import React, { useCallback, useRef } from 'react'
import WebView from 'react-native-webview'
import { AppStackScreenProp, SettingsStackScreenProp } from 'src/app/navigation/types'
import { BackHeader } from 'src/components/layout/BackHeader'
import { Screen } from 'src/components/layout/Screen'
import { Screens } from 'src/screens/Screens'
import { Separator, Text } from 'ui/src'
import { uniswapUrls } from 'wallet/src/constants/urls'
import { useActiveAccountAddress } from 'wallet/src/features/wallet/hooks'

export function WebViewScreen({
  route,
}: SettingsStackScreenProp<Screens.WebView> | AppStackScreenProp<Screens.WebView>): JSX.Element {
  const { headerTitle, uriLink } = route.params

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <BackHeader alignment="center" mb="$spacing16" pt="$spacing4" px="$spacing12">
        <Text variant="body1">{headerTitle}</Text>
      </BackHeader>

      <Separator />

      {uriLink === uniswapUrls.helpUrl ? (
        <ZendeskWebView uriLink={uriLink} />
      ) : (
        <WebView source={{ uri: uriLink }} />
      )}
    </Screen>
  )
}

function ZendeskWebView({ uriLink }: { uriLink: string }): JSX.Element {
  const webviewRef = useRef<WebView>(null)

  const zendeskInjectJs = usePrefillAddressInZendeskTicketJs()

  const onNavigationStateChange = useCallback(
    ({ url }: { url: string }): void => {
      // Ok to ignore because `uniswapUrls.helpUrl` is hardcoded into our code.
      // eslint-disable-next-line security/detect-non-literal-regexp
      if (zendeskInjectJs && new RegExp(`${uniswapUrls.helpUrl}.+/requests/new`).test(url)) {
        webviewRef.current?.injectJavaScript(zendeskInjectJs)
      }
    },
    [zendeskInjectJs]
  )

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: uriLink }}
      onNavigationStateChange={onNavigationStateChange}
    />
  )
}

const WALLET_ADDRESS_QUERY_SELECTOR = '#request_custom_fields_11041337007757'

function usePrefillAddressInZendeskTicketJs(): string | null {
  const address = useActiveAccountAddress()

  if (!address) {
    return null
  }

  return `(function() {
    var input = document.querySelector('${WALLET_ADDRESS_QUERY_SELECTOR}');
    if (!input) { return; }
    input.value = "${address}";
  })();`
}
