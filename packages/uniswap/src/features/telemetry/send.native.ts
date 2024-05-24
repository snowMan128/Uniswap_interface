// eslint-disable-next-line no-restricted-imports
import appsFlyer from 'react-native-appsflyer'
import {
  AppsFlyerEventProperties,
  UniverseEventProperties,
} from 'uniswap/src/features/telemetry/types'
import { analytics } from 'utilities/src/telemetry/analytics/analytics'

export function sendAnalyticsEvent<EventName extends keyof UniverseEventProperties>(
  ...args: undefined extends UniverseEventProperties[EventName]
    ? [EventName] | [EventName, UniverseEventProperties[EventName]]
    : [EventName, UniverseEventProperties[EventName]]
): void {
  const [eventName, eventProperties] = args
  analytics.sendEvent(eventName, eventProperties as Record<string, unknown>)
}

export async function sendAppsFlyerEvent<EventName extends keyof AppsFlyerEventProperties>(
  ...args: undefined extends AppsFlyerEventProperties[EventName]
    ? [EventName] | [EventName, AppsFlyerEventProperties[EventName]]
    : [EventName, AppsFlyerEventProperties[EventName]]
): Promise<void> {
  const [eventName, eventProperties] = args
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug('sendWalletAppsFlyerEvent', eventName, eventProperties)
  } else {
    await appsFlyer.logEvent(eventName, eventProperties ?? {})
  }
}
