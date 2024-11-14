"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const resend_1 = require("resend");
const emailTemplate_1 = require("./emailTemplate");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
async function sendMail(emailID, emailType, lastChecked, siteName) {
    try {
        const emailHTML = emailType === "DOWN ALERT"
            ? (0, emailTemplate_1.DownAlert)(lastChecked, siteName)
            : (0, emailTemplate_1.UpAlert)(lastChecked, siteName);
        const emailSubject = emailType === "DOWN ALERT"
            ? "Alert you site is Down"
            : "Alert you site is Up Now";
        const { data, error } = await resend.emails.send({
            from: "Alert <monitor.io@bikash.cloud>",
            to: [emailID],
            subject: emailSubject,
            html: emailHTML,
        });
        if (error) {
            throw new Error("Something went wrong");
        }
        return { status: "success" };
    }
    catch (error) {
        return { status: "failed" };
    }
}
