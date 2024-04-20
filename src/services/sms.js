import axios from "axios";

const { TERMII_API_KEY, TERMII_SENDER_ID, TERMII } = process.env;

const API = (baseURL) => {
    
    const instance = axios.create({ 
        baseURL, 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }, 
    });
    
    instance.interceptors.request.use((request) => request);

    instance.interceptors.response.use((response) => response)

    return instance
}

export const sendSMS = (to, message) => {
    const data = { to, sms: message, api_key: TERMII_API_KEY, channel: "dnd", from: TERMII_SENDER_ID, type: "plain" };
    axios.post(TERMII, data, {
        headers: { "Content-Type": "application/json" }
    });
};


