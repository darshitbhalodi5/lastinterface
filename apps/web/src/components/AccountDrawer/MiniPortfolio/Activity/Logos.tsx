import { LoaderV3 } from "components/Icons/LoadingSpinner";
import styled, { css, keyframes, useTheme } from "styled-components";
import {
  FadePresence,
  FadePresenceAnimationType,
} from "theme/components/FadePresence";

export const LogoContainer = styled.div`
  height: 64px;
  width: 64px;
  position: relative;
  display: flex;
  justify-content: center;
  border-radius: 50%;
  overflow: visible;
`;

const LoadingIndicator = styled(LoaderV3)`
  stroke: ${({ theme }) => theme.neutral3};
  fill: ${({ theme }) => theme.neutral3};
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  top: -4px;
  left: -4px;
  position: absolute;
`;

const dash = keyframes`
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const dashCheck = keyframes`
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
`;

const Circle = styled.circle`
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  // -webkit-animation: ${dash} 0.9s ease-in-out;
  // animation: ${dash} 0.9s ease-in-out;
`;

const PolyLine = styled.polyline`
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  stroke-dashoffset: -100;
  -webkit-animation: ${dashCheck} 0.9s 0.35s ease-in-out forwards;
  animation: ${dashCheck} 0.9s 0.35s ease-in-out forwards;
`;
export function LoadingIndicatorOverlay() {
  return (
    <FadePresence>
      <LoadingIndicator />
    </FadePresence>
  );
}

export function ConfirmedIcon({ className }: { className?: string }) {
  const theme = useTheme();
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130.2 130.2"
    >
      <Circle
        className="path circle"
        fill="none"
        stroke={"#9657EB"}
        strokeWidth="6"
        strokeMiterlimit="10"
        cx="65.1"
        cy="65.1"
        r="62.1"
      />
      <PolyLine
        className="path check"
        fill="none"
        stroke={"#9657EB"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeMiterlimit="10"
        points="100.2,40.2 51.5,88.8 29.8,67.5 "
      />
    </svg>
  );
}

export function SubmittedIcon({ className }: { className?: string }) {
  const theme = useTheme();
  return (
    <FadePresence animationType={FadePresenceAnimationType.FadeAndScale}>
      <svg
        data-testid="submitted-icon"
        width="54"
        height="54"
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M26.9997 0.333496C12.2717 0.333496 0.333008 12.2722 0.333008 27.0002C0.333008 41.7282 12.2717 53.6668 26.9997 53.6668C41.7277 53.6668 53.6663 41.7282 53.6663 27.0002C53.6663 12.2722 41.7277 0.333496 26.9997 0.333496ZM36.4131 25.7469C36.0238 26.1362 35.5117 26.3335 34.9997 26.3335C34.4877 26.3335 33.9756 26.1389 33.5863 25.7469L28.9997 21.1603V37.6668C28.9997 38.7708 28.1037 39.6668 26.9997 39.6668C25.8957 39.6668 24.9997 38.7708 24.9997 37.6668V21.1629L20.4131 25.7495C19.6318 26.5308 18.365 26.5308 17.5837 25.7495C16.8023 24.9682 16.8023 23.7014 17.5837 22.9201L25.5837 14.9201C25.7677 14.7361 25.9887 14.5898 26.2341 14.4884C26.722 14.2858 27.274 14.2858 27.762 14.4884C28.0074 14.5898 28.2291 14.7361 28.4131 14.9201L36.4131 22.9201C37.1944 23.7014 37.1944 24.9656 36.4131 25.7469Z"
          fill={theme.accent1}
        />
      </svg>
    </FadePresence>
  );
}

const IconCss = css`
  height: 64px;
  width: 64px;
`;

export const AnimatedEntranceConfirmationIcon = styled(ConfirmedIcon)`
  ${IconCss}
`;

export const AnimatedEntranceSubmittedIcon = styled(SubmittedIcon)`
  ${IconCss}
`;
