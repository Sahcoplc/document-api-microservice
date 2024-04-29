/* eslint-disable no-console */
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";

dotenv.config();

const { SENDINBLUE_API_KEY, SENDINBLUE_USER, MAILSEND_URL } = process.env

const mailersend = new MailerSend({
    api_key: SENDINBLUE_API_KEY,
});

const instance = axios.create({ 
    baseURL: MAILSEND_URL, 
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: `Bearer ${SENDINBLUE_API_KEY}`
    }
});

const sentFrom = new Sender(SENDINBLUE_USER, "Skyway Aviation Handling Company Plc.");
const replyTo = new Sender("no-reply@sahcoplc.com", "Skyway Aviation Handling Company Plc.");

export const sendMail = async ({ receivers = [], subject, body }) => {

    const recipients = receivers.map(receiver => new Recipient(receiver.email, receiver.name));

    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(replyTo)
    .setSubject(subject)
    .setHtml(body);

    await mailersend.email.send(emailParams).then((response) => console.log("EMAIL RES:: ", response.body))
    .catch((error) => console.log("MAIL ERR:: ", error.body));;
}

export const sendMailWithAttachment = async ({ receivers = [], subject, body, attachment }) => {

    const recipients = receivers.map(receiver => new Recipient(receiver.email, receiver.name));
    
    const attachments = [
        new Attachment(
            fs.readFileSync('/path/to/file.pdf', { encoding: 'base64' }),
            'file.pdf',
            attachment.name
        )
    ]

    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(replyTo)
    .setAttachments(attachments)
    .setSubject(subject)
    .setHtml(body);

    await mailersend.email.send(emailParams);
}

export const sendMailWithAxios = async ({ receivers = [], subject, body }) => {

    const mailbody = {
        from: {
            email: SENDINBLUE_USER,
        },
        to: receivers.map(receiver => ({ email: receiver.email, name: receiver.name })),
        subject,
        html: body
    }
    try {
        const data = await instance.post('/email', mailbody)
        // console.log("AXIOS MAIL:: ", data.data)
        return data.data
    } catch (e) {
        // console.log("AX ERR:: ", e.response.data)
        return e.response.data
    }
}