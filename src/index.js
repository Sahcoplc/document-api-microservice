/* eslint-disable no-console */
import { connectDB } from "./services/database.js"
import server from "./server.js"
import cron from 'node-cron'
import { updateCertificateStatus } from "./helpers/fetch.js"
import { sendEmailForExpiry } from "./helpers/jobs.js"
import { sendBrevoMail } from "./services/mail.js"
import expiredCertificate from "./mails/expired-certificate.js"

const { PORT } = process.env

cron.schedule('0 12 * * 1-5', async () => {
    console.log("Running job every 10 minutes!");
    await sendEmailForExpiry();
    console.log("====== END =======");
});

const serverStart = async () => {
    try {
        // Open MongoDB Connection
        await connectDB()
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

await serverStart() 