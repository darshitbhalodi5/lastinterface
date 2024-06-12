import { Protocol } from "udonswap-router";
import { Currency, Percent, TradeType } from "udonswap-core";
// import { Pair } from "udonswap-v2-sdk";
import { FeeAmount } from "udonswap-v3";
import { ClassicTrade } from "state/routing/types";

export interface RoutingDiagramEntry {
  percent: Percent;
  path: [Currency, Currency, FeeAmount][];
  protocol: Protocol;
}

const V2_DEFAULT_FEE_TIER = 3000;

/**
 * Loops through all routes on a trade and returns an array of diagram entries.
 */
export default function getRoutingDiagramEntries(
  trade: ClassicTrade,
): RoutingDiagramEntry[] {
  return trade.swaps.map(
    ({
      route: { path: tokenPath, pools, protocol },
      inputAmount,
      outputAmount,
    }) => {
      const portion =
        trade.tradeType === TradeType.EXACT_INPUT
          ? inputAmount.divide(trade.inputAmount)
          : outputAmount.divide(trade.outputAmount);
      const percent = new Percent(portion.numerator, portion.denominator);
      const path: RoutingDiagramEntry["path"] = [];
      for (let i = 0; i < pools.length; i++) {
        const nextPool = pools[i];
        const tokenIn = tokenPath[i];
        const tokenOut = tokenPath[i + 1];
        const entry: RoutingDiagramEntry["path"][0] = [
          tokenIn,
          tokenOut,
          nextPool.fee // nextPool instanceof Pair ? V2_DEFAULT_FEE_TIER : nextPool.fee,
        ];
        path.push(entry);
      }
      return {
        percent,
        path,
        protocol,
      };
    },
  );
}
