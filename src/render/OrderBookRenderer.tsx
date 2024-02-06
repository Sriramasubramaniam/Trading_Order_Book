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

    return <div>Order book</div>;
};

export default OrderBookRenderer;

