import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'ui/src'
import { WarningModal } from 'wallet/src/components/modals/WarningModal/WarningModal'
import { ChainId } from 'wallet/src/constants/chains'
import { useAllTransactionsBetweenAddresses } from 'wallet/src/features/transactions/hooks/useAllTransactionsBetweenAddresses'
import { useIsSmartContractAddress } from 'wallet/src/features/transactions/transfer/hooks/useIsSmartContractAddress'
import { TransferSpeedbump } from 'wallet/src/features/transactions/transfer/types'
import { WarningSeverity } from 'wallet/src/features/transactions/WarningModal/types'
import {
  useActiveAccountAddressWithThrow,
  useDisplayName,
  useSignerAccounts,
} from 'wallet/src/features/wallet/hooks'
import { DisplayNameType } from 'wallet/src/features/wallet/types'
import { ModalName } from 'wallet/src/telemetry/constants'

interface TransferFormWarningProps {
  recipient?: string
  chainId?: ChainId
  showSpeedbumpModal: boolean
  onNext: () => void
  setTransferSpeedbump: (w: TransferSpeedbump) => void
  setShowSpeedbumpModal: (b: boolean) => void
}

export function TransferFormSpeedbumps({
  recipient,
  chainId,
  showSpeedbumpModal,
  onNext,
  setTransferSpeedbump,
  setShowSpeedbumpModal,
}: TransferFormWarningProps): JSX.Element {
  const { t } = useTranslation()

  const activeAddress = useActiveAccountAddressWithThrow()
  const previousTransactions = useAllTransactionsBetweenAddresses(activeAddress, recipient)
  const isNewRecipient = !previousTransactions || previousTransactions.length === 0
  const currentSignerAccounts = useSignerAccounts()
  const isSignerRecipient = useMemo(
    () => currentSignerAccounts.some((a) => a.address === recipient),
    [currentSignerAccounts, recipient]
  )

  const { isSmartContractAddress, loading: addressLoading } = useIsSmartContractAddress(
    recipient,
    chainId ?? ChainId.Mainnet
  )

  const shouldWarnSmartContract = isNewRecipient && !isSignerRecipient && isSmartContractAddress
  const shouldWarnNewAddress = isNewRecipient && !isSignerRecipient && !shouldWarnSmartContract

  useEffect(() => {
    setTransferSpeedbump({
      hasWarning: shouldWarnSmartContract || shouldWarnNewAddress,
      loading: addressLoading,
    })
  }, [setTransferSpeedbump, addressLoading, shouldWarnSmartContract, shouldWarnNewAddress])

  const onCloseWarning = (): void => {
    setShowSpeedbumpModal(false)
  }

  const displayName = useDisplayName(recipient)

  return (
    <>
      {showSpeedbumpModal && shouldWarnSmartContract && (
        <WarningModal
          caption={t(
            'You’re about to send tokens to a special type of address—a smart contract. Double-check it’s the address you intended to send to. If it’s wrong, your tokens could be lost forever.'
          )}
          closeText={t('Cancel')}
          confirmText={t('Continue')}
          modalName={ModalName.SendWarning}
          severity={WarningSeverity.None}
          title={t('Is this a wallet address?')}
          onClose={onCloseWarning}
          onConfirm={onNext}
        />
      )}
      {showSpeedbumpModal && shouldWarnNewAddress && (
        <WarningModal
          caption={t(
            'You haven’t transacted with this address before. Please confirm that the address is correct before continuing.'
          )}
          closeText={t('Cancel')}
          confirmText={t('Confirm')}
          modalName={ModalName.SendWarning}
          severity={WarningSeverity.Medium}
          title={t('New address')}
          onClose={onCloseWarning}
          onConfirm={onNext}>
          <TransferRecipient
            address={recipient}
            displayName={displayName?.name}
            type={displayName?.type}
          />
        </WarningModal>
      )}
    </>
  )
}

interface TransferRecipientProps {
  displayName?: string
  address?: string
  type?: DisplayNameType
}

const TransferRecipient = ({
  displayName,
  address,
  type = DisplayNameType.Address,
}: TransferRecipientProps): JSX.Element => {
  return (
    <Flex
      centered
      borderColor="$surface3"
      borderRadius="$rounded12"
      borderWidth={1}
      gap="$spacing8"
      px="$spacing16"
      py="$spacing12">
      <Text color="$neutral1" textAlign="center" variant="subheading2">
        {type === DisplayNameType.ENS ? displayName : address}
      </Text>
      {type === DisplayNameType.ENS && (
        <Text color="$neutral2" textAlign="center" variant="buttonLabel4">
          {address}
        </Text>
      )}
    </Flex>
  )
}
