
import { documentTypes } from "../base/request.js";
import Manual from "../models/Manual.js"
import { sendBrevoMail } from "../services/mail.js"
import axios from "axios";

const DEPT_CONSTANT = {
  LEGAL: "legalservices@sahcoplc.com",
  SLAES: "salesmarketing@sahcoplc.com",
  SUPPORT: "itsupport@sahcoplc.com",
  BUSINESS_DEV: "businessdevelopment@sahcoplc.com",
  HR: "humanresources@sahcoplc.com",
  GROUD_SERVICE: "groundserviceusers@sahcoplc.com",
  SAFTEY: "sqa@sahcoplc.com"
}



const monthsFromToday = (numberOfMonths) => {
  const resultDate = new Date();
  resultDate.setMonth(resultDate.getMonth() + numberOfMonths);
  return resultDate;
};

const sixMonthsFromNow = monthsFromToday(6);
const threeMOnthsFromNow = monthsFromToday(3);

// const getDeptEmployee = async (deptName) => {
//   const url = `${process.env.SAHCO_HR_SERVER}/depts/s2s/get-employee-by-dept/${deptName}`
//   const data = await axios.get(url)
//   return data.data.data
// }

export const sendEmailForExpiry = async () => {
  try {
    // const legal = await getDeptEmployee("LEGAL")
    const manuals = await Manual.find({
      dueDate: { $lte: sixMonthsFromNow }
    });

    const legalDoc = manuals.find((manual) => 
      manual.type === documentTypes.license || manual.type === documentTypes.contract
    );

    console.log(legalDoc)

    const safetyDocs = manuals.find((manual) =>
      manual.type === documentTypes.manual || manual.type === documentTypes.cert
    );
    // for (let i = 0; i < legalDoc.length; i++) {
    //   sendBrevoMail({
    //     email: DEPT_CONSTANT.LEGAL,
    //     subject: 'DOCUMENT EXPIRING SOON',
    //     body: expiredCertificate({
    //       title: 'DOCUMENT EXPIRING SOON',
    //       expireDate: legalDoc.dueDate,
    //       docName: legalDoc.title,
    //       url: legalDoc?.attachments[0]
    //     })
    //   })
    // }
    for (let i = 0; i < legalDoc.length; i++) {
      sendBrevoMail({
        email: "eme.udobong@sahcoplc.com",
        subject: 'DOCUMENT EXPIRING SOON',
        body: expiredCertificate({
          title: 'DOCUMENT EXPIRING SOON',
          expireDate: legalDoc.dueDate,
          docName: legalDoc.title,
          url: legalDoc?.attachments[0]
        })
      })
    }

    // for (let i = 0; i < safetyDocs.length; i++) {
    //   sendBrevoMail({
    //     email: DEPT_CONSTANT.LEGAL,
    //     subject: 'DOCUMENT EXPIRING SOON',
    //     body: expiredCertificate({
    //       title: 'DOCUMENT EXPIRING SOON',
    //       expireDate: safetyDocs.dueDate,
    //       docName: safetyDocs.title,
    //       url: safetyDocs?.attachments[0]
    //     })
    //   })
    // }

    return true;
  } catch (err) {
    return false;
  }
};




