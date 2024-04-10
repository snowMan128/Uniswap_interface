import { createMigrate } from 'redux-persist'
import { RouterPreference } from 'state/routing/types'
import { SlippageTolerance } from 'state/user/types'

import { migration6 } from 'state/migrations/6'
import { migration7 } from 'state/migrations/7'
import { PersistAppStateV8, migration8 } from 'state/migrations/8'
import { migration1 } from './1'
import { migration2 } from './2'
import { migration3 } from './3'
import { migration4 } from './4'
import { migration5 } from './5'

const previousState: PersistAppStateV8 = {
  user: {
    userRouterPreference: RouterPreference.API,
    userLocale: null,
    userHideClosedPositions: false,
    userSlippageTolerance: SlippageTolerance.Auto,
    userSlippageToleranceHasBeenMigratedToAuto: true,
    userDeadline: 1800,
    tokens: {},
    pairs: {},
    timestamp: Date.now(),
    hideAppPromoBanner: true,
  },
  _persist: {
    version: 7,
    rehydrated: true,
  },
}

describe('migration to v8', () => {
  it('should delete hideAppPromoBanner from redux state', async () => {
    const migrator = createMigrate(
      {
        1: migration1,
        2: migration2,
        3: migration3,
        4: migration4,
        5: migration5,
        6: migration6,
        7: migration7,
        8: migration8,
      },
      { debug: false }
    )
    const result: any = await migrator(previousState, 8)
    expect(result?.user?.hideAppPromoBanner).toBeUndefined()
    expect(result?._persist.version).toEqual(8)
  })

  it('should not migrate user if user does not exist', async () => {
    const migrator = createMigrate(
      {
        1: migration1,
        2: migration2,
        3: migration3,
        4: migration4,
        5: migration5,
        6: migration6,
        7: migration7,
        8: migration8,
      },
      { debug: false }
    )
    const result: any = await migrator(
      {
        ...previousState,
        user: undefined,
      } as PersistAppStateV8,
      8
    )
    expect(result?.user).toBeUndefined()
    expect(result?._persist.version).toEqual(8)
  })
})
