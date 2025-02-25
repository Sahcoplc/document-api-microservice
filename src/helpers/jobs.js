import expiredCertificate from "../mails/expired-certificate.js";
import { documentTypes } from "../base/request.js";
import Manual from "../models/Manual.js";
import { sendBrevoMail } from "../services/mail.js";
// import axios from "axios";

const DEPT_CONSTANT = {
  LEGAL: "legalservices@sahcoplc.com",
  SLAES: "salesmarketing@sahcoplc.com",
  SUPPORT: "itsupport@sahcoplc.com",
  BUSINESS_DEV: "businessdevelopment@sahcoplc.com",
  HR: "humanresources@sahcoplc.com",
  GROUD_SERVICE: "groundserviceusers@sahcoplc.com",
  SAFTEY: "sqa@sahcoplc.com",
};

const monthsFromToday = (numberOfMonths) => {
  const resultDate = new Date();
  resultDate.setMonth(resultDate.getMonth() + numberOfMonths);
  return resultDate;
};

const sixMonthsFromNow = monthsFromToday(6);
const threeMonthsFromNow = monthsFromToday(3); // Not currently used, but left here in case it's needed later

// Example of how you might fetch employees by dept if needed
// const getDeptEmployee = async (deptName) => {
//   const url = `${process.env.SAHCO_HR_SERVER}/depts/s2s/get-employee-by-dept/${deptName}`;
//   const { data } = await axios.get(url);
//   return data.data;
// };

// Helper function to introduce delay (in milliseconds)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const sendEmailForExpiry = async () => {
  try {
    // 1. Fetch all manuals that expire in 6 months or less.
    const manuals = await Manual.find({
      dueDate: { $lte: sixMonthsFromNow },
    });

    // 2. Separate into different categories.
    const legalDocs = manuals.filter(
      (manual) =>
        manual.type === documentTypes.license || manual.type === documentTypes.contract
    );
    const safetyDocs = manuals.filter(
      (manual) =>
        manual.type === documentTypes.manual || manual.type === documentTypes.cert
    );

    // 3. Build an array of groups to send
    //    Each group has: 
    //       docs => array of documents
    //       email => department email address
    //    This helps avoid repeating the same loop logic twice.
    const docsToNotify = [
      { docs: legalDocs, email: DEPT_CONSTANT.LEGAL },
      { docs: safetyDocs, email: DEPT_CONSTANT.SAFTEY }
    ];

    // 4. Send emails with delays
    for (const { docs, email } of docsToNotify) {
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];

        // Send the email
        sendBrevoMail({
          email,
          subject: 'DOCUMENT EXPIRING SOON',
          body: expiredCertificate({
            title: 'DOCUMENT EXPIRING SOON',
            expireDate: doc.dueDate,
            docName: doc.title,
            url: doc.attachments?.[0],
          }),
        });

        // Wait 2 minutes before sending the next email (if there is a next)
        if (i < docs.length - 1) {
          await delay(2 * 60 * 1000); // 2 minutes = 120000 ms
        }
      }
    }

    return true;
  } catch (err) {
    // Log the error if necessary, then return false
    console.error(err);
    return false;
  }
};
