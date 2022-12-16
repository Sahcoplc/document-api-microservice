import express from "express";
import expressSession from 'express-session'
import compression from "compression";
import dotenv from "dotenv";
import http from 'http'
import { io } from "./helpers/socket.js";
dotenv.config('.');

// Database
import connectDb from "./db/connect.js";

import morgan from "morgan";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { create } from "express-handlebars";
import { __dirname } from "./__Globals.js";

//Import Middleware
import notFound from "./middleware/notFound.js";
import errorHandlerMiddleware from "./middleware/errorHandler.js";

const { NODE_ENV, SESSION_SECRET } = process.env;
const app = express();

app.use(compression())
app.use(helmet())
app.use(morgan("tiny"));
app.use(express.json({ limit: "50MB" }));

const server = http.createServer(app);

const getOrigin = (origin, callback) => {
    const allowedOrigin = !origin || ["localhost", "sahcodocs.com"].some((value) => origin.includes(value));
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
app.use(cors(corsOptions));
app.use(
    expressSession({
        name: "sahcodocs",
        secret: SESSION_SECRET,
        saveUninitialized: false,
        resave: true,
        // store: new RedisStore({ client: redisClient }),
        cookie: {
            sameSite: NODE_ENV === "development" ? "lax" : "none",
            secure: NODE_ENV !== "development"
        }
    })
);


// Handlebars setup
app.set("view engine", "hbs");
const exphbs = create({
  layoutsDir: __dirname + "views/layout",
  extname: "hbs",
  defaultLayout: "main",
  partialsDir: __dirname + "views/partials/",
});
app.engine("hbs", exphbs.engine);
app.use(express.static(path.join(__dirname, "/public")));

const HOSTNAME = process.env.NODE_ENV !== 'production' ?  process.env.DEV_HOST : process.env.PRO_HOSTNAME;
let PORT =  process.env.PORT || process.env.DEV_PORT;

// Routes
const apiPath = "/api";


// Use middlewares
app.use(notFound);
app.use(errorHandlerMiddleware)

/**
 * HANDLING UNCAUGHT EXCEPTION ERRORS
 * Process.traceDeprecation = true;
 */
process.on("uncaughtException", (err) => {
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
        credentials: true
    }
});

const server_start = async () => {
    try {
        // Open Mysql Connection

        const connect = await connectDb.connect()
        console.log(connect)

        // AppDataSource.initialize()
        // .then(() => {
        //         // here you can start to work with your database
        //         console.log('Database initialized')
        // })
        // .catch((error) => console.log(error))

        if (PORT == '' || PORT == null) {
            PORT = 8003
        }

        server.listen(PORT, ()=> {
            console.log(`Server is running on port ${PORT}`)
        })

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

server_start()