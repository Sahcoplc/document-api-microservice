import { Client } from "@microsoft/microsoft-graph-client"
import { getAccessToken } from "./ms-auth.js";
import moment from "moment";
import 'isomorphic-fetch'

export async function createOutlookEvent(manual, attendees) {
    console.log({manual})
  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Initialize Graph Client
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken); // Pass the token to the Graph Client
      },
    });

    // Define event with a reminder
    const event = {
      subject: `DOCUMENT EXPIRING SOON: ${manual.title}`,
      body: {
        contentType: 'HTML',
        content: `DOCUMENT EXPIRING SOON: ${manual.title} in ${moment(manual.expiryDate).fromNow()}`,
      },
      start: {
        dateTime: manual.expiryDate,
        timeZone: 'West Africa Time',
      },
      end: {
        dateTime: manual.expiryDate,
        timeZone: 'West Africa Time',
      },
      location: {
        displayName: 'SAHCO Internals: SAH-Docs ',
      },
      attendees: [
        {
            emailAddress: {
                address: 'gbemi.kotoye@outlook.com',
                name: 'Attendee Name',
            },
            type: 'required',
        },
        {
            emailAddress: {
                address: 'gbemisola@tippgeber24.de',
                name: 'Attendee Name',
            },
            type: 'required',
        },
      ],
      reminderMinutesBeforeStart: 10, // Set reminder (e.g., 10 minutes before event)
      isReminderOn: true, // Enable reminder
    };

    // Create the event in the calendar
    const response = await client
      .api('/me/events')
      .post(event);

    console.log('Event created successfully:', response);
  } catch (error) {
    console.log('Error creating event:', error);
  }
}
