import { pick } from 'lodash'
import { ComponentProps } from 'react'
import { Flex, Sheet, useSporeColors } from 'ui/src'
import { Trace } from 'utilities/src/telemetry/trace/Trace'
import { TextInput } from 'wallet/src/components/input/TextInput'
import { BottomSheetContextProvider } from 'wallet/src/components/modals/BottomSheetContext'
import { BottomSheetModalProps } from 'wallet/src/components/modals/BottomSheetModalProps'

export type WebBottomSheetProps = Pick<
  BottomSheetModalProps,
  | 'children'
  | 'name'
  | 'onClose'
  | 'fullScreen'
  | 'backgroundColor'
  | 'isDismissible'
  | 'isModalOpen'
  | 'isCentered'
>

export function BottomSheetModal(props: BottomSheetModalProps): JSX.Element {
  const supportedProps = pick(props, [
    'name',
    'onClose',
    'fullScreen',
    'backgroundColor',
    'children',
    'isDismissible',
    'isModalOpen',
    'isCentered',
  ])

  return <WebBottomSheetModal {...supportedProps} />
}

// No detached mode necessary yet in web
export function BottomSheetDetachedModal(props: BottomSheetModalProps): JSX.Element {
  const supportedProps = pick(props, [
    'name',
    'onClose',
    'fullScreen',
    'backgroundColor',
    'isModalOpen',
    'children',
    'isDismissible',
    'isCentered',
  ])

  return <WebBottomSheetModal {...supportedProps} />
}

function WebBottomSheetModal({
  children,
  name,
  onClose,
  fullScreen,
  backgroundColor,
  isDismissible = true,
  isModalOpen = true,
  isCentered = true,
}: WebBottomSheetProps): JSX.Element {
  const colors = useSporeColors()

  return (
    <Trace logImpression={isModalOpen} modal={name}>
      <BottomSheetContextProvider isSheetReady={true}>
        <Sheet
          disableDrag
          modal
          animation="200ms"
          dismissOnOverlayPress={false}
          dismissOnSnapToBottom={false}
          open={isModalOpen}
          snapPoints={fullScreen || isCentered ? [100] : undefined}
          onOpenChange={(open: boolean): void => {
            !open && onClose?.()
          }}>
          <Sheet.Overlay
            animation="lazy"
            backgroundColor="$black"
            height="100%"
            opacity={0.6}
            onPress={(): void => {
              isDismissible && onClose?.()
            }}
          />
          <Sheet.Frame
            backgroundColor="$transparent"
            flex={1}
            height={fullScreen || isCentered ? '100%' : undefined}
            justifyContent={isCentered ? 'center' : 'flex-end'}
            padding="$spacing12">
            <Flex
              borderRadius="$rounded24"
              p="$spacing12"
              style={{ backgroundColor: backgroundColor ?? colors.surface1.val }}
              width="100%">
              {children}
            </Flex>
          </Sheet.Frame>
        </Sheet>
      </BottomSheetContextProvider>
    </Trace>
  )
}

export function BottomSheetTextInput(props: ComponentProps<typeof TextInput>): JSX.Element {
  return <TextInput {...props} />
}
