import { useEffect, useState } from "react";
import OrderBook, { BookEntry, Price } from "../ws/Book";
import "./orderbook.scss";

const wsUrl = "wss://api-pub.bitfinex.com/ws/2";
const OrderBookRenderer = () => {
  const [asks, setAsks] = useState<{ [price: Price]: BookEntry }>({});
  const [bids, setBids] = useState<{ [price: Price]: BookEntry }>({});
  useEffect(() => {
    const orderBook = new OrderBook(wsUrl);
    const handleOrderBookUpdate = (updatedOrderBook: {
      [price: Price]: BookEntry;
    }) => {
      const askEntries: { [price: Price]: BookEntry } = {};
      const bidEntries: { [price: Price]: BookEntry } = {};
      for (const price in updatedOrderBook) {
        if (updatedOrderBook[price].amount < 0) {
          askEntries[price] = updatedOrderBook[price];
        } else if (updatedOrderBook[price].amount > 0) {
          bidEntries[price] = updatedOrderBook[price];
        }
      }
      setAsks(askEntries);
      setBids(bidEntries);
    };
    orderBook.addNotifier(handleOrderBookUpdate);
    console.log("test");
    //write a clean up function later
  }, []);
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
          {Object.entries(bids).map(([price, { count, amount }]) => (
            <tr key={price}>
              <td>{count}</td>
              <td className="rightAlign">{amount}</td>
              <td>{price}</td>
            </tr>
          ))}
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
          {Object.entries(asks).map(([price, { count, amount }]) => (
            <tr key={price}>
              <td>{price}</td>
              <td className="rightAlign">{amount}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderBookRenderer;
