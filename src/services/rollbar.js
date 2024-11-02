// include and initialize the rollbar library with your access token
import Rollbar from "rollbar"

const { ROLLBAR_TOKEN, NODE_ENV } = process.env

export const rollbar = new Rollbar({
  accessToken: NODE_ENV === 'development' ? null : ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    code_version: '1.0.0',
  }
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')