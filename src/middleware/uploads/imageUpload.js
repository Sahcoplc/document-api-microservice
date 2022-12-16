import storage from "./storage.js";
import multer from "multer";

const imageUpload = multer({ storage: storage });

export default imageUpload;
