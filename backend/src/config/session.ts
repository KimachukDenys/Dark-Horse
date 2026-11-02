import session from "express-session"
import { createClient } from "redis"
import { RedisStore } from "connect-redis"

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err)
});

export async function connectRedis() {
  if(!redisClient.isOpen) {
    await redisClient.connect()
  }
};

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "darkhorse:sess:",
})

export const sessionConfig = session({
  name: "SID",
  store: redisStore,
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
})