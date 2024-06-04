import compression from "compression";
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import paginator from "mongoose-paginate-v2";
import morgan from "morgan";
import helmet from "helmet";
import expressSession from "express-session";
import MongoStore from "connect-mongo";
import { io } from "./helpers/socket.js";
import { __dirname } from "./__Globals.js";
import notFound from "./middlewares/notFound.js";
import { apiBusy, rateLimiter } from "./middlewares/rateLimit.js";
import errorHandlerMiddleware from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";
import authMiddleware from "./base/auth.js";
import { client } from "./services/redis.js";
import { rollbar } from "./services/rollbar.js";

dotenv.config();

paginator.paginate.options = { lean: true, leanWithId: false };
const {
  NODE_ENV,
  SESSION_SECRET,
  DATABASE_URL,
  SESSION_DB_NAME,
  SESSION_DB_COLLECTION,
} = process.env;

await client.connect();
const app = express();
app.use(compression());
app.set("trust proxy", 1);
app.use(express.json({ limit: "3MB" }));
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

const getOrigin = (origin, callback) => {
  const allowedOrigin = !origin || ["localhost", "database-app-nine.vercel.app", "internals.sahcoplc.com.ng"].some((value) => origin.includes(value));
  if (allowedOrigin) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

const corsOptions = {
  credentials: true,
  origin: getOrigin
};

const options = {
  mongoUrl: DATABASE_URL,
  dbName: SESSION_DB_NAME,
  collectionName: SESSION_DB_COLLECTION,
  ttl: 20000,
  crypto: {
    secret: "squirrel",
  },
};

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(helmet());

app.use(
  expressSession({
    name: "sahco",
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create(options),
    cookie: {
      sameSite: NODE_ENV === "development" ? "lax" : "none",
      secure: NODE_ENV !== "development",
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 1000, // 12 hours,
    },
  })
);

global.__basedir = __dirname;

// Routes
app.use(`/api`, apiBusy, rateLimiter, authMiddleware, routes);

// Use the rollbar error handler to send exceptions to your rollbar account
(NODE_ENV !== 'test' && app.use(rollbar.errorHandler()))

// Use middlewares
app.use(notFound);
app.use(errorHandlerMiddleware);

io.attach(server, {
  cors: {
    origin: getOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export default server;
