import { SharedState } from 'wallet/src/state/reducer'

export const selectHasViewedReviewScreen = (state: SharedState): boolean =>
  state.behaviorHistory.hasViewedReviewScreen

export const selectHasSubmittedHoldToSwap = (state: SharedState): boolean =>
  state.behaviorHistory.hasSubmittedHoldToSwap

export const selectHasSkippedUnitagPrompt = (state: SharedState): boolean =>
  state.behaviorHistory.hasSkippedUnitagPrompt
