const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");
const {
  forgotPasswordSendOTPFormat,
  emailVerificationFormat,
} = require("../../public/Email_Template");

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  return await transport.sendMail(msg);
};

const sendEmailVerification = async (to, otp) => {
  const message = {
    from: `${config.email.from}`,
    to: `${to}`,
    subject: "Please verify your email",
    text: `Please click on the following link to verify your email`,
    html: `${emailVerificationFormat(otp)}`,
  };
  transport.sendMail(message, (error, info) => {
    if (error) {
      console.log("Email sent error:  ", error);
      return false;
    } else {
      return true;
    }
  });
};

const sendForgotPasswordOTP = async (to, otp) => {
  const message = {
    from: `${config.email.from}`,
    to: `${to}`,
    subject: "OTP for Forgot password",
    text: `Please click on the following link to verify your email`,
    html: `${forgotPasswordSendOTPFormat(otp)}`,
  };
  transport.sendMail(message, (error, info) => {
    if (error) {
      console.log("Email sent error:  ", error);
      return false;
    } else {
      return true;
    }
  });
};

const sendResetPasswordConfirmationMail = async (to) => {
  const subject = "Successfully Changed password";
  const text = `Dear user,
    Your Password Has Been changed Successfully
    If you did not request any password resets, then ignore this email.`;
  return await sendEmail(to, subject, text);
};

const sendAdminCredentials = async (to, password) => {
  const subject = "Welcome to Automated Pricing Tool: Your Login Credentials";
  const text = `Dear User,

Welcome to Automated Pricing Tool! You have been successfully registered by our admin. Please find your login credentials below:

Email Address: ${to}
Temporary Password: ${password}

To access your account, please visit our secure login page:
https://admin.automatedpricingtool.io/

For security reasons, we highly recommend changing your password after your first login. If you did not create this account, please ignore this email.

Best Regards,
APT Team`;

  return await sendEmail(to, subject, text);
};

const sendUserCredentials = async (to, password) => {
  const subject = "Welcome to Automated Pricing Tool: Your Login Credentials";
  const text = `Dear User,
  
  Welcome to the Automated Pricing Tool! Our admin has successfully registered you. Please find your login credentials below.
  Now, get ready to embark on an exciting journey of storytelling and creativity! 
  To access your account, please visit our secure login page with your login credentials below:

  Website: https://automatedpricingtool.io/
  Email Address: ${to}
  Password: ${password}
  
  Remember to keep these details safe and secure! 
  Once again, a warm welcome to the Automated Pricing Tool! Get ready to unleash and gain greater pricing awareness in your business! 
  If you have any issues or have additional questions, please send an email to info.automatedpricingtool@gmail.com
  
  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendFreeTrialsCredentialsByUser = async (to,password) => {
  const subject =
    "Welcome to Automated Pricing Tool: Your Free Trial Credentials";
  const text = `Dear User,
  
  Welcome to the Automated Pricing Tool! You're successfully registered for a free trial period. Please find your free trial credentials below.
  Now, enjoy a complimentary 3-day access to our platform! Explore our features and discover how the Automated Pricing Tool can benefit your business. 
  To access your account during the free trial, please visit our secure login page with your login credentials below:

  Website: https://automatedpricingtool.io/
  Email Address: ${to}
  Password: ${password}
  
  Please note that this is a 3-day free trial, and if you find our platform valuable, you can continue using it by subscribing. Click the link below to subscribe and unlock the full potential:

  Subscribe Now: https://transactions.sendowl.com/subscriptions/30610/F24F8A1E/view
  
  Remember to keep these details safe and secure! 
  If you have any issues or have additional questions, please send an email to info.automatedpricingtool@gmail.com
  
  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendFreeTrialsCredentials = async (to,password) => {
  const subject =
    "Welcome to Automated Pricing Tool: Your Free Trial Credentials";
  const text = `Dear User,
  
  Welcome to the Automated Pricing Tool! Our admin has successfully registered you for a free trial period. Please find your free trial credentials below.
  Now, enjoy a complimentary 3-day access to our platform! Explore our features and discover how the Automated Pricing Tool can benefit your business. 
  To access your account during the free trial, please visit our secure login page with your login credentials below:

  Website: https://automatedpricingtool.io/
  Email Address: ${to}
  Password: ${password}
  
  Please note that this is a 3-day free trial, and if you find our platform valuable, you can continue using it by subscribing. Click the link below to subscribe and unlock the full potential:

  Subscribe Now: https://transactions.sendowl.com/subscriptions/30610/F24F8A1E/view
  
  Remember to keep these details safe and secure! 
  If you have any issues or have additional questions, please send an email to info.automatedpricingtool@gmail.com
  
  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendSubscriptionSuccessEmail = async (to) => {
  const subject =
    "Congratulations! Your Subscription to Automated Pricing Tool is Activated";
  const text = `Dear User,
  
  Congratulations! Your subscription to the Automated Pricing Tool has been successfully activated for life time. Get ready to explore and utilize the full potential of our platform to enhance your pricing strategies.

  To access your account, please visit our secure login page with your credentials:

  Website: https://automatedpricingtool.io/
  
  If you have any questions or need assistance, feel free to reach out to our support team at info.automatedpricingtool@gmail.com.

  Thank you for choosing Automated Pricing Tool for your pricing needs. We wish you a successful and productive experience!

  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendTrialActivationEmail = async (to) => {
  const subject =
    "Your Free Trial for Automated Pricing Tool Has Been Renewed!";
  const text = `Dear User,
  
  Great news! Your request for a free trial of the Automated Pricing Tool has been renewed for an additional 3 days. Continue to explore the powerful features of our platform and discover how it can benefit your business.

  To access your account during the renewed trial period, please visit our secure login page:

  Website: https://automatedpricingtool.io/
  

  If you have any questions or need assistance, feel free to reach out to our support team at info.automatedpricingtool@gmail.com.

  Thank you for choosing Automated Pricing Tool for your pricing needs. We hope you find the renewed trial period valuable!

  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendTrialExpirationEmail = async (to) => {
  const subject = "Your Free Trial for Automated Pricing Tool Has Expired";
  const text = `Dear User,
  
  We hope you enjoyed your free trial of the Automated Pricing Tool! Unfortunately, your trial period has expired.

  If you found our platform valuable and wish to continue using its features, please consider subscribing for a full year. Click the link below to subscribe and unlock the full potential:

  Subscribe Now: https://transactions.sendowl.com/subscriptions/30610/F24F8A1E/view
  
  Thank you for exploring the Automated Pricing Tool. If you have any questions or need assistance, feel free to reach out to our support team at info.automatedpricingtool@gmail.com.

  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendAdminTrialExpirationEmail = async (userName, userEmail) => {
  const adminEmail = "info.automatedpricingtool@gmail.com";
  const subject = "User's Free Trial Expired - Automated Pricing Tool";
  const text = `Dear Admin,
  
  The free trial of the Automated Pricing Tool has expired for the user:
  User Name: ${userName}
  User Email: ${userEmail}

  Please take appropriate actions, such as following up with the user or providing assistance if needed.

  Best Regards,
  APT Team`;

  return await sendEmail(adminEmail, subject, text);
};

const sendUserSubscriptionExpiredEmail = async (to) => {
  const subject = "Your Subscription Period Has Expired - Automated Pricing Tool";
  const text = `Dear User,
  
  We hope you enjoyed using the Automated Pricing Tool. However, your subscription period of 1 year has expired. To continue accessing our platform and its features, please consider renewing your subscription.

  If you have any questions or need assistance, please contact our support team at info.automatedpricingtool@gmail.com.

  Best Regards,
  APT Team`;

  return await sendEmail(to, subject, text);
};

const sendAdminSubscriptionExpiredEmail = async (userName, userEmail) => {
  const adminEmail = "info.automatedpricingtool@gmail.com";
  const subject = "User's Subscription Expired - Automated Pricing Tool";
  const text = `Dear Admin,
  
  The subscription of the user ${userName} (${userEmail}) has expired. Please take appropriate actions, such as following up with the user or providing assistance if needed.

  Best Regards,
  APT Team`;

  return await sendEmail(adminEmail, subject, text);
};



module.exports = {
  sendForgotPasswordOTP,
  sendResetPasswordConfirmationMail,
  sendEmailVerification,
  sendUserCredentials,
  sendAdminCredentials,
  sendFreeTrialsCredentials,
  sendSubscriptionSuccessEmail,
  sendTrialActivationEmail,
  sendTrialExpirationEmail,
  sendAdminTrialExpirationEmail,
  sendUserSubscriptionExpiredEmail,
  sendAdminSubscriptionExpiredEmail,
  sendFreeTrialsCredentialsByUser
};
