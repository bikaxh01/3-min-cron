"use strict";
// async function checkUrls() {
//   try {
//     const requests = urls.map((url) => axios.get(url, { timeout: 5000 }));
//     const results = await Promise.allSettled(requests);
//     results.forEach((result, index) => {
//       const url = urls[index];
//       console.log("🚀 ~ results.forEach ~ url:", result);
//       if (result.status === "fulfilled") {
//         const response = result.value;
//         //console.log(`${url}: Status ${response.status}, Response Time: ${response.headers['request-duration']} ms`);
//       } else {
//         // console.error(`${url}: Failed, Reason: ${result.reason.message}`);
//       }
//     });
//   } catch (error) {
//     console.error("Error monitoring URLs:", error);
//   }
// }
// checkUrls();
