import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import OrderBook from "./render/OrderBookRenderer.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <OrderBook />
    </React.StrictMode>
);

