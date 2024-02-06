type ChannelId = number;
type Price = number;
type Count = number;
type Amount = number;
type OrderBookEntry = [Price, Count, Amount];
type SubscribedEvent = {
    event: "subscribed";
};
type InitialBookResponse = [ChannelId, OrderBookEntry[]];
type RunningBookResponse = [ChannelId, OrderBookEntry];
export type WebSocketResponse = SubscribedEvent | InitialBookResponse | RunningBookResponse;

export interface BookEntry {
    count: Count;
    amount: Amount;
}
class OrderBook {
    private subscribed: boolean = false;
    private orderBookInstance: { [price: Price]: BookEntry } = {};
    private ws: WebSocket;

    constructor(wsUrl: string) {
        this.ws = new WebSocket(wsUrl);
        this.setupWebSocket();
    }

    get bookInstance(): { [price: Price]: BookEntry } {
        return this.orderBookInstance;
    }

    private setupWebSocket() {
        this.ws.onopen = () => {
            this.subscribeToOrderBook();
        };

        this.ws.onmessage = (response) => {
            const message: WebSocketResponse = JSON.parse(response.data);
            this.handleWebSocketMessage(message);
        };

        this.ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket connection error:", error);
        };
    }

    private subscribeToOrderBook() {
        //as per initial connection docs - https://docs.bitfinex.com/reference/ws-public-books#:~:text=With%20Your%20API-,Books,-The%20Order%20Books
        const subscribeMessage = {
            event: "subscribe",
            channel: "book",
            pair: "BTCUSD",
        };
        this.ws.send(JSON.stringify(subscribeMessage));
    }

    private handleWebSocketMessage(message: WebSocketResponse) {
        /**
         * the structure of the response is in such a way that first a response with event "subscribed" is received,
         * following which we get the initial response with a default of 50 data points of structure "InitialBookResponse". This can be used to populate the book initially.
         * Following that, future responses are of a similar structure but instead of 50 response we receive a single add/update response of structure "RunningBookResponse"
         */
        if (this.isSubscribedEvent(message)) {
            console.log("Subscribed");
            this.subscribed = true;
        } else if (this.isInitialBookResponse(message)) {
            console.log("Initial book response");
            this.populateInitialBook(message[1]);
        } else if (this.isRunningBookResponse(message)) {
            console.log("Running book response");
            this.updateOrderBook(message[1]);
        }
    }

    // these are type guards to check if the reponse is one of the 3 predefined structures
    private isSubscribedEvent(message: WebSocketResponse): message is SubscribedEvent {
        return (message as SubscribedEvent).event === "subscribed";
    }
    private isInitialBookResponse(message: WebSocketResponse): message is InitialBookResponse {
        return this.subscribed && Array.isArray((message as InitialBookResponse)[1][0]);
    }
    private isRunningBookResponse(message: WebSocketResponse): message is RunningBookResponse {
        return this.subscribed && !Array.isArray((message as RunningBookResponse)[1][0]);
    }

    // populate and update methods
    private populateInitialBook(entries: OrderBookEntry[]) {
        this.orderBookInstance = {};
        entries.forEach(([price, count, amount]: OrderBookEntry) => {
            this.orderBookInstance[price] = { count, amount };
        });
    }

    private updateOrderBook(entry: OrderBookEntry) {
        const [price, count, amount] = entry;
        this.orderBookInstance[price] = { count, amount };
    }
}

export default OrderBook;

