import { createCustomError } from "./customError.js";

/* eslint-disable max-len */
const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? process.env.BACKEND_DEV_URL
    : process.env.BACKEND_URL;
    
class MailFormat {
  static format(type, data) {
    switch (type) {
      case "CONTACT_FORM":
        return this.contactForm(data);
      case "REGISTRATION":
        return this.createUser(data);
      case "SIGNUP":
        return this.signup(data);
      case "FORGET_PASSWORD":
        return this.forgetPassword(data);
      case "VERIFY_TOKEN":
        return this.verify(data);
      default:
        return this.default(type, data);
    }
  }

  static createUser(data) {
    return {
      title: "Welcome to Skyway Aviation Handling Company Plc.",
      greeting: `Hello ${data.name}`,
      mainMsg: `Our team is excited to have you and your department join us. 
        Your default password is ${data.password}. 
        Kindly login and start by changing your default password.`,
      callToActionText: "Click link to visit budget website",
      callToActionLink: 'https://sahcoplc.com.ng',
      signature: "Best Regards",
      senderName: "Skyway Aviation Handling Company Plc.",
      headerImg: "https://sahcoplc.com/wp-content/uploads/2019/06/sifax-sahco-logo-brand-2.png",
      // finalRemarkMsg: `You have 1 hour to verify your account.
      // If the button above does not take you to email verification, click
      // the link below to continue.`,
      // finalRemarkLink: `/account/email_verification?tk=${data.token}&id=${data.id}`,
    };
  }

  static contactForm(data) {
    return {
      title: "Contact us",
      greeting: `Hello ${data.name}`,
      mainMsg: `Thanks for contacting Skyway Aviation Handling Co. customer service.  Your message has been logged as a issue. 
        Expect a reply from our customer service team within 24 hours.`,
      callToActionText: "",
      callToActionLink: "",
      signature: "Best Regards",
      senderName: "Skyway Aviation Handling Company Plc.",
      headerImg: "",
      finalRemarkMsg: `${data.details}`,
      finalRemarkLink: "",
    };
  }

  static forgetPassword(data) {
    return {
      title: "Reset Password",
      greeting: `Hello ${data.name}`,
      mainMsg:
        "You requested to reset your password. To continue please confirm that this request was made by you using the PIN below. ",
      callToActionText: data.otp,
      callToActionLink: `/forgot_password`,
      signature: "Best Regards",
      senderName: "Skyway Aviation Handling Company Plc. Team",
      headerImg: "https://sahcoplc.com/wp-content/uploads/2019/06/sifax-sahco-logo-brand-2.png",
      finalRemarkMsg: `Your have 1 hour to provide the 6-digit otp before it expires.`,
      finalRemarkLink: ``,
    };
  }

  static signup(data) {
    return {
      title: "Welcome to Skyway Aviation Handling Company Plc.",
      greeting: `Hello ${data.name}`,
      mainMsg:
        "RGS team is excited to have you join us. Please verify your account to start.",
      callToActionText: "Click link to Verify account",
      callToActionLink: `/account/email_verification?tk=${data.token}&id=${data.id}`,
      signature: "Best Regards",
      senderName: "Skyway Aviation Handling Company Plc.",
      headerImg: "https://sahcoplc.com/wp-content/uploads/2019/06/sifax-sahco-logo-brand-2.png",
      finalRemarkMsg: `You have 1 hour to verify your account.
      If the button above does not take you to email verification, click
      the link below to continue.`,
      finalRemarkLink: `/account/email_verification?tk=${data.token}&id=${data.id}`,
    };
  }

  static verify(data) {
    return {
      title: "Welcome to Skyway Aviation Handling Company Plc.",
      greeting: `Hello ${data.name}`,
      mainMsg: " Please verify your account to continue.",
      callToActionText: "Click link to Verify account",
      callToActionLink: `/account/email_verification?tk=${data.token}&id=${data.id}`,
      signature: "Best Regards",
      senderName: "Skyway Aviation Handling Company Plc.",
      headerImg: "https://sahcoplc.com/wp-content/uploads/2019/06/sifax-sahco-logo-brand-2.png",
      finalRemarkMsg: `You have 1 hour to verify your account.
      If the button above does not take you to email verification, click
      the link below to continue.`,
      finalRemarkLink: `/account/email_verification?tk=${data.token}&id=${data.id}`,
    };
  }

  static default(type, data) {
    throw new createCustomError(`Email template not found.`, 404);
  }
}

export default MailFormat;
