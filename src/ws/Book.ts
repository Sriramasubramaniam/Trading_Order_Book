import {
  Amount,
  Count,
  InitialBookResponse,
  OrderBookEntry,
  OrderBookUpdateCallback,
  Price,
  RunningBookResponse,
  SubscribedEvent,
  WebSocketResponse,
} from "../_types";

export interface BookEntry {
  count: Count;
  amount: Amount;
}
class OrderBook {
  static subscribed: boolean = false;
  private orderBookInstance: { [price: Price]: BookEntry } = {};
  private ws: WebSocket;
  private orderBookUpdateCallbacks: OrderBookUpdateCallback[] = [];
  private channelId: number = 0;

  constructor(wsUrl: string) {
    this.ws = new WebSocket(wsUrl);
    this.setupWebSocket();
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
      pair: "tBTCUSD",
      frequency: "F1",
      precision: "P1",
    };
    this.ws.send(JSON.stringify(subscribeMessage));
  }

  private handleWebSocketMessage(message: WebSocketResponse) {
    /**
     * the structure of the response is in such a way that first a response with event "subscribed" is received,
     * following which we get the initial response with a default of 50 data points of structure "InitialBookResponse". This can be used to populate the book initially.
     * Following that, future responses are of a similar structure but instead of 50 response we receive a single add/update response of structure "RunningBookResponse"
     */
    if (OrderBook.isSubscribedEvent(message)) {
      console.log("Subscribed");
      OrderBook.subscribed = true;
    } else if (OrderBook.isInitialBookResponse(message)) {
      console.log("Initial book response");
      this.populateInitialBook(message);
    } else if (OrderBook.isRunningBookResponse(message)) {
      console.log("Running book response");
      this.updateOrderBook(message[1]);
    }
  }

  // these are type guards to check if the reponse is one of the 3 predefined structures
  static isSubscribedEvent(
    message: WebSocketResponse
  ): message is SubscribedEvent {
    return (message as SubscribedEvent).event === "subscribed";
  }
  static isInitialBookResponse(
    message: WebSocketResponse
  ): message is InitialBookResponse {
    return (
      OrderBook.subscribed &&
      Array.isArray((message as InitialBookResponse)?.[1]?.[0])
    );
  }
  static isRunningBookResponse(
    message: WebSocketResponse
  ): message is RunningBookResponse {
    return (
      OrderBook.subscribed &&
      typeof (message as RunningBookResponse)?.[1]?.[0] === "number"
    );
  }

  // populate and update methods
  private populateInitialBook(message: InitialBookResponse) {
    const entries = message[1];
    this.channelId = message[0]; //store channel id for unsubscribing on unmount
    this.orderBookInstance = {};
    entries.forEach(([price, count, amount]: OrderBookEntry) => {
      this.orderBookInstance[price] = { count, amount };
    });
    this.notifyOrderBookUpdateCallbacks();
  }

  private updateOrderBook(entry: OrderBookEntry) {
    const [price, count, amount] = entry;
    // for reference for this algorithm to add/update/delete entry, can check the docs - https://docs.bitfinex.com/reference/ws-public-books#:~:text=Algorithm%20to%20create%20and%20keep%20a%20trading%20book%20instance%20updated
    if (count > 0) {
      // Add or update price level
      const isExistingEntry = this.orderBookInstance[price];
      if (!isExistingEntry) {
        // If price doesn't exist, create a new one
        this.orderBookInstance[price] = { count, amount };
      } else {
        // Update existing price level
        this.orderBookInstance[price].count = count;
        this.orderBookInstance[price].amount = amount;
      }
    } else {
      delete this.orderBookInstance[price];
    }
    this.notifyOrderBookUpdateCallbacks();
  }
  private notifyOrderBookUpdateCallbacks() {
    this.orderBookUpdateCallbacks.forEach((callback) => {
      callback(this.orderBookInstance);
    });
  }

  public addNotifier(callback: OrderBookUpdateCallback) {
    this.orderBookUpdateCallbacks.push(callback);
  }

  public unsubscribeTopic() {
    const unsubscribeMessage = {
      event: "unsubscribe",
      chanId: this.channelId,
    };
    this.ws.send(JSON.stringify(unsubscribeMessage));
  }

  public closeWsConnection() {
    this.ws.close();
  }

  public isWebSocketOpen() {
    return this.ws.readyState === WebSocketState.OPEN;
  }
}

enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export default OrderBook;
