import {
  InitialBookResponse,
  RunningBookResponse,
  SubscribedEvent,
} from "../_types";
import OrderBook from "../ws/Book";

describe("Book class type guards", () => {
  const subscribedEvent: SubscribedEvent = { event: "subscribed" };
  const initialBookResponse: InitialBookResponse = [
    123,
    [
      [42595, 3, 0.1999],
      [42595, 3, 0.1999],
    ],
  ];
  const runningBookResponse: RunningBookResponse = [456, [42596, 3, 0.199]];

  it("should correctly identify subscribed event", () => {
    expect(OrderBook.isSubscribedEvent(subscribedEvent)).toBeTruthy();
    expect(OrderBook.isSubscribedEvent(initialBookResponse)).toBeFalsy();
    expect(OrderBook.isSubscribedEvent(runningBookResponse)).toBeFalsy();
  });

  it("should correctly identify initial book response", () => {
    OrderBook.subscribed = true;
    expect(OrderBook.isInitialBookResponse(subscribedEvent)).toBeFalsy();
    expect(OrderBook.isInitialBookResponse(initialBookResponse)).toBeTruthy();
    expect(OrderBook.isInitialBookResponse(runningBookResponse)).toBeFalsy();
  });

  it("should correctly identify running book response", () => {
    OrderBook.subscribed = true;
    expect(OrderBook.isRunningBookResponse(subscribedEvent)).toBeFalsy();
    expect(OrderBook.isRunningBookResponse(initialBookResponse)).toBeFalsy();
    expect(OrderBook.isRunningBookResponse(runningBookResponse)).toBeTruthy();
  });
});
