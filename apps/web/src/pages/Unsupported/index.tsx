import React from "react";
import "./unsupported.css";
import network from "../../assets/images/network.gif";
import { ChainId } from "udonswap-core";
import useSelectChain from "hooks/useSelectChain";
import useSyncChainQuery from "hooks/useSyncChainQuery";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Unsupported() {
  const selectChain = useSelectChain();
  useSyncChainQuery();
  const navigate = useNavigate();

  const [pendingChainId, setPendingChainId] = useState<ChainId | undefined>(
    undefined,
  );

  const handleChainSwitch = async () => {
    console.log("hello");
    await selectChain(919);
    navigate("/swap"); // Redirect to /swap after the chain is selected
  };

  return (
    <div className="container">
      <div className="flexContainer">
        <div className="netIcon">
          <img src={network} alt="Network Icon"></img>
        </div>
        <div className="flexInfo">
          <div className="info1">
            Your wallet is connected to an unsupported chain
          </div>
          <div className="info2">
            Click the button below to change the chain
          </div>
        </div>

        <button className="switch" onClick={handleChainSwitch}>
          Switch on Mode
        </button>
      </div>
    </div>
  );
}
