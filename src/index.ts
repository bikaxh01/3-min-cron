import cron from "node-cron";

import { exec } from "child_process";
import util from "util";
import { prisma_client } from "./DB/prismaClient";
import { sendMail } from "./Email/resend-config";
import { sendNotification } from "./Email/sendNotification";
import axios from "axios";

const execPromise = util.promisify(exec);
console.log("Cron 3-min-consumer/V1.4 🟢");
// cron.schedule("*/3 * * * *", () => {
//   console.log("Running Cron 3-min-consumer/V0.1 🟢");

//   checkStatus();
// });

cron.schedule("* * * * *", () => {
  console.log("Running Cron 3-min-consumer/V1.4 🟢");

  checkStatus();
});
// checkStatus();

async function checkStatus() {
  const urls = await prisma_client.url.findMany({
    where: {
      reqTime: 3,
    },
    include: {
      incident: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const requests = urls.map((url) => {
    const { targetDomain } = url;
    const status = pingHost(`${targetDomain}`, url.url);
    return status;
  });

  const results = await Promise.allSettled(requests);

  results.map(async (result: any, index) => {
    const url = urls[index];

    //add ping log
    await prisma_client.pingLog.create({
      data: {
        urlId: url.id,
        avgTime: result.value.averageTime,
        maxTime: result.value.maximumTime,
      },
    });

    await prisma_client;
    if (result.value.status === "UP") {
      //check previous status
      if (url.status === "DOWN") {
        const incidentId = url.incident[0];
        await prisma_client.incident.update({
          where: {
            id: incidentId.id,
          },
          data: {
            endTime: new Date(),
          },
        });
        console.log(
          "🚀 ~ results.map ~ incidentId site is up now:",
          incidentId
        );
        //send mail for you site is UP Now
        await sendNotification(incidentId.id, "UP ALERT");
        //update current status in db
        await prisma_client.url.update({
          where: {
            id: url.id,
          },
          data: {
            status: "UP",
          },
        });
      }

      //update uptime
      await prisma_client.url.update({
        where: {
          id: url.id,
        },
        data: {
          totalUptime: { increment: 3 },
        },
      });
      return;
    }

    if (result.value.status === "DOWN") {
      //check previous status
      if (url.status === "UP") {
        //create incident
        const incident = await prisma_client.incident.create({
          data: {
            urlId: url.id,
            startTime: new Date(),
          },
        });
        console.log(
          "🚀 ~ results.map ~ incidentId site is down now:",
          incident.id
        );

        await prisma_client.url.update({
          where: {
            id: url.id,
          },
          data: {
            status: "DOWN",
          },
        });
        //send mail
        console.log("sending mail");
        await sendNotification(incident.id, "DOWN ALERT");
      } else {
        //send mail
        const incident = url.incident[0];
        console.log("🚀 ~ results.map ~ incident:", incident.id);
        console.log("sending mail");

        await sendNotification(incident.id, "DOWN ALERT");
      }
    }
  });
}

// function extractAverageTime(pingOutput: string) {
//   // Regular expression to match the 'round-trip min/avg/max' pattern
//   const averageTimeMatch = pingOutput.match(
//     /round-trip\s*min\/avg\/max\s*=\s*\d+\.\d+\/(\d+\.\d+)\/\d+\.\d+/
//   );

//   if (averageTimeMatch && averageTimeMatch[1]) {
//     // Return the extracted average time as a number
//     return parseInt(averageTimeMatch[1]);
//   }

//   // Return null if no average time is found
//   return null;
// }

// function extractMaximumTime(pingOutput: string) {
//   const maximumTimeMatch = pingOutput.match(
//     /round-trip\s*min\/avg\/max\s*=\s*\d+\.\d+\/\d+\.\d+\/(\d+\.\d+)/
//   );

//   if (maximumTimeMatch && maximumTimeMatch[1]) {
//     return parseInt(maximumTimeMatch[1]);
//   }

//   return null;
// }

//FOR WINDOWS
function extractAverageTime(pingOutput: string): number | null {
  // Regular expression to match the 'Average = Xms' pattern
  const averageTimeMatch = pingOutput.match(/Average\s*=\s*(\d+)ms/);

  if (averageTimeMatch && averageTimeMatch[1]) {
    // Return the extracted average time as a number
    return parseInt(averageTimeMatch[1], 10);
  }

  // Return null if no average time is found
  return null;
}
// FOR WINDOWS
function extractMaximumTime(pingOutput: string): number | null {
  const MaximumTimeMatch = pingOutput.match(/Maximum\s*=\s*(\d+)ms/);

  if (MaximumTimeMatch && MaximumTimeMatch[1]) {
    return parseInt(MaximumTimeMatch[1], 10);
  }

  return null;
}

async function pingHost(targetDomain: string, url: string) {
  try {
    const { stdout, stderr } = await execPromise(`ping -n 4 ${targetDomain}`);

    const averageTime = extractAverageTime(stdout);
    const MaximumTime = extractMaximumTime(stdout);
    let fetchStatus = false;
    if (!stderr) {
      console.log(`checking for url ${targetDomain}`);

      const response = await axios.get(url);
      console.log(`checking for url ${targetDomain} => status is ${response.status}`);

      if (response.status == 200) {
        return {
          status: "UP",
          averageTime: averageTime,
          maximumTime: MaximumTime,
        };
      } else {
        return { status: "DOWN", averageTime: 0, maximumTime: 0 };
      }
    }
  } catch (error: any) {
    return { status: "DOWN", averageTime: 0, maximumTime: 0 };
  }
}
