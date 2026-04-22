const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendStockAlert(itemName, currentStock, itemId) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ALERT_EMAIL,
      subject: `⚠️ Stock Alert: ${itemName}`,
      html: `
        <h2>Stock Alert Notification</h2>
        <p>Dear Admin,</p>
        <p>This is an automated alert regarding low inventory levels.</p>
        <hr>
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr style="background-color: #f2f2f2;">
            <td style="border: 1px solid #ddd; padding: 10px;">Item Name:</td>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>${itemName}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">Item ID:</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${itemId}</td>
          </tr>
          <tr style="background-color: #ffe6e6;">
            <td style="border: 1px solid #ddd; padding: 10px;">Current Stock:</td>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>${currentStock}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">Alert Threshold:</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${process.env.STOCK_ALERT_THRESHOLD}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">Date:</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <hr>
        <p>Please update the stock as soon as possible.</p>
        <p>Best regards,<br>Stock Management System</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Stock alert email sent for item: ${itemName}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  sendStockAlert
};
