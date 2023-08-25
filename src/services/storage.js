import AWS from "aws-sdk";
import multer from "multer"
import Papa from "papaparse"
import request from "request";
import stream from "scramjet";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import readXlsxFile from "read-excel-file/node";

dotenv.config();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET } = process.env

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: "eu-west-1"
});

const { StringStream } = stream
const s3 = new AWS.S3();

const fileFilter = (req, file, cb) => {
    const acceptedMimes = [
        'image/png', 'image/jpg', 'image/jpeg', 'image/webp', "image/svg+xml",
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if (acceptedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb("Error: CSV|Excel only");
    }
};

// // eslint-disable-next-line no-unused-vars
// const generateObjectParams = () => ({
//     s3: s3,
//     bucket: S3_BUCKET,
//     acl: "public-read",
//     metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

const generateObjectParams = (binary, file, Key) => ({
    ContentType: file.type,
    Body: binary,
    Key,
    ContentEncoding: "base64",
    Bucket: S3_BUCKET,
    ACL: "public-read"
});

export const uploadFileToCloud = async (file, folder, oldFileUrl = null) => {
    if (oldFileUrl) {
        await deleteFile(oldFileUrl);
    }
    // eslint-disable-next-line new-cap
    const binary = new Buffer.from(file.binaryString.replace(/^data:\w+\/\w+;base64,/, ""), "base64");
    file.name = `${Date.now()}-${file.name}`;
    const Key = `${folder}/${file.name}`;
    const params = generateObjectParams(binary, file, Key);
    const { Location } = await s3.upload(params).promise();
    return Location;
};

export const uploadFiles = async (files, folder) => {
    const uploadingFile = files.map(async (file) => uploadFileToCloud(file, folder));
    return Promise.all(uploadingFile);
};

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // eslint-disable-next-line no-undef
      cb(null, `${__basedir}/`);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-employees-${file.originalname}`);
    },
});

/**
 * * deleteFile
 * Deletes a file from the AWS bucket
 * @exports
 * @param {String} url 
 * @returns {Object}
 */
export const deleteFile = async (url) => {
    const Key = url.substring(url.indexOf(".com") + 5, url.length);
    const Bucket = process.env.S3_BUCKET;
    return s3.deleteObject({ Bucket, Key }).promise();
};
/**
 * * uploadFile
 */
export const uploadFile = multer({
    storage: fileStorage, // NODE_ENV === "development" ? multerS3({...generateObjectParams()}) : fileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

export const readFile = async (url) => {
    const Key = url.substring(url.indexOf(".com") + 5, url.length);
    const params = { Bucket: S3_BUCKET, Key }
    const response = await s3.getObject(params).promise() 
    return response.Body
}

/**
 * dowload, extract, transform and load csv file
 * @param {*} fileLocation
 * @returns
 */
export const downloadCSVFileETL = (fileLocation) => new Promise((resolve) => {
        const dataStream = request.get(fileLocation).pipe(new StringStream());

        Papa.parse(dataStream, {
            header: true,
            complete: function (results) {
                resolve(results);
            }
        });
    });

// extract excel file from local storage
export const downloadExcelFileETL = async (path) => {
    const rows = await readXlsxFile(path)
    const keys = rows[0];
    rows.shift()
    const objects = rows.map(array => {
      const object = {};
      keys.forEach((key, i) => { object[key] = array[i] });
      return object;
    });
    return objects
}

// Cloudinary file storage

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
    
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "/sahco-prime",
    },
});
    
export default cloudinaryStorage;

export const uploadImage = multer({ 
    storage: cloudinaryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});