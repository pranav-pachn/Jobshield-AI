import mongoose from "mongoose";
import { env } from "../src/config/env";
import "../src/config/loadEnv";
import { EvaluationRunner } from "../src/evaluation/EvaluationRunner";
import { V1Adapter } from "../src/evaluation/adapters/V1Adapter";
import { V2RagAdapter } from "../src/evaluation/adapters/V2RagAdapter";
import { logger } from "../src/utils/logger";

async function main() {
  const args = process.argv.slice(2);
  const systemArg = args.find(a => a.startsWith("--system="))?.split("=")[1] || "V1";
  const datasetArg = args.find(a => a.startsWith("--dataset="))?.split("=")[1] || "v1_benchmark.json";

  try {
    await mongoose.connect(env.mongoUri);
    logger.info("Connected to MongoDB for Evaluation Run.");

    let adapter: any;
    if (systemArg.toUpperCase() === "V1") {
      const { V1Adapter } = require("../src/evaluation/adapters/V1Adapter");
      adapter = new V1Adapter();
    } else if (systemArg.toUpperCase() === "V2-RAG") {
      const { V2RagAdapter } = require("../src/evaluation/adapters/V2RagAdapter");
      adapter = new V2RagAdapter();
    } else if (systemArg.toUpperCase() === "V2-AGENT") {
      const { V2AgentAdapter } = require("../src/evaluation/adapters/V2AgentAdapter");
      adapter = new V2AgentAdapter();
    } else {
      console.error("Unknown system:", systemArg);
      process.exit(1);
    }

    const runner = new EvaluationRunner(adapter, datasetArg);
    
    const isDryRun = args.some(a => a === "--dry-run");
    const delayArg = args.find(a => a.startsWith("--delay="))?.split("=")[1];
    
    // Check if a dataset exists and read count
    const fs = require("fs");
    const path = require("path");
    const datasetPath = path.join(__dirname, "../datasets", datasetArg);
    let numCases = 0;
    try {
      if (fs.existsSync(datasetPath)) {
        numCases = JSON.parse(fs.readFileSync(datasetPath, "utf8")).length;
      }
    } catch(e) {}

    if (isDryRun) {
      console.log(`\nDataset: ${datasetArg}`);
      console.log(`Cases: ${numCases}`);
      console.log(`System: ${systemArg.toUpperCase()}`);
      console.log(`Model: ${env.geminiPrimaryModel}`);
      console.log(`\nEstimated minimum LLM calls: ${numCases}`);
      console.log(`Configured rate limit: ${Math.floor(60000 / env.geminiMinRequestIntervalMs)} RPM`);
      const estimatedRuntime = (numCases * env.geminiMinRequestIntervalMs) / 1000 / 60;
      console.log(`Estimated runtime: ~${Math.ceil(estimatedRuntime)} minutes+\n`);
      process.exit(0);
    }
    
    // In a real CI environment, you'd pull these from process.env
    const options = {
      gitCommit: process.env.GIT_COMMIT || "local-dev",
      modelVersion: process.env.MODEL_VERSION || env.geminiPrimaryModel,
      agentVersion: "8I",
      toolSchemaVersion: "v1",
      provider: env.llmProvider
    };

    const runResult = await runner.run(options);

    console.log("\n========================================");
    console.log(`EVALUATION RUN COMPLETE: ${runResult.runId}`);
    console.log(`System: ${runResult.systemVersion}`);
    console.log(`Dataset: ${runResult.datasetVersion}`);
    console.log("========================================");
    console.log(`Precision:  ${(runResult.metrics.precision * 100).toFixed(1)}%`);
    console.log(`Recall:     ${(runResult.metrics.recall * 100).toFixed(1)}%`);
    console.log(`F1 Score:   ${(runResult.metrics.f1 * 100).toFixed(1)}%`);
    console.log(`FPR:        ${(runResult.metrics.falsePositiveRate * 100).toFixed(1)}%`);
    console.log(`Coverage:   ${(runResult.metrics.coverage * 100).toFixed(1)}%`);
    console.log(`P95 Latency:${runResult.metrics.p95LatencyMs.toFixed(0)} ms`);
    console.log(`Avg Tokens: ${runResult.metrics.avgTokens.toFixed(0)}`);
    console.log(`Cost/Correct:$${runResult.metrics.costPerCorrectDecision.toFixed(4)}`);
    console.log("========================================\n");

    if (runResult.regressions && runResult.regressions.length > 0) {
      console.log("⚠️ REGRESSIONS DETECTED:");
      for (const reg of runResult.regressions) {
        console.log(`  - [${reg.severity}] ${reg.metric}: ${reg.previousValue.toFixed(3)} -> ${reg.currentValue.toFixed(3)}`);
      }
      
      const hasFailure = runResult.regressions.some(r => r.severity === "FAILURE");
      if (hasFailure) {
        console.error("\n❌ Evaluation failed due to severe regression.");
        process.exit(1);
      }
    } else {
      console.log("✅ No regressions detected.");
    }

    process.exit(0);
  } catch (error) {
    logger.error("Evaluation script failed:", error);
    process.exit(1);
  }
}

main();
