import {
  BrowserEvent,
  InterfaceElementName,
  InterfacePageName,
  SharedEventName,
} from "@uniswap/analytics-events";
import { Trace, TraceEvent } from "analytics";
import { PoolTable } from "components/Pools/PoolV3/PoolTable";
import { AutoRow } from "components/Row";
import { TokenTable } from "components/Tokens/TokenV3/TokenTable";
import NetworkFilter from "components/Tokens/TokenTable/NetworkFilter";
import SearchBar from "components/Tokens/TokenTable/SearchBar";
import TimeSelector from "components/Tokens/TokenTable/TimeSelector";
import { MAX_WIDTH_MEDIA_BREAKPOINT } from "components/Tokens/constants";
import { Trans } from "i18n";
import { ExploreChartsSection } from "pages/Explore/charts/ExploreChartsSection";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { StyledInternalLink, ThemedText } from "theme/components";
import "./tables/table.css";
import { manualChainOutageAtom } from "featureFlags/flags/outageBanner";
import {
  getTokenExploreURL,
  isBackendSupportedChain,
  validateUrlChainParam,
} from "graphql/data/util";
import { useOnGlobalChainSwitch } from "hooks/useGlobalChainSwitch";
import { useResetAtom } from "jotai/utils";
import { Chain } from "uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks";
import { useExploreParams } from "./redirects";
import { Transaction } from "./tables/Transaction";

const ExploreContainer = styled.div`
  width: 100%;
  min-width: 320px;
  padding-top: 68px;
  @media only screen and (max-width: ${({ theme }) =>
      `${theme.breakpoint.sm}px`}) {
    padding: 16px;
    padding-bottom: 0px;
  }
`;

const NavWrapper = styled.div`
  display: flex;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  margin: 0 auto;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.neutral3};
  flex-direction: row;
  justify-content: space-between;
  @media screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    flex-direction: column;
    gap: 16px;
  }
`;
const TabBar = styled(AutoRow)`
  gap: 24px;
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    gap: 16px;
  }
`;
const TabItem = styled(ThemedText.HeadlineMedium)<{ active?: boolean }>`
  align-items: center;
  color: ${({ theme, active }) => (active ? "#E9E002" : "white")};
  cursor: pointer;
  transition: ${({ theme }) =>
    `${theme.transition.duration.medium} ${theme.transition.timing.ease} color`};

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    font-size: 24px !important;
    line-height: 32px !important;
  }
  :hover {
    color: #e9e002 !important;
    opacity: 1;
  }
`;
const FiltersContainer = styled.div`
  display: flex;
  gap: 8px;
  height: 40px;
  justify-content: flex-start;
`;

export enum ExploreTab {
  Tokens = "tokens",
  Pools = "pools",
  Transactions = "transactions",
}

interface Page {
  title: React.ReactNode;
  key: ExploreTab;
  component: () => JSX.Element;
  loggingElementName: string;
}
const Pages: Array<Page> = [
  {
    title: <Trans>Tokens</Trans>,
    key: ExploreTab.Tokens,
    component: TokenTable,
    loggingElementName: InterfaceElementName.EXPLORE_TOKENS_TAB,
  },
  {
    title: <Trans>Pools</Trans>,
    key: ExploreTab.Pools,
    component: PoolTable,
    loggingElementName: InterfaceElementName.EXPLORE_POOLS_TAB,
  },
  {
    title: <Trans>Transactions</Trans>,
    key: ExploreTab.Transactions,
    component: Transaction,
    loggingElementName: InterfaceElementName.EXPLORE_TRANSACTIONS_TAB,
  },
];

const Explore = ({ initialTab }: { initialTab?: ExploreTab }) => {
  const tabNavRef = useRef<HTMLDivElement>(null);
  const resetManualOutage = useResetAtom(manualChainOutageAtom);

  const initialKey: number = useMemo(() => {
    const key =
      initialTab && Pages.findIndex((page) => page.key === initialTab);

    if (!key || key === -1) return 0;
    return key;
  }, [initialTab]);

  useEffect(() => {
    if (tabNavRef.current && initialTab) {
      const offsetTop =
        tabNavRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: offsetTop - 90, behavior: "smooth" });
    }
    // scroll to tab navbar on initial page mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const scrollToNavWrapper = () => {
    if (tabNavRef.current) {
      const offsetTop =
        tabNavRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: offsetTop - 90, behavior: "smooth" });
    }
    setCurrentTab(Pages.findIndex((page) => page.key === ExploreTab.Pools));
  };
  const [currentTab, setCurrentTab] = useState(initialKey);

  // to allow backward navigation between tabs
  const { tab: tabName, chainName } = useExploreParams();
  const tab = tabName ?? ExploreTab.Tokens;
  const chain = validateUrlChainParam(chainName);
  useEffect(() => {
    const tabIndex = Pages.findIndex((page) => page.key === tab);
    if (tabIndex !== -1) {
      setCurrentTab(tabIndex);
    }
    resetManualOutage();
  }, [resetManualOutage, tab]);

  const { component: Page, key: currentKey } = Pages[currentTab];

  // Automatically trigger a navigation when the app chain changes
  const navigate = useNavigate();
  useOnGlobalChainSwitch(
    useCallback(
      (_chainId, chain) => {
        if (chain && isBackendSupportedChain(chain)) {
          navigate(getTokenExploreURL({ tab, chain }));
        }
      },
      [navigate, tab],
    ),
  );

  return (
    <Trace
      page={InterfacePageName.EXPLORE_PAGE}
      properties={{ chainName: chain }}
      shouldLogImpression
    >
      <ExploreContainer>
        {/* <ExploreChartsSection /> */}
        <section className="explorMain">
          <div className="exploreDiv">
            <div className="exFlex">
              <div className="mainFlex">
                <h1 style={{ margin: "0" }}>EARN WITH YOUR LIQUIDITY</h1>
                <div className="flexDiv">
                  <div className="flexDiv1">
                    <div className="volume">Udonswap volume</div>
                    <div className="volume">$103.69m</div>
                  </div>
                  <div className="flexDiv1">
                    <div className="volume">Udonswap TVL</div>
                    <div className="volume">$539.72m</div>
                  </div>
                </div>
              </div>

              <div className="flexbtn">
                <a>
                  <button onClick={scrollToNavWrapper}>
                    View Existing Pools ↓
                  </button>
                </a>
                <span>or</span>
                <a href="/add/ETH">
                  <button>Create Your Position Now! →</button>
                </a>
              </div>
            </div>
          </div>
        </section>
        <NavWrapper ref={tabNavRef}>
          <TabBar data-testid="explore-navbar">
            {Pages.map(({ title, loggingElementName, key }, index) => {
              return (
                <TraceEvent
                  events={[BrowserEvent.onClick]}
                  name={SharedEventName.NAVBAR_CLICKED}
                  element={loggingElementName}
                  key={index}
                >
                  <StyledInternalLink
                    to={
                      `/explore/${key}` +
                      (chain !== Chain.Ethereum
                        ? `/${chain.toLowerCase()}`
                        : "")
                    }
                  >
                    <TabItem
                      onClick={() => setCurrentTab(index)}
                      active={currentTab === index}
                      key={key}
                    >
                      {title}
                    </TabItem>
                  </StyledInternalLink>
                </TraceEvent>
              );
            })}
          </TabBar>
          <FiltersContainer>
            {/* <NetworkFilter /> */}
            {/* <TimeSelector /> */}
            <SearchBar />
          </FiltersContainer>
        </NavWrapper>
        <Page />
      </ExploreContainer>
    </Trace>
  );
};

export default Explore;
