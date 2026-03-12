import express from "express";
import jobRoutes from "./routes/jobRoutes";
import recruiterRoutes from "./routes/recruiterRoutes";
import reportRoutes from "./routes/reportRoutes";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/reports", reportRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    logger.info(`Backend server running on port ${env.port}`);
  });
}

void startServer();
