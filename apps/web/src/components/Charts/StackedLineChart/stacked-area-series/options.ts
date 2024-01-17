/**
 * Copied and modified from: https://github.com/tradingview/lightweight-charts/blob/f13a3c1f3fefcace9d4da5b97c1638009298b3c8/plugin-examples/src/plugins/stacked-area-series
 * Modifications are called out with comments.
 */

import { customSeriesDefaultOptions, CustomSeriesOptions, Logical } from 'lightweight-charts'

export interface StackedAreaSeriesOptions extends CustomSeriesOptions {
  colors: readonly string[]
  lineWidth: number
  // Modification: tracks the hovered data point, used for rendering crosshair
  hoveredLogicalIndex?: Logical
}

export const defaultOptions: StackedAreaSeriesOptions = {
  ...customSeriesDefaultOptions,
  colors: [],
  lineWidth: 2,
} as const
