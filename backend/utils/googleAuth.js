const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client();

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log("✅ Google Payload:", payload);

    return payload;
  } catch (error) {
    console.error("❌ Google Token Verification Failed:", error.message);
    return null;
  }
}

module.exports = verifyGoogleToken;