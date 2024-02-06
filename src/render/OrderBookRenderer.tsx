import { useEffect, useState } from "react";
import OrderBook, { BookEntry, Price } from "../ws/Book";
const wsUrl = "wss://api-pub.bitfinex.com/ws/2";
const OrderBookRenderer = () => {
    const [asks, setAsks] = useState<{ [price: Price]: BookEntry }>({});
    const [bids, setBids] = useState<{ [price: Price]: BookEntry }>({});
    useEffect(() => {
        const orderBook = new OrderBook(wsUrl);
        const handleOrderBookUpdate = (updatedOrderBook: { [price: Price]: BookEntry }) => {
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
        <div style={{ display: "flex" }}>
            <table style={{ border: "2px solid green" }}>
                <thead>
                    <tr>
                        <th style={{ width: "130px", fontSize: "18px" }}>Count</th>
                        <th style={{ width: "130px", fontSize: "18px", textAlign: "right" }}>
                            Amount
                        </th>
                        <th style={{ width: "130px", fontSize: "18px" }}>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(bids).map(([price, { count, amount }]) => (
                        <tr key={price}>
                            <td style={{ width: "130px", textAlign: "center" }}>{count}</td>
                            <td style={{ width: "130px", textAlign: "right" }}>{amount}</td>
                            <td style={{ width: "130px", textAlign: "center" }}>{price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <table style={{ border: "2px solid red" }}>
                <thead>
                    <tr>
                        <th style={{ width: "130px", fontSize: "18px" }}>Price</th>
                        <th style={{ width: "130px", fontSize: "18px", textAlign: "right" }}>
                            Amount
                        </th>
                        <th style={{ width: "130px", fontSize: "18px" }}>Count</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(asks).map(([price, { count, amount }]) => (
                        <tr key={price}>
                            <td style={{ width: "130px", textAlign: "center" }}>{price}</td>
                            <td style={{ width: "130px", textAlign: "right" }}>{amount}</td>
                            <td style={{ width: "130px", textAlign: "center" }}>{count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderBookRenderer;

