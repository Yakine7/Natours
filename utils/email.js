const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `Yakine <krim_yakino@hotmail.fr>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === "production") {
            // Mailchimp
            return nodemailer.createTransport({
                host: process.env.MANDRILL_HOST,
                port: process.env.MANDRILL_PORT,
                auth: {
                    user: process.env.MANDRILL_USERNAME,
                    pass: process.env.MANDRILL_PASSWORD,
                },
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            },
        );

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html),
            // html:
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send("welcome", "Welcome to the Natours Family!");
    }

    async sendPasswordReset() {
        await this.send(
            "passwordReset",
            "Your password reset token (valid for only 10 mins)",
        );
    }
};

// const sendEmail = async (options) => {
// 1) Create a transporter
// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });
// 2) Define the email options
// const mailOptions = {
//     from: `Yakine <${process.env.EMAIL_FROM}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
// };
// 3) Actually send the email
// await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
