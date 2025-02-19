import AWS from "aws-sdk";
import multer from "multer"
import multerS3 from 'multer-s3'

const bucketName = process.env.S3_BUCKET;
const region = "eu-west-1"
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

export const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentDisposition: "inline",
    key: function (req, file, cb, res) {
      const keyName =  `doc/` + `${Date.now().toString()}/` + `${file.originalname}`;
      cb(null, keyName);
    },
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
  }),
});