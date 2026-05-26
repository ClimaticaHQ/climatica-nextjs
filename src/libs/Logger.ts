import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "warning",
    },
    {
      category: ["app"],
      sinks: ["console"],
      lowestLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
  ],
});

export const logger = getLogger(["app"]);
