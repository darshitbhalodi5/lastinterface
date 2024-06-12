import React, { useEffect, useState } from "react";
import allpool from "components/Tokens/TokenV3/allpool.module.css";
import axios from "axios";
import { GRAPH_ENDPOINT } from "constants/lists";
import { Tooltip } from "@nextui-org/react";

interface Transaction {
  burns: {
    amount0: string;
    amount1: string;
    amountUSD: string;
    timestamp: string;
    origin: string;
  }[];
  mints: {
    amount0: string;
    amount1: string;
    amountUSD: string;
    timestamp: string;
    origin: string;
  }[];
  swaps: {
    amount0: string;
    amount1: string;
    amountUSD: string;
    timestamp: string;
    origin: string;
  }[];
}

export function Transaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(GRAPH_ENDPOINT, {
          query: `
              query MyQuery {
                transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
                  burns {
                    amount0
                    amount1
                    amountUSD
                    timestamp
                    origin
                  }
                  mints {
                    amount0
                    amount1
                    amountUSD
                    timestamp
                    origin
                  }
                  swaps {
                    amount0
                    amount1
                    amountUSD
                    timestamp
                    origin
                  }
                }
              }
            `,
        });
        setTransactions(response.data.data.transactions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transaction data: ", error);
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 10000); // Fetch data every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const timeAgo = (timestamp: string) => {
    const currentEpoch = Math.floor(Date.now() / 1000);
    const transactionEpoch = parseInt(timestamp);

    const differenceSeconds = currentEpoch - transactionEpoch;
    if (differenceSeconds < 60) {
      return `${differenceSeconds}s ago`;
    } else if (differenceSeconds < 3600) {
      const differenceMinutes = Math.floor(differenceSeconds / 60);
      return `${differenceMinutes}m ago`;
    } else if (differenceSeconds < 86400) {
      const differenceHours = Math.floor(differenceSeconds / 3600);
      return `${differenceHours}h ago`;
    } else {
      const differenceDays = Math.floor(differenceSeconds / 86400);
      return differenceDays === 1 ? "1 day ago" : `${differenceDays} days ago`;
    }
  };

  const formatWalletAddress = (address: string) => {
    const firstPart = address.substring(0, 8);
    const lastPart = address.substring(address.length - 4);
    return `${firstPart}...${lastPart}`;
  };

  return (
    <div className="">
      <div className={allpool.tablediv}>
        <div className={allpool.head}>
          <table className={allpool.table}>
            <thead>
              <tr className={allpool.row}>
                <th className={allpool.column10}>Time</th>
                <th className={allpool.column20}>Type</th>
                <th className={allpool.column30}>USD</th>
                <th className={allpool.column40}>Token amount</th>
                <th className={allpool.column50}>Token amount</th>
                <th className={allpool.column60}>Wallet</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className={allpool.content}>
          {loading && (
            <div style={{ textAlign: "center" }}>
              <span className={allpool.loader}></span>
            </div>
          )}
          {!loading && (
            <table className={allpool.table}>
              <tbody>
                {transactions.map((transaction, index) => (
                  <React.Fragment key={index}>
                    {transaction.burns.map((burn, index) => (
                      <tr className={allpool.row} key={index}>
                        <td className={allpool.column10}>
                          {timeAgo(burn.timestamp)}
                        </td>
                        <td className={allpool.column20}>Burn</td>
                        <td className={allpool.column30}>
                          {parseFloat(burn.amountUSD).toFixed(2)}
                        </td>
                        <td className={allpool.column40}>
                          {parseFloat(burn.amount0).toFixed(2)}
                        </td>
                        <td className={allpool.column50}>
                          {parseFloat(burn.amount1).toFixed(2)}
                        </td>
                        <td className={allpool.column60}>
                          {formatWalletAddress(burn.origin)}
                        </td>
                      </tr>
                    ))}
                    {transaction.mints.map((mint, index) => (
                      <tr className={allpool.row} key={index}>
                        <td className={allpool.column10}>
                          {timeAgo(mint.timestamp)}
                        </td>
                        <td className={allpool.column20}>Mint</td>
                        <td className={allpool.column30}>
                          {parseFloat(mint.amountUSD).toFixed(2)}
                        </td>
                        <td className={allpool.column40}>
                          {parseFloat(mint.amount0).toFixed(2)}
                        </td>
                        <td className={allpool.column50}>
                          {parseFloat(mint.amount1).toFixed(2)}
                        </td>
                        <td className={allpool.column60}>
                          {formatWalletAddress(mint.origin)}
                        </td>
                      </tr>
                    ))}
                    {transaction.swaps.map((swap, index) => (
                      <tr className={allpool.row} key={index}>
                        <td className={allpool.column10}>
                          {timeAgo(swap.timestamp)}
                        </td>
                        <td className={allpool.column20}>Swap</td>
                        <td className={allpool.column30}>
                          {parseFloat(swap.amountUSD).toFixed(2)}
                        </td>
                        <td className={allpool.column40}>
                          {parseFloat(swap.amount0).toFixed(2)}
                        </td>
                        <td className={allpool.column50}>
                          {parseFloat(swap.amount1).toFixed(2)}
                        </td>
                        <td className={allpool.column60}>
                          {formatWalletAddress(swap.origin)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
