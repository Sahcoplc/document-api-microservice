import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { SENDINBLUE_HOST, SENDINBLUE_PORT, SENDINBLUE_USER, SENDINBLUE_PASS } = process.env

const mailTransport = nodemailer.createTransport({
    host: SENDINBLUE_HOST,
    port: SENDINBLUE_PORT,
    auth: {
      user: SENDINBLUE_USER,
      pass: SENDINBLUE_PASS
    }
});

mailTransport.verify((error, success) => {
  if (error) {
    console.log(`Mail transport error - ${error}`);
  } else {
    console.log(`Mail transport success - ${success}`);
  }
});

export const sendMail = async ({ email, subject, body, attachments }) => {
  const mailOptions = {
    from: '"Skyway Aviation Handling Company Plc." <no-reply@sahcoplc.com.ng>',
    to: email,
    subject: subject || `Skyway Aviation Handling Company Plc.`,
    html: body,
    attachments
  };

  const response = await mailTransport.sendMail(mailOptions) 

  console.log("Mail sent: ", response);
}
