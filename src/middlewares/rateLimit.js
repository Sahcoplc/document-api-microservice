import toobusy from 'toobusy-js';
import rateLimit from 'express-rate-limit';
import MongoStore from "rate-limit-mongo";

const { DATABASE_URL, SESSION_DB_NAME, SESSION_DB_COLLECTION } = process.env;

const options = {
    uri: DATABASE_URL,
    authSource: SESSION_DB_NAME,
    collectionName: SESSION_DB_COLLECTION,
    expireTimeMs: 15 * 60 * 1000,
    errorHandler: console.error.bind(null, 'rate-limit-mongo')
    // see Configuration section for more options and details
}

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
    message: 'Too many requests created from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new MongoStore(options)
})

export const apiBusy = (req, res, next) => {
    if (toobusy()) {
        res.status(503).send("Server Too Busy");
    } else {
        next();
    }
}