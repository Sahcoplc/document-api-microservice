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
import { io } from "./helpers/socket";
import { __dirname } from "./__Globals";
import notFound from "./middlewares/notFound";
import { apiBusy, rateLimiter } from "./middlewares/rateLimit";
import errorHandlerMiddleware from "./middlewares/errorHandler";

// Import routes
import routes from "./routes/home";
import authMiddleware from "./base/auth";
import { client } from "./services/redis";

dotenv.config();

paginator.paginate.options = { lean: true, leanWithId: false };
const {
  NODE_ENV,
  SESSION_SECRET,
  FLIGHT_DB_URL: DATABASE_URL,
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
  const allowedOrigin =
    !origin ||
    ["localhost", "database-app-nine.vercel.app"].some((value) =>
      origin.includes(value)
    );
  if (allowedOrigin) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

const corsOptions = {
  credentials: true,
  origin: getOrigin,
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

global.__basedir = `${__dirname}\\assets`;

// Routes
app.use(`/api`, authMiddleware, routes);

// Use middlewares
app.use(notFound);
app.use(errorHandlerMiddleware);
app.use(rateLimiter);
app.use(apiBusy);

/**
 * HANDLING UNCAUGHT EXCEPTION ERRORS
 * Process.traceDeprecation = true;
 */
process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.log(
    `UNCAUGHT EXCEPTION! Server Shutting down...\n
        ${err.name} \n ${err.message} \n ${err.stack}`
  );
  process.exit(1);
});

io.attach(server, {
  cors: {
    origin: getOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export default server;
