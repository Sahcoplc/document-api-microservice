/* eslint-disable no-console */
import { connectDB } from "./services/database.js"
import server from "./server.js"

const { PORT } = process.env

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