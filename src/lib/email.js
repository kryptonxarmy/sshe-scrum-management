const nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/**
 * Send email notification to assignees when a task is created.
 * @param {Object} options
 * @param {string[]} options.to - Array of recipient email addresses
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @returns {Promise}
 */
async function sendTaskNotification({ to, subject, text, html }) {
  if (!Array.isArray(to) || to.length === 0) {
    throw new Error("Recipient email(s) required");
  }
  const mailOptions = {
    from: `SSHE Scrum Management Admin <${GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
    ...(html ? { html } : {}),
  };
  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendTaskNotification,
};
