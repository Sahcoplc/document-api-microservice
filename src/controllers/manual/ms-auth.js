import * as msal from '@azure/msal-node';

const { CLIENT_ID, CLIENT_SECRET, TENANT_ID } = process.env

const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    clientSecret: CLIENT_SECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

const tokenRequest = {
  scopes: ['https://graph.microsoft.com/.default'],
};

export async function getAccessToken() {
  try {
    const authResponse = await cca.acquireTokenByClientCredential(tokenRequest);
    return authResponse.accessToken;
  } catch (err) {
    console.log('Error acquiring token:', err);
  }
}

