import moment from "moment";
import * as ics from 'ics'

export async function createOutlookEvent(manual, attendees) {
  try {

      const event = {
        start: moment(manual.expiryDate).format('YYYY-M-D').split("-").map((a) => parseInt(a)),
        start: moment(manual.expiryDate).add(1, 'day').format('YYYY-M-D').split("-").map((a) => parseInt(a)),
        duration: { hours: 23, minutes: 30 },
        title:`DOCUMENT EXPIRING SOON: ${manual.title}`,
        description: `DOCUMENT EXPIRING SOON: ${manual.title} in ${manual.status}`,
        location:  'SAHCO Internals: SAH-Docs ',
        url: process.env.SAHCO_INTERNALS,
        alarms: [
          { action: 'display', description: 'Reminder', trigger: { hours: 2, minutes: 30, before: true }, repeat: 2 }
        ],
        productId: `${manual.title.toLowerCase()}/ics`,
        categories: [manual.typeOfService],
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'SAHCO PLC', email: 'dev@sahcoplc.com' },
        attendees
      }
      
      ics.createEvent(event, (error, value) => {
        if (error) {
          console.log(error)
          return
        }
        
        console.log('Event created successfully:', value);
      })
  } catch (error) {
    console.log('Error creating event:', error);
  }
}
