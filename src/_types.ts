import { BookEntry } from "./ws/Book";

export type ChannelId = number;
export type Count = number;
export type Amount = number;
export type OrderBookEntry = [Price, Count, Amount];
export type SubscribedEvent = {
  event: "subscribed";
};
export type InitialBookResponse = [ChannelId, OrderBookEntry[]];
export type RunningBookResponse = [ChannelId, OrderBookEntry];
export type Price = number;
export type WebSocketResponse =
  | SubscribedEvent
  | InitialBookResponse
  | RunningBookResponse;
export type OrderBookUpdateCallback = (orderBook: {
  [price: Price]: BookEntry;
}) => void;
