import { FlatList, ScrollView, View } from 'react-native'
import { SharedValue } from 'react-native-reanimated'

export type Vector = {
  x: number
  y: number
}

export type Dimensions = {
  width: number
  height: number
}

export type AutoScrollProps = {
  scrollableRef: React.RefObject<FlatList | ScrollView>
  visibleHeight: SharedValue<number>
  scrollY: SharedValue<number>
  // The parent container inside the scrollable that wraps the grid
  // (e.g. when the grid is rendered inside the FlatList header)
  // if not provided, we assume that the grid is the first child in
  // the scrollable container
  containerRef?: React.RefObject<View>
}

export type ActiveItemDecorationSettings = {
  activeItemScale: number
  activeItemOpacity: number
  activeItemShadowOpacity: number
}

export type SortableGridChangeEvent<I> = {
  data: I[]
  fromIndex: number
  toIndex: number
}

export type SortableGridDragStartEvent<I> = {
  item: I
  index: number
}

export type SortableGridDropEvent<I> = {
  item: I
  index: number
}

export type SortableGridRenderItemInfo<I> = {
  item: I
  pressProgress: SharedValue<number>
  dragActivationProgress: SharedValue<number>
}

export type SortableGridRenderItem<I> = (info: SortableGridRenderItemInfo<I>) => JSX.Element
