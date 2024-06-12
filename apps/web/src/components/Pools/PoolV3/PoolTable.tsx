import React, { useEffect, useState } from "react";
import allpool from "components/Tokens/TokenV3/allpool.module.css";
import axios from "axios";
import { Tooltip, Button } from "@nextui-org/react";
import { GRAPH_ENDPOINT } from "../../../constants/lists";

// Define the types for the data
interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: string;
}

interface PoolDayData {
  date: number;
  liquidity: string;
  volumeUSD: string;
  feesUSD: string;
}

interface Pool {
  id: string;
  totalValueLockedUSD: string;
  txCount: string;
  feeTier: string;
  token0: Token;
  token1: Token;
  poolDayData: PoolDayData[];
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  }
  return num.toFixed(2);
};

export function PoolTable() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(GRAPH_ENDPOINT);
    const fetchData = async () => {
      try {
        const response = await axios.post(GRAPH_ENDPOINT, {
          query: `
            {
                pools(first: 100, orderBy: txCount, orderDirection: desc) {
                  id
                  totalValueLockedUSD
                  txCount
                  feeTier
                  token0 {
                    id
                    name
                    symbol
                    decimals
                  }
                  token1 {
                    id
                    name
                    symbol
                    decimals
                  }
                  poolDayData(first: 7, orderBy: date, orderDirection: desc) {
                    date
                    liquidity
                    volumeUSD
                    feesUSD
                  }
                }
              }
          `,
        });
        setPools(response.data.data.pools);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="">
      <div className={allpool.tablediv}>
        <div className={allpool.head}>
          <table className={allpool.table}>
            <thead>
              <tr className={allpool.row}>
                <th className={allpool.column1}>#</th>
                <th className={allpool.column2}>Pool</th>
                <th className={allpool.column3}>Transaction</th>

                <Tooltip
                  content="Total Value Locked"
                  className={allpool.tooltip}
                >
                  <th className={allpool.column4}>TVL</th>
                </Tooltip>
                <th className={allpool.column5}>1 day volume</th>
                <th className={allpool.column6}>7 day volume</th>
                <Tooltip
                  content="1 day APR refers to the amount of trading fees relative to total value locked (TVL) within a pool. 1 day APR = 24H Fees / TVL"
                  className={allpool.tooltipAPR}
                >
                  <th className={allpool.column7}>1 day APR</th>
                </Tooltip>
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
                {pools.map((pool, index) => {
                  const oneDayVolume = parseFloat(
                    pool.poolDayData[0]?.volumeUSD || "0",
                  );
                  const sevenDayVolume = pool.poolDayData
                    .reduce(
                      (acc: number, dayData: PoolDayData) =>
                        acc + parseFloat(dayData.volumeUSD),
                      0,
                    )
                    .toFixed(2);
                  const oneDayAPR =
                    parseFloat(pool.totalValueLockedUSD) !== 0
                      ? (
                          (parseFloat(pool.poolDayData[0]?.feesUSD) /
                            parseFloat(pool.totalValueLockedUSD)) *
                          100 *
                          100
                        ).toFixed(2)
                      : "0.00";

                  return (
                    <tr className={allpool.row} key={pool.id}>
                      <td className={allpool.column1}>{index + 1}</td>
                      <td className={allpool.column2}>
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </td>
                      <td className={allpool.column3}>
                        {formatNumber(parseFloat(pool.txCount))}
                      </td>
                      <td className={allpool.column4}>
                        {formatNumber(parseFloat(pool.totalValueLockedUSD))}
                      </td>
                      <td className={allpool.column5}>
                        {formatNumber(oneDayVolume)}
                      </td>
                      <td className={allpool.column6}>
                        {formatNumber(parseFloat(sevenDayVolume))}
                      </td>
                      <td className={allpool.column7}>{oneDayAPR}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
