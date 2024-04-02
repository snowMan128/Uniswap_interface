export enum Expiry {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
}

export interface LimitState {
  readonly inputAmount: string
  readonly outputAmount: string
  readonly expiry: Expiry
  readonly limitPrice: string
  readonly limitPriceInverted: boolean

  // The form should autofill in the market price between two currencies unless the user has
  // already manually edited the price for that currency pair
  readonly limitPriceEdited: boolean

  // The limit form has 3 fields, but only two of them can be independent at a time.
  // Always prefer `marketPrice` be independent, so either derive the input amount or the output amount
  readonly isInputAmountFixed: boolean
}
