import express from "express";
import cors from "cors";

import marketRoute from "./route/market.route.js"
import itemRoute from "./route/item.route.js" 
import transactionRoute from "./route/transaction.route.js"
import goalRoute from "./route/goal.route.js"
import dashboardRoute from "./route/dashboard.route.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/market", marketRoute);
app.use("/api/item", itemRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/goal", goalRoute)
app.use("/api/dashboard", dashboardRoute)

app.get("/", (req, res) => {
  res.send("Dark Horse API");
});

app.listen(8080, () => {
  console.log("Server started on PORT 8080");
});