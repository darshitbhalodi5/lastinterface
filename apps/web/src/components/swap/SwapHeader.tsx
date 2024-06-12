import { ChainId } from "udonswap-core";
import { Trans } from "i18n";
import { useSwapAndLimitContext, useSwapContext } from "state/swap/hooks";
import styled from "styled-components";
import { isIFramed } from "utils/isIFramed";

import { sendAnalyticsEvent } from "analytics";
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FeatureFlags } from "uniswap/src/features/experiments/flags";
import { useFeatureFlag } from "uniswap/src/features/experiments/hooks";
import { RowBetween, RowFixed } from "../Row";
import SettingsTab from "../Settings";
// import SwapBuyFiatButton from "./SwapBuyFiatButton";
import { SwapTab } from "./constants";
import { SwapHeaderTabButton } from "./styled";

const StyledSwapHeader = styled(RowBetween)`
  margin-bottom: 12px;
  padding-right: 4px;
  color: #525252;
`;

const HeaderButtonContainer = styled(RowFixed)<{ compact: boolean }>`
  gap: ${({ compact }) => (compact ? 0 : 16)}px;

  ${SwapHeaderTabButton} {
    ${({ compact }) => compact && "padding: 8px 12px;"}
  }
`;

const PathnameToTab: { [key: string]: SwapTab } = {
  "/swap": SwapTab.Swap,
  "/send": SwapTab.Send,
  "/limit": SwapTab.Limit,
};

export default function SwapHeader({
  compact,
  syncTabToUrl,
}: {
  compact: boolean;
  syncTabToUrl: boolean;
}) {
  const { chainId, currentTab, setCurrentTab } = useSwapAndLimitContext();
  const {
    derivedSwapInfo: { trade, autoSlippage },
  } = useSwapContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentTab(PathnameToTab[pathname] ?? SwapTab.Swap);
  }, [navigate, pathname, setCurrentTab]);

  const onTab = useCallback(
    (tab: SwapTab) => {
      sendAnalyticsEvent("Swap Tab Clicked", { tab });
      if (syncTabToUrl) {
        navigate(`/${tab}`, { replace: true });
      } else {
        setCurrentTab(tab);
      }
    },
    [navigate, setCurrentTab, syncTabToUrl],
  );

  return (
    <StyledSwapHeader>
      <HeaderButtonContainer compact={compact}>
        <SwapHeaderTabButton
          as={pathname === "/swap" ? "h1" : "button"}
          role="button"
          tabIndex={0}
          $isActive={currentTab === SwapTab.Swap}
          onClick={() => {
            onTab(SwapTab.Swap);
          }}
        >
          <Trans>Swap</Trans>
        </SwapHeaderTabButton>
        {/* <SwapHeaderTabButton
          as={pathname === "/limit" ? "h1" : "button"}
          role="button"
          $isActive={currentTab === SwapTab.Limit}
          onClick={() => {
            onTab(SwapTab.Limit);
          }}
        >
          <Trans>Limit</Trans>
        </SwapHeaderTabButton> */}

        {/* <SwapHeaderTabButton
          as={pathname === "/send" ? "h1" : "button"}
          role="button"
          $isActive={currentTab === SwapTab.Send}
          onClick={() => {
            onTab(SwapTab.Send);
          }}
        >
          <Trans>Send</Trans>
        </SwapHeaderTabButton> */}
      </HeaderButtonContainer>
      {currentTab === SwapTab.Swap && (
        <RowFixed>
          <SettingsTab
            autoSlippage={autoSlippage}
            chainId={chainId}
            compact={compact}
            trade={trade.trade}
          />
        </RowFixed>
      )}
    </StyledSwapHeader>
  );
}
