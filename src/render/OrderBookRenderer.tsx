import { useEffect } from "react";
import OrderBook from "../ws/Book";
const wsUrl = "wss://api-pub.bitfinex.com/ws/2";
const OrderBookRenderer = () => {
    useEffect(() => {
        const orderBook = new OrderBook(wsUrl);

        console.log("test");
        //write a clean up function later
    }, []);

    return <div>Order book</div>;
};

export default OrderBookRenderer;

