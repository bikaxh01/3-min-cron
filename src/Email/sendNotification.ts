import { prisma_client } from "../DB/prismaClient";
import { sendMail } from "./resend-config";

export async function sendNotification(
  incidentId: string,
  notificationType: "DOWN ALERT" | "UP ALERT"
) {
  try {
    const getIncident = await prisma_client.incident.findUnique({
      where: {
        id: incidentId,
      },
      include: {
        notification: true,
      },
    });
    if (!getIncident) {
      throw new Error("Invalid incident ");
    }
    const getLastCheckedDetails = await prisma_client.url.findUnique({
      where: {
        id: getIncident.urlId,
      },
      include: {
        user: true,
        pingLog: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!getLastCheckedDetails?.user) {
      throw new Error("Invalid incident ");
    }
    // format last checked
    const lastChecked = new Date(getLastCheckedDetails.pingLog[0].createdAt);

    const formattedDate = lastChecked.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    if (getIncident.notificationId && getIncident.notification) {
      //check limit
      if (notificationType === "UP ALERT") {
        const response = await sendMail(
          getLastCheckedDetails.user.email,
          notificationType,
          formattedDate,
          getLastCheckedDetails.siteName
        );

        return;
      }

      if (
        getIncident.notification.totalMailSent <
        getIncident.notification.mailLimit
      ) {
        //sendmail && increase count
        const response = await sendMail(
          getLastCheckedDetails.user.email,
          notificationType,
          formattedDate,
          getLastCheckedDetails.siteName
        );

        if (response.status === "success") {
          await prisma_client.notification.update({
            where: {
              id: getIncident.notificationId,
            },
            data: {
              totalMailSent: { increment: 1 },
            },
          });
        }
      }
    } else {
      //create notification
      const createNotification = await prisma_client.notification.create({
        data: {
          urlId: getIncident.urlId,
          totalMailSent: 0,
        },
      });
      //put into incident
      const addNotificationToIncident = await prisma_client.incident.update({
        where: {
          id: incidentId,
        },
        data: {
          notificationId: createNotification.id,
        },
      });
      //send mail && increase count
      const response = await sendMail(
        getLastCheckedDetails.user.email,
        notificationType,
        formattedDate,
        getLastCheckedDetails.siteName
      );

      if (response.status === "success") {
        await prisma_client.notification.update({
          where: {
            id: addNotificationToIncident.id,
          },
          data: {
            totalMailSent: { increment: 1 },
          },
        });
      }
    }
  } catch (error) {
    return null;
  }
}
