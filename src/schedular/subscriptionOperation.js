const cron = require("node-cron");
const {
  // checkUserSubscriptionStatus,
  checkAndProcessTrialExpiration,
} = require("../services/admin.service");

// cron.schedule('* * * * *', () => {
//     checkUserSubscriptionStatus()
// });

// cron.schedule("0 0 * * *", () => {
//   checkUserSubscriptionStatus();
// });

cron.schedule("* * * * *", () => {
  checkAndProcessTrialExpiration();
});
