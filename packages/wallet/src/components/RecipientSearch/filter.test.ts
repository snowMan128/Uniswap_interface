import { faker } from '@faker-js/faker'
import {
  AutocompleteOption,
  filterRecipientByNameAndAddress,
  filterRecipientsByAddress,
  filterRecipientsByName,
} from 'wallet/src/components/RecipientSearch/filter'
import { SearchableRecipient } from 'wallet/src/features/address/types'
import { SearchableRecipients } from 'wallet/src/test/fixtures'

const options: [AutocompleteOption<SearchableRecipient>, AutocompleteOption<SearchableRecipient>] =
  [
    {
      data: SearchableRecipients[0],
      key: SearchableRecipients[0].address,
    },
    {
      data: SearchableRecipients[1],
      key: SearchableRecipients[1].address,
    },
  ]

describe(filterRecipientsByName, () => {
  it('returns empty array if searchPattern is empty', () => {
    expect(filterRecipientsByName(null, [])).toEqual([])
    expect(filterRecipientsByName('', [])).toEqual([])
  })

  it('returns all exact matches and similar recipients', () => {
    expect(filterRecipientsByName('Recipient ', options)).toEqual(options)

    // Even though there is no recipient with name "Recipient 3 name", it should
    // still return all recipients with similar names
    expect(filterRecipientsByName('Recipient 3', options)).toEqual(options)
    expect(filterRecipientsByName('Recipient 3 name', options)).toEqual(options)
  })

  it('does not return recipients with names that differ too much', () => {
    const newAddress = faker.finance.ethereumAddress()
    const newOption: AutocompleteOption<SearchableRecipient> = {
      data: {
        address: newAddress,
        name: 'Very different name',
      },
      key: newAddress,
    }
    const updatedOptions = [...options, newOption]

    // Only the new one is returned
    expect(filterRecipientsByName('Very different name', updatedOptions)).toEqual([newOption])
    // All similar names are returned (except the new one that is too different)
    expect(filterRecipientsByName('Recipient 3', updatedOptions)).toEqual(options)
  })

  it('returns the same result irrespective of the casing', () => {
    expect(filterRecipientsByName('recipient 3', options)).toEqual(options)
    expect(filterRecipientsByName('RECIPIENT 3', options)).toEqual(options)
    expect(filterRecipientsByName('recipient 3 name', options)).toEqual(options)
    expect(filterRecipientsByName('RECIPIENT 3 NAME', options)).toEqual(options)
  })
})

describe(filterRecipientsByAddress, () => {
  it('returns empty array if searchPattern is empty', () => {
    expect(filterRecipientsByAddress(null, [])).toEqual([])
    expect(filterRecipientsByAddress('', [])).toEqual([])
  })

  it('returns all exact matches without similar addresses', () => {
    expect(filterRecipientsByAddress('0x', options)).toEqual(options)

    // Returns only the first one as it has exactly the same beginning
    expect(filterRecipientsByAddress(options[0].data.address.slice(0, 3), options)).toEqual([
      options[0],
    ])
    // Returns only the second one as it has exactly the same beginning
    expect(filterRecipientsByAddress(options[1].data.address.slice(0, 3), options)).toEqual([
      options[1],
    ])
  })

  it('returns the same result irrespective of the casing', () => {
    expect(filterRecipientsByAddress(options[0].data.address.toLowerCase(), options)).toEqual([
      options[0],
    ])
    expect(filterRecipientsByAddress(options[0].data.address.toUpperCase(), options)).toEqual([
      options[0],
    ])
  })
})

describe(filterRecipientByNameAndAddress, () => {
  const option1: AutocompleteOption<SearchableRecipient> = {
    data: {
      address: '0x123',
      name: 'Recipient123',
    },
    key: '0x123',
  }
  const option2: AutocompleteOption<SearchableRecipient> = {
    data: {
      address: '0x456',
      name: 'Recipient2',
    },
    key: '0x456',
  }
  const option3: AutocompleteOption<SearchableRecipient> = {
    data: {
      address: '0x789',
      name: 'Recipient0x456123',
    },
    key: '0x789',
  }

  const newOptions = [option1, option2, option3]

  it('returns empty array if searchPattern is empty', () => {
    expect(filterRecipientByNameAndAddress(null, [])).toEqual([])
    expect(filterRecipientByNameAndAddress('', [])).toEqual([])
  })

  it('returns recipients matching by name (exact and similar) or address (exact)', () => {
    // All names are matched
    expect(filterRecipientByNameAndAddress('Recipient', newOptions)).toEqual(newOptions)
    // All options are matched by name (option1 is exact, option2 and option3 are similar)
    expect(filterRecipientByNameAndAddress('Recipient123', newOptions)).toEqual(newOptions)
    // option1 is matched by name and address, option3 is matched by name
    expect(filterRecipientByNameAndAddress('123', newOptions)).toEqual([option1, option3])
    // option2 is matched by name and address, option3 is matched by name
    expect(filterRecipientByNameAndAddress('0x456', newOptions)).toEqual([option2, option3])
    // only option3 is matched by name as address must be exact
    expect(filterRecipientByNameAndAddress('456', newOptions)).toEqual([option3])
  })
})
