import toobusy from 'toobusy-js';
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests created from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export const apiBusy = (req, res, next) => {
    if (toobusy()) {
        res.status(503).send("Server Too Busy");
    } else {
        next();
    }
}