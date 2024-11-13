import cron from "node-cron";

import { exec } from "child_process";
import util from "util";
import { prisma_client } from "./DB/prismaClient";

const execPromise = util.promisify(exec);
console.log("Cron 3-min-consumer/V0.1 🟢");
cron.schedule("*/3 * * * *", () => {
  console.log("Running Cron 3-min-consumer/V0.1 🟢");

  checkStatus();
});
// checkStatus();



async function checkStatus() {
  const urls = await prisma_client.url.findMany({
    where: {
      reqTime: 3,
    },
    include: {
      incident: true,
    },
  });

  const requests = urls.map((url) => {
    const { targetDomain } = url;
    const status = pingHost(`${targetDomain}`);
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
        //send mail for you site is UP Now

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
        await prisma_client.incident.create({
          data: {
            urlId: url.id,
            startTime: new Date(),
          },
        });

        await prisma_client.url.update({
          where: {
            id: url.id,
          },
          data: {
            status: "DOWN",
          },
        });
        //send mail
      } else {
        //send mail
        console.log("send mail");
      }
    }
  });
}

function extractAverageTime(pingOutput: string) {
  // Regular expression to match the 'round-trip min/avg/max' pattern
  const averageTimeMatch = pingOutput.match(
    /round-trip\s*min\/avg\/max\s*=\s*\d+\.\d+\/(\d+\.\d+)\/\d+\.\d+/
  );

  if (averageTimeMatch && averageTimeMatch[1]) {
    // Return the extracted average time as a number
    return parseInt(averageTimeMatch[1]);
  }

  // Return null if no average time is found
  return null;
}

function extractMaximumTime(pingOutput: string) {
  const maximumTimeMatch = pingOutput.match(
    /round-trip\s*min\/avg\/max\s*=\s*\d+\.\d+\/\d+\.\d+\/(\d+\.\d+)/
  );

  if (maximumTimeMatch && maximumTimeMatch[1]) {
    return parseInt(maximumTimeMatch[1]);
  }

  return null;
}

//     FOR WINDOWS
// function extractAverageTime(pingOutput: string): number | null {
//   // Regular expression to match the 'Average = Xms' pattern
//   const averageTimeMatch = pingOutput.match(/Average\s*=\s*(\d+)ms/);

//   if (averageTimeMatch && averageTimeMatch[1]) {
//     // Return the extracted average time as a number
//     return parseInt(averageTimeMatch[1], 10);
//   }

//   // Return null if no average time is found
//   return null;
// }
//     FOR WINDOWS
// function extractMaximumTime(pingOutput: string): number | null {
//   const MaximumTimeMatch = pingOutput.match(/Maximum\s*=\s*(\d+)ms/);

//   if (MaximumTimeMatch && MaximumTimeMatch[1]) {
//     return parseInt(MaximumTimeMatch[1], 10);
//   }

//   return null;
// }

async function pingHost(targetDomain: string) {
  try {
    const { stdout, stderr } = await execPromise(`ping -c 4 ${targetDomain}`);

    console.log("🚀 ~ pingHost ~ stdout:", stdout);
    console.log("🚀 ~ pingHost ~ stderr:", stderr);
    const averageTime = extractAverageTime(stdout);
    const MaximumTime = extractMaximumTime(stdout);
    return {
      status: "UP",
      averageTime: averageTime,
      maximumTime: MaximumTime,
    };
  } catch (error: any) {
    console.log("🚀 ~ pingHost ~ error:", error);
    return { status: "DOWN", averageTime: 0, maximumTime: 0 };
  }
}
