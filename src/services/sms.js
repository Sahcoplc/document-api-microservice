import axios from "axios";

const { TERMII_API_KEY, TERMII_SENDER_ID, TERMII } = process.env;

export const sendSMS = (to, message) => {
    const data = { to, sms: message, api_key: TERMII_API_KEY, channel: "dnd", from: TERMII_SENDER_ID, type: "plain" };
    axios.post(TERMII, data, {
        headers: { "Content-Type": "application/json" }
    });
};

export const sendWhatsapp = (to, message) => {
    const data = { to, sms: message, api_key: TERMII_API_KEY, channel: "whatsapp", from: TERMII_SENDER_ID, type: "plain" };
    axios.post(TERMII, data, {
        headers: { "Content-Type": "application/json" }
    });
};

