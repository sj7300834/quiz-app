const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email transporter error:", err);
  } else {
    console.log("✅ Email service ready");
  }
});

async function sendOTP(email, otp) {
  try {
    await transporter.sendMail({
      from: `"Quiz App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Your OTP Code</h2>
          <h1 style="color:#4CAF50">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ OTP Email Error:", error);
    throw error; // important for backend error handling
  }
}

module.exports = sendOTP;
