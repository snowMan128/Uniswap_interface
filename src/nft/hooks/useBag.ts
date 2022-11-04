import { BigNumber } from '@ethersproject/bignumber'
import { BagItem, BagItemStatus, BagStatus, TokenType, UpdatedGenieAsset } from 'nft/types'
import { v4 as uuidv4 } from 'uuid'
import create from 'zustand'
import { devtools } from 'zustand/middleware'

interface BagState {
  bagStatus: BagStatus
  bagManuallyClosed: boolean
  setBagExpanded: ({ bagExpanded, manualClose }: { bagExpanded: boolean; manualClose?: boolean }) => void
  setBagStatus: (state: BagStatus) => void
  itemsInBag: BagItem[]
  setItemsInBag: (items: BagItem[]) => void
  totalEthPrice: BigNumber
  setTotalEthPrice: (totalEthPrice: BigNumber) => void
  totalUsdPrice: number | undefined
  setTotalUsdPrice: (totalUsdPrice: number | undefined) => void
  addAssetsToBag: (asset: UpdatedGenieAsset[], fromSweep?: boolean) => void
  removeAssetsFromBag: (assets: UpdatedGenieAsset[]) => void
  markAssetAsReviewed: (asset: UpdatedGenieAsset, toKeep: boolean) => void
  lockSweepItems: (contractAddress: string) => void
  didOpenUnavailableAssets: boolean
  setDidOpenUnavailableAssets: (didOpen: boolean) => void
  bagExpanded: boolean
  toggleBag: () => void
  isLocked: boolean
  setLocked: (isLocked: boolean) => void
  reset: () => void
}

export const useBag = create<BagState>()(
  devtools(
    (set, get) => ({
      bagStatus: BagStatus.ADDING_TO_BAG,
      bagExpanded: false,
      bagManuallyClosed: false,
      setBagStatus: (newBagStatus) =>
        set(() => ({
          bagStatus: newBagStatus,
        })),
      markAssetAsReviewed: (asset, toKeep) =>
        set(({ itemsInBag }) => {
          if (itemsInBag.length === 0) return { itemsInBag: [] }
          const itemsInBagCopy = [...itemsInBag]
          const index = itemsInBagCopy.findIndex((item) => item.asset.id === asset.id)
          if (!toKeep && index !== -1) itemsInBagCopy.splice(index, 1)
          else if (index !== -1) {
            itemsInBagCopy[index].status = BagItemStatus.REVIEWED
          }
          return {
            itemsInBag: itemsInBagCopy,
          }
        }),
      didOpenUnavailableAssets: false,
      setDidOpenUnavailableAssets: (didOpen) =>
        set(() => ({
          didOpenUnavailableAssets: didOpen,
        })),
      setBagExpanded: ({ bagExpanded, manualClose }) =>
        set(({ bagManuallyClosed }) => ({ bagExpanded, bagManuallyClosed: manualClose || bagManuallyClosed })),
      toggleBag: () => set(({ bagExpanded }) => ({ bagExpanded: !bagExpanded })),
      isLocked: false,
      setLocked: (_isLocked) =>
        set(() => ({
          isLocked: _isLocked,
        })),
      itemsInBag: [],
      setItemsInBag: (items) =>
        set(({ bagManuallyClosed }) => ({
          bagManuallyClosed: items.length === 0 ? false : bagManuallyClosed,
          itemsInBag: items,
        })),
      totalEthPrice: BigNumber.from(0),
      setTotalEthPrice: (totalEthPrice) =>
        set(() => ({
          totalEthPrice,
        })),
      totalUsdPrice: undefined,
      setTotalUsdPrice: (totalUsdPrice) =>
        set(() => ({
          totalUsdPrice,
        })),
      addAssetsToBag: (assets, fromSweep = false) =>
        set(({ itemsInBag }) => {
          if (get().isLocked) return { itemsInBag: get().itemsInBag }
          const items: BagItem[] = []
          const itemsInBagCopy = [...itemsInBag]
          assets.forEach((asset) => {
            let index = -1
            if (asset.tokenType !== TokenType.ERC1155) {
              index = itemsInBag.findIndex(
                (n) => n.asset.tokenId === asset.tokenId && n.asset.address === asset.address
              )
            }
            if (index !== -1) {
              itemsInBagCopy[index].inSweep = fromSweep
            } else {
              const assetWithId = {
                asset: { id: uuidv4(), ...asset },
                status: BagItemStatus.ADDED_TO_BAG,
                inSweep: fromSweep,
              }
              items.push(assetWithId)
            }
          })
          if (itemsInBag.length === 0)
            return {
              itemsInBag: items,
              bagStatus: BagStatus.ADDING_TO_BAG,
            }
          else
            return {
              itemsInBag: [...itemsInBagCopy, ...items],
              bagStatus: BagStatus.ADDING_TO_BAG,
            }
        }),
      removeAssetsFromBag: (assets) => {
        set(({ bagManuallyClosed, itemsInBag }) => {
          if (get().isLocked) return { itemsInBag: get().itemsInBag }
          if (itemsInBag.length === 0) return { itemsInBag: [] }
          const itemsCopy = itemsInBag.filter(
            (item) =>
              !assets.some((asset) =>
                asset.id
                  ? asset.id === item.asset.id
                  : asset.tokenId === item.asset.tokenId && asset.address === item.asset.address
              )
          )
          return { bagManuallyClosed: itemsCopy.length === 0 ? false : bagManuallyClosed, itemsInBag: itemsCopy }
        })
      },
      lockSweepItems: (contractAddress) =>
        set(({ itemsInBag }) => {
          if (get().isLocked) return { itemsInBag: get().itemsInBag }
          const itemsInBagCopy = itemsInBag.map((item) =>
            item.asset.address === contractAddress && item.inSweep ? { ...item, inSweep: false } : item
          )
          if (itemsInBag.length === 0)
            return {
              itemsInBag,
            }
          else
            return {
              itemsInBag: [...itemsInBagCopy],
            }
        }),
      reset: () =>
        set(() => {
          if (!get().isLocked)
            return {
              bagStatus: BagStatus.ADDING_TO_BAG,
              itemsInBag: [],
              didOpenUnavailableAssets: false,
              isLocked: false,
              bagManuallyClosed: false,
            }
          else return {}
        }),
    }),
    { name: 'useBag' }
  )
)
