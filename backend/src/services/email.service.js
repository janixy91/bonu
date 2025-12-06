import nodemailer from 'nodemailer';

let transporter = null;

// Initialize email transporter lazily (when needed)
const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    console.log('✅ Email transporter initialized');
  }

  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  console.log('📧 Attempting to send email...');
  console.log('📧 To:', to);
  console.log('📧 Subject:', subject);
  
  // Initialize transporter lazily
  const emailTransporter = getTransporter();
  
  console.log('📧 EMAIL_USER configured:', !!process.env.EMAIL_USER);
  console.log('📧 EMAIL_PASS configured:', !!process.env.EMAIL_PASS);
  console.log('📧 Transporter initialized:', !!emailTransporter);
  
  if (!emailTransporter) {
    console.log('📧 Email service not configured. Skipping email send.');
    console.log('📧 To configure email, set EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('📧 For Gmail: Enable 2FA and create an App Password at https://myaccount.google.com/apppasswords');
    console.log('📧 Current EMAIL_USER value:', process.env.EMAIL_USER || 'NOT SET');
    console.log('📧 Current EMAIL_PASS value:', process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET');
    return false;
  }

  try {
    const result = await emailTransporter.sendMail({
      from: `"BONU" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to}`);
    console.log('📧 Message ID:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', error);
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed. Check your EMAIL_USER and EMAIL_PASS.');
      console.error('❌ Make sure you are using an App Password, not your regular Gmail password.');
    }
    if (error.code === 'ECONNECTION') {
      console.error('❌ Connection failed. Check your EMAIL_HOST and EMAIL_PORT.');
    }
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h1>¡Bienvenido a BONU, ${name}!</h1>
    <p>Gracias por unirte a nuestra comunidad de tarjetas de fidelización digital.</p>
    <p>¡Comienza a acumular sellos y disfruta de increíbles recompensas!</p>
  `;
  return sendEmail(email, 'Bienvenido a BONU', html);
};

