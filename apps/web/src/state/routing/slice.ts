import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Protocol } from "udonswap-router";
import { sendAnalyticsEvent } from "analytics";
// import { isUniswapXSupportedChain } from "constants/chains";
import ms from "ms";
import { logSwapQuoteRequest } from "tracing/swapFlowLoggers";
import { trace } from "tracing/trace";
// import axios from 'axios';

import {
  GetQuoteArgs,
  INTERNAL_ROUTER_PREFERENCE_PRICE,
  QuoteIntent,
  QuoteMethod,
  QuoteState,
  RouterPreference,
  RoutingConfig,
  TradeResult,
  URAQuoteResponse,
  URAQuoteType,
} from "./types";
import { isExactInput, transformQuoteToTrade } from "./utils";

const UNISWAP_GATEWAY_DNS_URL = process.env.REACT_APP_UNISWAP_BASE_API_URL;
if (UNISWAP_GATEWAY_DNS_URL === undefined) {
  throw new Error(
    `UNISWAP_GATEWAY_DNS_URL must be defined environment variables`,
  );
}

const CLIENT_PARAMS = {
  protocols: [Protocol.V3],
};

const protocols: Protocol[] = [Protocol.V3];

// routing API quote query params: https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/schema/quote-schema.ts
const DEFAULT_QUERY_PARAMS = {
  protocols,
  // this should be removed once BE fixes issue where enableUniversalRouter is required for fees to work
  enableUniversalRouter: true,
};

function getRoutingAPIConfig(args: GetQuoteArgs): RoutingConfig {
  const {
    account,
    tokenInChainId,
    uniswapXForceSyntheticQuotes,
    routerPreference,
  } = args;

  const uniswapx = {
    useSyntheticQuotes: uniswapXForceSyntheticQuotes,
    // Protocol supports swap+send to different destination address, but
    // for now recipient === swapper
    recipient: account,
    swapper: account,
    routingType: URAQuoteType.DUTCH_LIMIT,
  };

  const classic = {
    ...DEFAULT_QUERY_PARAMS,
    routingType: URAQuoteType.CLASSIC,
    recipient: account,
    enableFeeOnTransferFeeFetching: true,
  };

  if (
    // If the user has opted out of UniswapX during the opt-out transition period, we should respect that preference and only request classic quotes.
    routerPreference === RouterPreference.API ||
    routerPreference === INTERNAL_ROUTER_PREFERENCE_PRICE ||
    true // !isUniswapXSupportedChain(tokenInChainId)
  ) {
    return [classic];
  }

  // return [uniswapx, classic];
}

export const routingApi = createApi({
  reducerPath: "routingApi",
  baseQuery: fetchBaseQuery(),
  endpoints: (build) => ({
    getQuote: build.query<TradeResult, GetQuoteArgs>({
      queryFn(args, _api, _extraOptions, fetch) {
        return trace(
          { name: "Quote", op: "quote", data: { ...args } },
          async (trace) => {
            logSwapQuoteRequest(
              args.tokenInChainId,
              args.routerPreference,
              false,
            );
            const {
              tokenInAddress: tokenIn,
              tokenInChainId,
              tokenOutAddress: tokenOut,
              tokenOutChainId,
              amount,
              tradeType,
              sendPortionEnabled,
            } = args;

            const requestBody = {
              tokenInAddress: tokenIn,
              tokenInChainId,
              tokenOutAddress: tokenOut,
              tokenOutChainId,
              amount,
              sendPortionEnabled,
              type: isExactInput(tradeType) ? "exactIn" : "exactOut",
              intent:
                args.routerPreference === INTERNAL_ROUTER_PREFERENCE_PRICE
                  ? QuoteIntent.Pricing
                  : QuoteIntent.Quote,
              configs: JSON.stringify(getRoutingAPIConfig(args)), // Ensure configs are converted to a string
            };
            console.log("before tryyyy.....")

            try {
              return trace.child(
                { name: "Quote on server", op: "quote.server" },
                async () => {
                  // Function to convert object to query string
                  function toQueryString(params: any) {
                    return Object.keys(params)
                      .map(
                        (key) =>
                          encodeURIComponent(key) +
                          "=" +
                          encodeURIComponent(params[key]),
                      )
                      .join("&");
                  }

                  // Convert requestBody to query string
                  const queryString = toQueryString(requestBody);

                  // Append query string to URL
                  const url = `https://0p1ecyveab.execute-api.us-east-1.amazonaws.com/prod/quote?${queryString}`;
                  console.log("url...", url);
                  const response = await fetch({
                    url: url,
                    method: "GET",
                    headers: {
                      // "x-request-source": "uniswap-web",
                      "Content-Type": "application/json",
                    },
                  });

                  console.log("response.................", response);
                  if (response.error) {
                    try {
                      // cast as any here because we do a runtime check on it being an object before indexing into .errorCode
                      const errorData = response.error.data as {
                        errorCode?: string;
                        detail?: string;
                      };
                      // NO_ROUTE should be treated as a valid response to prevent retries.
                      if (
                        typeof errorData === "object" &&
                        (errorData?.errorCode === "NO_ROUTE" ||
                          errorData?.detail === "No quotes available")
                      ) {
                        sendAnalyticsEvent(
                          "No quote received from routing API",
                          {
                            requestBody,
                            response,
                            routerPreference: args.routerPreference,
                          },
                        );
                        return {
                          data: {
                            state: QuoteState.NOT_FOUND,
                            latencyMs: trace.now(),
                          },
                        };
                      }
                    } catch {
                      throw response.error;
                    }
                  }

                  const uraQuoteResponse = response.data as URAQuoteResponse;

                  const tradeResult = await transformQuoteToTrade(
                    args,
                    uraQuoteResponse,
                    QuoteMethod.ROUTING_API,
                  );
                  console.log("trade resulttttt", tradeResult);
                  return { data: { ...tradeResult, latencyMs: trace.now() } };
                },
              );
            } catch (error: any) {
              console.warn(
                `GetQuote failed on Unified Routing API, falling back to client: ${error?.message ?? error?.detail ?? error
                }`,
              );
            }

            try {
              return trace.child(
                { name: "Quote on client", op: "quote.client" },
                async () => {
                  const { getRouter, getClientSideQuote } = await import(
                    "lib/hooks/routing/clientSideSmartOrderRouter"
                  );
                  const router = getRouter(args.tokenInChainId);
                  const quoteResult = await getClientSideQuote(
                    args,
                    router,
                    CLIENT_PARAMS,
                  );
                  if (quoteResult.state === QuoteState.SUCCESS) {
                    const trade = await transformQuoteToTrade(
                      args,
                      quoteResult.data,
                      QuoteMethod.CLIENT_SIDE_FALLBACK,
                    );
                    return {
                      data: { ...trade, latencyMs: trace.now() },
                    };
                  } else {
                    return { data: { ...quoteResult, latencyMs: trace.now() } };
                  }
                },
              );
            } catch (error: any) {
              console.warn(`GetQuote failed on client: ${error}`);
              trace.setError(error);
              return {
                error: {
                  status: "CUSTOM_ERROR",
                  error: error?.detail ?? error?.message ?? error,
                },
              };
            }
          },
        );
      },
      keepUnusedDataFor: ms(`10s`),
      extraOptions: {
        maxRetries: 0,
      },
    }),
  }),
});

export const { useGetQuoteQuery } = routingApi;
export const useGetQuoteQueryState =
  routingApi.endpoints.getQuote.useQueryState;
