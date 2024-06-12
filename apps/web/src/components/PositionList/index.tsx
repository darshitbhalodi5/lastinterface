import PositionListItem from "components/PositionListItem";
import { Trans } from "i18n";
import React from "react";
import styled from "styled-components";
import { MEDIA_WIDTHS } from "theme";
import { PositionDetails } from "types/position";

const DesktopHeader = styled.div`
  display: none;
  font-size: 14px;
  background: #9657eb;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    align-items: center;
    display: flex;
    justify-content: space-between;
    & > div:last-child {
      text-align: right;
      margin-right: 12px;
    }
  }
`;

const MobileHeader = styled.div`
  font-weight: medium;
  padding: 8px;
  font-weight: 535;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    display: none;
  }

  @media screen and (max-width: ${MEDIA_WIDTHS.deprecated_upToExtraSmall}px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const ToggleWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ToggleLabel = styled.button`
  cursor: pointer;
  background-color: rgb(56, 37, 83);
  border: none;
  color: #ffffff;
  padding: 7px 10px;
  font-size: 13px;
  border-radius: 5px;
  font-weight: 435;
  opacity: 0.8;
  :hover {
    opacity: 1;
  }
`;

type PositionListProps = React.PropsWithChildren<{
  positions: PositionDetails[];
  setUserHideClosedPositions: any;
  userHideClosedPositions: boolean;
}>;

export default function PositionList({
  positions,
  setUserHideClosedPositions,
  userHideClosedPositions,
}: PositionListProps) {
  return (
    <>
      <DesktopHeader>
        <div>
          <Trans>Your positions</Trans>
          {positions && " (" + positions.length + ")"}
        </div>

        <ToggleLabel
          id="desktop-hide-closed-positions"
          onClick={() => {
            setUserHideClosedPositions(!userHideClosedPositions);
          }}
        >
          {userHideClosedPositions ? (
            <Trans>Show closed positions</Trans>
          ) : (
            <Trans>Hide closed positions</Trans>
          )}
        </ToggleLabel>
      </DesktopHeader>
      <MobileHeader>
        <Trans>Your positions</Trans>
        <ToggleWrap>
          <ToggleLabel
            onClick={() => {
              setUserHideClosedPositions(!userHideClosedPositions);
            }}
          >
            {userHideClosedPositions ? (
              <Trans>Show closed positions</Trans>
            ) : (
              <Trans>Hide closed positions</Trans>
            )}
          </ToggleLabel>
        </ToggleWrap>
      </MobileHeader>
      {positions.map((p) => (
        <PositionListItem key={p.tokenId.toString()} {...p} />
      ))}
    </>
  );
}
