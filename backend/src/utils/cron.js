import cron from "node-cron";

export const scheduleTask = (cronExpression, task) => {
  const job = cron.schedule(cronExpression, task, {
    scheduled: true,
    timezone: "Asia/Riyadh"
  });
  return job;
};

export const randomCron = (minHours, maxHours) => {
  const hours = Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;
  const minute = Math.floor(Math.random() * 60);
  return `0 ${minute} */${hours} * * *`;
};