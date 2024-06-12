import { NativeCurrency, Token, ChainId } from "udonswap-core";
// import { ChainId } from "udonswap-smart-order-router-v3"
import { nativeOnChain } from "constants/tokens";
import { useMemo } from "react";

export default function useNativeCurrency(
  chainId: ChainId | null | undefined,
): NativeCurrency | Token {
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
        nativeOnChain(ChainId.MODE),
    [chainId],
  );
}
