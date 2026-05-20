const nodemailer = require("nodemailer");

async function sendEmail() {

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com",
      pass: "your_app_password"
    }
  });

  // Email details
  const mailOptions = {
    from: "your_email@gmail.com",
    to: "friend@example.com",
    subject: "Hello from Node.js",
    text: "This email was sent using Node.js!"
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log("Email sent:", info.response);
}

sendEmail().catch(console.error);