/* eslint-disable no-console */
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";

dotenv.config();

const { MAILERSEND_API_KEY, MAILERSEND_SENDER, MAILSEND_URL } = process.env

const mailersend = new MailerSend({
    apiKey: MAILERSEND_API_KEY,
});

const instance = axios.create({ 
    baseURL: MAILSEND_URL, 
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: `Bearer ${MAILERSEND_API_KEY}`
    }
});

const sentFrom = new Sender(MAILERSEND_SENDER, "Skyway Aviation Handling Company Plc.");
const replyTo = new Sender("no-reply@sahcoplc.com", "Skyway Aviation Handling Company Plc.");

export const sendMail = async ({ receivers = [], subject, body }) => {

    const recipients = receivers.map(receiver => new Recipient(receiver.email, receiver.name));

    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(replyTo)
    .setSubject(subject)
    .setHtml(body);
    try {
        const sent = await mailersend.email.send(emailParams)
        if (sent.statusCode === 202) console.log("MAIL Sent successfully:: ")
        return sent
    } catch (e) {
        return e
    }
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

export const sendBulkMail = async ({ receivers = [], subject, body }) => {
    const bulkMails = receivers.map(receiver => {
        return new EmailParams()
        .setFrom(sentFrom)
        .setTo([new Recipient(receiver.email, receiver.name)])
        .setReplyTo(replyTo)
        .setSubject(subject)
        .setHtml(body);
    });
   
    try {
        const sent = await mailersend.email.sendBulk(bulkMails)
        if (sent.statusCode === 202) console.log("MAIL Sent successfully:: ")
        return sent
    } catch (e) {
        return e
    }
}