/* eslint-disable no-console */
import { connectDB } from "./services/database.js"
import server from "./server.js"
import cron from 'node-cron'
import { updateCertificateStatus } from "./helpers/fetch.js"

const { PORT } = process.env

cron.schedule('02 40 01 * * *', async () => {
    console.log('Running cron job')
    await updateCertificateStatus()
})

const serverStart = async () => {
    try {
        // Open MongoDB Connection

        await connectDB()

        server.listen(PORT, ()=> {
            console.log(`Server is running on port ${PORT}`)
        })

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

serverStart()