const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    console.error("❌ Google Token Verification Failed:", error.message);
    return null;
  }
}

module.exports = verifyGoogleToken;