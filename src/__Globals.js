import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config()

const { NODE_ENV } = process.env

const __filename = fileURLToPath(import.meta.url);

const __dir = path.dirname(__filename);

const __joinedDir = path.join(__dir, 'assets')

export const __dirname = NODE_ENV === "test" ? __joinedDir.slice(0, -4) : __joinedDir;
