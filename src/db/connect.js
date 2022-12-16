import dotenv from 'dotenv';
import util from 'util'
dotenv.config();
import mssql from 'mssql';

//Create a pool connection to the database
const connectPool = new mssql.ConnectionPool({
    server: process.env.NODE_ENV !== "production" ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST,
    user: process.env.NODE_ENV !== "production" ? process.env.DEV_DB_USER : process.env.PROD_DB_USER,
    password: process.env.NODE_ENV !== "production" ? process.env.DEV_DB_PASSWORD : process.env.PROD_DB_PASSWORD,
    database: process.env.NODE_ENV !== "production" ? process.env.DEV_DB_DATABASE : process.env.PROD_DB_DATABASE,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    // port: process.env.NODE_ENV !== "production" ? process.env.DEV_DB_PORT : process.env.PROD_DB_PORT
});

connectPool.query = util.promisify(connectPool.query).bind(connectPool)

export default connectPool;