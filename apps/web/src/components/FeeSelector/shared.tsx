import { ChainId } from "udonswap-core";
import { FeeAmount } from "udonswap-v3";
import { Trans } from "i18n";
import type { ReactNode } from "react";
import { ALL_SUPPORTED_CHAIN_IDS } from "constants/chains";

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: readonly ChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: "0.01",
    description: <Trans>Best for very stable pairs.</Trans>,
    supportedChains: [
      // ChainId.ARBITRUM_ONE,
      ChainId.MODE,
      // ChainId.BNB,
      // ChainId.MAINNET,
      // ChainId.OPTIMISM,
      // ChainId.POLYGON,
      // ChainId.POLYGON_MUMBAI,
      // ChainId.AVALANCHE,
      // ChainId.BASE,
      // ChainId.BLAST,
    ],
  },
  [FeeAmount.LOW]: {
    label: "0.05",
    description: <Trans>Best for stable pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.MEDIUM]: {
    label: "0.3",
    description: <Trans>Best for most pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
  [FeeAmount.HIGH]: {
    label: "1",
    description: <Trans>Best for exotic pairs.</Trans>,
    supportedChains: ALL_SUPPORTED_CHAIN_IDS,
  },
};
