import { useEffect, useState } from "react";
import OrderBook, { BookEntry } from "../ws/Book";
import "./orderbook.scss";
import { Price } from "../_types";

const wsUrl = "wss://api-pub.bitfinex.com/ws/2";
interface CummulativeBookEntry extends BookEntry {
  cummulativeTotal: number;
}
interface NormalizedBookEntry extends CummulativeBookEntry {
  normalizedValue: number;
}
const OrderBookRenderer = () => {
  const [asks, setAsks] = useState<{ [price: Price]: NormalizedBookEntry }>({});
  const [bids, setBids] = useState<{ [price: Price]: NormalizedBookEntry }>({});
  useEffect(() => {
    const orderBook = new OrderBook(wsUrl);
    const handleOrderBookUpdate = (updatedOrderBook: {
      [price: Price]: BookEntry;
    }) => {
      const askEntries: { [price: Price]: CummulativeBookEntry } = {};
      const bidEntries: { [price: Price]: CummulativeBookEntry } = {};
      let cummulativeAskTotal = 0;
      let cummulativeBidTotal = 0;
      let maxAskTotal = 0;
      let maxBidTotal = 0;
      for (const price in updatedOrderBook) {
        const entry = updatedOrderBook[price];
        if (entry.amount < 0) {
          cummulativeAskTotal += Math.abs(entry.amount);
          maxAskTotal = Math.max(maxAskTotal, cummulativeAskTotal);
          askEntries[price] = {
            ...entry,
            cummulativeTotal: cummulativeAskTotal,
          };
        } else if (updatedOrderBook[price].amount > 0) {
          cummulativeBidTotal += Math.abs(entry.amount);
          bidEntries[price] = {
            ...entry,
            cummulativeTotal: cummulativeBidTotal,
          };
          maxBidTotal = Math.max(maxBidTotal, cummulativeBidTotal);
        }
      }
      const normalizedAskEntries = normalize(askEntries, maxAskTotal, false);
      const normalizedBidEntries = normalize(bidEntries, maxBidTotal, true);

      setAsks(normalizedAskEntries);
      setBids(normalizedBidEntries);
    };
    orderBook.addNotifier(handleOrderBookUpdate);

    //write a clean up function later
  }, []);

  const normalize = (
    entries: { [price: Price]: CummulativeBookEntry },
    maxTotal: number,
    reverseOrder: boolean
  ) => {
    const normalizedEntries: { [price: Price]: NormalizedBookEntry } = {};
    for (const price in entries) {
      const entry = entries[price];
      const normalizedTotal = reverseOrder
        ? (1 - entry.cummulativeTotal / maxTotal) * 100 // reverse the normalization for buy orders as it makes sense logically
        : (entry.cummulativeTotal / maxTotal) * 100;
      normalizedEntries[price] = { ...entry, normalizedValue: normalizedTotal };
    }
    return normalizedEntries;
  };
  return (
    <div className="orderBookContainer">
      <table className="buyTable">
        <thead>
          <tr>
            <th>Count</th>
            <th className="rightAlign">Amount</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(bids).map(
            ([price, { count, amount, normalizedValue }]) => (
              <tr key={price} className="dataRow">
                <td>{count}</td>
                <td className="rightAlign">{amount}</td>
                <td>{price}</td>
                <td className="barContainer">
                  <div
                    className="bar"
                    style={{ width: `${normalizedValue}%` }}
                  ></div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <table className="sellTable">
        <thead>
          <tr>
            <th>Price</th>
            <th className="rightAlign">Amount</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(asks).map(
            ([price, { count, amount, normalizedValue }]) => (
              <tr key={price} className="dataRow">
                <td>{price}</td>
                <td className="rightAlign">{amount}</td>
                <td>{count}</td>
                <td className="barContainer">
                  <div
                    className="bar"
                    style={{ width: `${normalizedValue}%` }}
                  ></div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderBookRenderer;
