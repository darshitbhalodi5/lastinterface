import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from 'udonswap-v3'
// import { SupportedChainId } from 'constants/chains'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'

type AddressMap = { [chainId: number]: string }



/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
    ...constructSameAddressMap(V3_FACTORY_ADDRESS),
}

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
    ...constructSameAddressMap('0x2a8cC9911201FD188fDD641df81044C9a6F76B01'),
}

export const MULTICALL_ADDRESS: AddressMap = {
    ...constructSameAddressMap('0xcd9845c3233Dbd3274Be6054f21CE26C79e5a65E'),
}

/**
 * The oldest V0 governance address
 */
export const GOVERNANCE_ALPHA_V0_ADDRESSES: AddressMap = {}
/**
 * The older V1 governance address
 */
export const GOVERNANCE_ALPHA_V1_ADDRESSES: AddressMap = {}
/**
 * The latest governor bravo that is currently admin of timelock
 */
export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {}

// export const TIMELOCK_ADDRESS: AddressMap = {}

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {}

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {}

export const QUOTER_ADDRESSES: AddressMap = {
    ...constructSameAddressMap('0xF300FEbb15a67D776CD2eC706b61C883e067763b'),
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
    ...constructSameAddressMap('0xEF3e32154B5Fb96D56D339e655A5edf5f5661Af8'),
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {}

// export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {}

export const TICK_LENS_ADDRESSES: AddressMap = {
    ...constructSameAddressMap('0xE5a7A29FF8D7F6EEc07377b791F4F9db7f3FFDBC'),
}
