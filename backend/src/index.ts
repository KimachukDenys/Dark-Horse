import "dotenv/config";
import express from "express";
import { connectRedis, sessionConfig } from "./config/session.js";
import cors from "cors";

import userRoute from "./route/user.route.js"
import marketRoute from "./route/market.route.js"
import walletRoute from "./route/wallet.route.js"
import itemRoute from "./route/item.route.js" 
import transactionRoute from "./route/transaction.route.js"
import goalRoute from "./route/goal.route.js"
import dashboardRoute from "./route/dashboard.route.js"


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
console.log("NODE_ENV:", process.env.NODE_ENV);
app.use(sessionConfig);

app.use("/api/user", userRoute)
app.use("/api/market", marketRoute);
app.use("/api/wallet", walletRoute);
app.use("/api/item", itemRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/goal", goalRoute);
app.use("/api/dashboard", dashboardRoute);

app.get("/", (req, res) => {
  res.send("Dark Horse API");
});

async function startServer() {
  await connectRedis();
  app.listen(8080, () => {
    console.log("Server started on PORT 8080");
  });
};

startServer().catch(console.error);