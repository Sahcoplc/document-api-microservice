import multer from "multer";

const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
      cb(null, true); 
    } else {
      cb("Please upload only excel file.", false);
    }
};

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __basedir + "/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-gbemisola-${file.originalname}`);
    },
});
  
export const uploadFile = multer({ storage: fileStorage, fileFilter: csvFilter });