import {
  Currency,
  CurrencyAmount,
  Price,
  Token,
  TradeType,
  ChainId,
} from "udonswap-core";
// import { ChainId } from "udonswap-smart-order-router-v3"
import { useWeb3React } from "@web3-react/core";
import tryParseCurrencyAmount from "lib/utils/tryParseCurrencyAmount";
import { useMemo, useRef } from "react";
import {
  ClassicTrade,
  INTERNAL_ROUTER_PREFERENCE_PRICE,
} from "state/routing/types";
import { useRoutingAPITrade } from "state/routing/useRoutingAPITrade";

import { SupportedInterfaceChain, asSupportedChain } from "constants/chains";
import {
  // DAI_OPTIMISM,
  // USDB_BLAST,
  // USDC_ARBITRUM,
  // USDC_ARBITRUM_GOERLI,
  // USDC_AVALANCHE,
  // USDC_BASE,
  // USDC_GOERLI,
  // USDC_MAINNET,
  // USDC_OPTIMISM_GOERLI,
  // USDC_POLYGON,
  // USDC_POLYGON_MUMBAI,
  // USDC_SEPOLIA,
  // USDT_BSC,
  USDC_MODE
} from "../constants/tokens";

// Stablecoin amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
export const STABLECOIN_AMOUNT_OUT: {
  [key in SupportedInterfaceChain]: CurrencyAmount<Token>;
} = {
  // [ChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC_MAINNET, 100_000e6),
  [ChainId.MODE]: CurrencyAmount.fromRawAmount(USDC_MODE, 100_000e6),
  // [ChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10_000e6),
  // [ChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10_000e18),
  // [ChainId.POLYGON]: CurrencyAmount.fromRawAmount(USDC_POLYGON, 10_000e6),
  // [ChainId.BNB]: CurrencyAmount.fromRawAmount(USDT_BSC, 100e18),
  // [ChainId.AVALANCHE]: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, 10_000e6),
  // [ChainId.BASE]: CurrencyAmount.fromRawAmount(USDC_BASE, 10_000e6),
  // [ChainId.GOERLI]: CurrencyAmount.fromRawAmount(USDC_GOERLI, 10_000e6),
  // [ChainId.SEPOLIA]: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, 10_000e6),
  // [ChainId.OPTIMISM_GOERLI]: CurrencyAmount.fromRawAmount(
  //   USDC_OPTIMISM_GOERLI,
  //   10_000e6,
  // ),
  // [ChainId.ARBITRUM_GOERLI]: CurrencyAmount.fromRawAmount(
  //   USDC_ARBITRUM_GOERLI,
  //   10_000e6,
  // ),
  // [ChainId.POLYGON_MUMBAI]: CurrencyAmount.fromRawAmount(
  //   USDC_POLYGON_MUMBAI,
  //   10_000e6,
  // ),
  // [ChainId.BLAST]: CurrencyAmount.fromRawAmount(USDB_BLAST, 10_000e18),
};

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useStablecoinPrice(
  currency?: Currency,
): Price<Currency, Token> | undefined {
  const chainId = asSupportedChain(currency?.chainId);
  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined;
  const stablecoin = amountOut?.currency;

  const { trade } = useRoutingAPITrade(
    false /* skip */,
    TradeType.EXACT_OUTPUT,
    amountOut,
    currency,
    INTERNAL_ROUTER_PREFERENCE_PRICE,
  );
  const price = useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined;
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, "1", "1");
    }

    // if initial quoting fails, we may end up with a DutchOrderTrade
    if (trade && trade instanceof ClassicTrade) {
      const { numerator, denominator } = trade.routes[0].midPrice;
      return new Price(currency, stablecoin, denominator, numerator);
    }

    return undefined;
  }, [currency, stablecoin, trade]);

  const lastPrice = useRef(price);
  if (
    !price ||
    !lastPrice.current ||
    !price.equalTo(lastPrice.current) ||
    !price.baseCurrency.equals(lastPrice.current.baseCurrency)
  ) {
    lastPrice.current = price;
  }
  return lastPrice.current;
}

export function useStablecoinValue(
  currencyAmount: CurrencyAmount<Currency> | undefined | null,
) {
  const price = useStablecoinPrice(currencyAmount?.currency);

  return useMemo(() => {
    if (!price || !currencyAmount) return null;
    try {
      return price.quote(currencyAmount);
    } catch (error) {
      return null;
    }
  }, [currencyAmount, price]);
}

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
export function useStablecoinAmountFromFiatValue(
  fiatValue: number | null | undefined,
) {
  const { chainId } = useWeb3React();
  const supportedChainId = asSupportedChain(chainId);
  const stablecoin = supportedChainId
    ? STABLECOIN_AMOUNT_OUT[supportedChainId].currency
    : undefined;

  return useMemo(() => {
    if (
      fiatValue === null ||
      fiatValue === undefined ||
      !chainId ||
      !stablecoin
    ) {
      return undefined;
    }

    // trim for decimal precision when parsing
    const parsedForDecimals = fiatValue.toFixed(stablecoin.decimals).toString();
    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseCurrencyAmount(parsedForDecimals, stablecoin);
    } catch (error) {
      return undefined;
    }
  }, [chainId, fiatValue, stablecoin]);
}