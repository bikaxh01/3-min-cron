import { Resend } from "resend";
import { UpAlert, DownAlert } from "./emailTemplate";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendMail(
  emailID: string,
  emailType: "DOWN ALERT" | "UP ALERT",
  lastChecked: string,
  siteName: string
) {
  try {
    const emailHTML =
      emailType === "DOWN ALERT"
        ? DownAlert(lastChecked, siteName)
        : UpAlert(lastChecked, siteName);
    const emailSubject =
      emailType === "DOWN ALERT"
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
  } catch (error) {
    return { status: "failed" };
  }
}
