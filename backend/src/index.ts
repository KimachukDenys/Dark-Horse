import express from "express";
import cors from "cors";

import marketRouter from "./route/market.route.js"
import itemRouter from "./route/item.route.js" 
import transactionRouter from "./route/transaction.route.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/market", marketRouter);
app.use("/api/item", itemRouter);
app.use("/api/transaction", transactionRouter);

app.get("/", (req, res) => {
  res.send("Dark Horse API");
});

app.listen(8080, () => {
  console.log("Server started on PORT 8080");
});