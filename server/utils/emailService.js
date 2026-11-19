import nodemailer from "nodemailer";

/**
 * Creates and returns a Nodemailer transporter based on environment variables.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!user || !pass) {
    return null; // SMTP credentials not configured
  }

  // If using Gmail or user email ends in @gmail.com
  if (user.endsWith("@gmail.com") || host === "smtp.gmail.com") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  if (!host) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
};

/**
 * Generate a responsive, professional HTML email template for KIET OTP verification.
 */
const generateOtpHtml = (otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your KIET Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 16px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-icon {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 22px;
      margin-bottom: 8px;
    }
    .brand-name {
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 36px 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
      text-align: center;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
      margin: 0 0 28px 0;
      text-align: center;
    }
    .otp-card {
      background: #fff7ed;
      border: 2px dashed #fdba74;
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin: 0 0 28px 0;
    }
    .otp-code {
      font-family: 'SF Mono', 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      color: #ea580c;
      letter-spacing: 8px;
      margin: 0;
      user-select: all;
    }
    .otp-expiry {
      font-size: 12px;
      font-weight: 600;
      color: #c2410c;
      margin-top: 8px;
    }
    .security-notice {
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .security-notice p {
      margin: 0;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }
    .security-notice strong {
      color: #0f172a;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding: 24px 32px;
      text-align: center;
      background-color: #fafafa;
    }
    .footer p {
      margin: 4px 0;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-icon">🎓</div>
        <h1 class="brand-name">Rate My Professor</h1>
        <div class="brand-tagline">KIET Academic Portal</div>
      </div>

      <div class="content">
        <h2 class="title">Verify Your Institutional Email</h2>
        <p class="description">
          Please use the following single-use verification code to authenticate your KIET email address and activate your account.
        </p>

        <div class="otp-card">
          <div class="otp-code">${otp}</div>
          <div class="otp-expiry">⏳ Expires in 5 minutes</div>
        </div>

        <div class="security-notice">
          <p>
            <strong>Security Warning:</strong> Never share this verification code with anyone. Rate My Professor administrators and faculty will never request this code from you.
          </p>
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          If you did not request this verification code, please ignore this email safely.
        </p>
      </div>

      <div class="footer">
        <p><strong>Rate My Professor • KIET Group of Institutions</strong></p>
        <p>This is an automated security notification. Replies to this address are not monitored.</p>
        <p>&copy; ${new Date().getFullYear()} Rate My Professor. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Sends the verification code to the recipient's KIET email.
 *
 * @param {string} email - Destination email (must be @kiet.edu)
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{ sent: boolean, messageId?: string, devMode?: boolean }>}
 */
export const sendVerificationEmail = async (email, otp) => {
  const transporter = getTransporter();

  if (!transporter) {
    // Development / Local environment without SMTP configured:
    // Output prominent console box so testing works without failure
    console.log("\n=======================================================");
    console.log("📨 [DEV EMAIL SERVICE] SMTP credentials not configured.");
    console.log(`🎯 Recipient : ${email}`);
    console.log(`🔑 OTP Code  : ${otp}`);
    console.log("⏳ Validity  : 5 minutes");
    console.log("=======================================================\n");
    return { sent: true, devMode: true };
  }

  // Construct from address. When using Gmail, the email in <...> must match the authenticated user.
  const senderEmail = process.env.SMTP_USER?.trim();
  const fromAddress = `"Rate My Proff" <${senderEmail}>`;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: "Verify Your KIET Email – Rate My Professor",
    text: `Your Rate My Professor verification code is: ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: generateOtpHtml(otp),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Verification email sent to ${email}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send email to ${email}:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

/**
 * Generate responsive HTML email template for daily review reminder.
 */
const generateDailyReminderHtml = (studentName) => {
  const name = studentName || "Student";
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Lecture Feedback Reminder</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 16px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-name {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      margin: 0;
    }
    .brand-sub {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      margin-top: 4px;
    }
    .content {
      padding: 32px 24px;
      text-align: center;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .lead {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .date-badge {
      display: inline-block;
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #ffedd5;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
      margin: 10px 0 24px;
    }
    .info-box {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 16px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      text-align: left;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-name">Rate My Proff</h1>
        <p class="brand-sub">Daily Academic Feedback • KIET Community</p>
      </div>

      <div class="content">
        <div class="date-badge">📅 Today: ${todayDate}</div>
        <div class="greeting">Hi ${name},</div>
        <p class="lead">
          Did you attend lectures today? Take 1 minute to rate your teaching faculty across all 5 key dimensions:
          <strong>Teaching Quality, Subject Knowledge, Doubt Resolution, Grading Fairness, and Class Engagement</strong>.
        </p>

        <a href="http://localhost:5173/student/dashboard" class="cta-btn" target="_blank">
          Submit Today's Faculty Review &rarr;
        </a>

        <div class="info-box">
          🔒 <strong>100% Anonymous & Confidential:</strong> Your feedback is directly decoupled from your student profile and empowers continuous academic improvement across all departments.
        </div>
      </div>

      <div class="footer">
        <p><strong>Rate My Proff • KIET Group of Institutions</strong></p>
        <p>You received this automated reminder because you are a registered student at KIET.</p>
        <p>&copy; ${new Date().getFullYear()} Rate My Proff. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Sends a daily review reminder email to a student.
 *
 * @param {string} email - Destination student email (@kiet.edu)
 * @param {string} studentName - Student's name
 * @returns {Promise<{ sent: boolean, messageId?: string, devMode?: boolean }>}
 */
export const sendDailyReviewReminder = async (email, studentName) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[DEV REMINDER] Reminder simulated for ${email} (${studentName})`);
    return { sent: true, devMode: true };
  }

  const senderEmail = process.env.SMTP_USER?.trim();
  const fromAddress = `"Rate My Proff" <${senderEmail}>`;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: "Daily Lecture Feedback: Rate Your Professors on Rate My Proff",
    text: `Hi ${studentName || "Student"},\n\nDid you attend classes today? Don't forget to submit your daily review for today's teaching faculty on Rate My Proff!\n\nSubmit your review at: http://localhost:5173/student/dashboard\n\nYour feedback is 100% confidential.\n\nRate My Proff • KIET`,
    html: generateDailyReminderHtml(studentName),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Daily reminder sent to ${email}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send reminder to ${email}:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
