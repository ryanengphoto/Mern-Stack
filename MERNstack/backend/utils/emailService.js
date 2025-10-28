const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(to, verifyUrl) {
    const msg = {
        to,
        from: 'no-reply@lamp-stack4331.xyz',
        subject: 'Verify your Papyrus account',
        html: `
      <h2>Welcome!</h2>
      <p>Click below to verify your account:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 30 minutes.</p>
    `
    };

    await sgMail.send(msg);
}

module.exports = { sendVerificationEmail };