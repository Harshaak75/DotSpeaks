import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.docker_ip,
  port: Number(process.env.docker_redis_port),
  retryStrategy(times) {
    const delay = Math.min(times * 2000, 20000);
    console.log(`Reconnecting to Redis in ${delay / 1000} seconds...`);
    return delay;
  },
  reconnectOnError(err) {
    console.warn("⚠️ Redis reconnectOnError:", err.message);
    return true; // always try to reconnect
  },
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
redis.on("close", () => console.warn("⚠️ Redis connection closed"));

export default redis;
