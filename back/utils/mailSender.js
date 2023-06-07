const nodemailer = require("nodemailer");

const mailSender = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
  
        auth:{
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = mailSender;