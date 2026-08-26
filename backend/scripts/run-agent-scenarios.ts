import fs from 'fs';
import path from 'path';
import { LiveInvestigationAgent } from '../src/agent/investigationAgent';
import { InvestigationInput } from '../src/agent/types';
import mongoose from 'mongoose';
import { env } from '../src/config/env';

async function runScenarios() {
  if (!env.mongoUri) {
    console.error("MONGO_URI not set.");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB for scenario testing.");

  const scenariosPath = path.join(__dirname, '../datasets/agent_scenarios.json');
  const scenariosData = fs.readFileSync(scenariosPath, 'utf8');
  const scenarios = JSON.parse(scenariosData);

  const agent = new LiveInvestigationAgent();

  const results = {
    NORMAL: { passed: 0, total: 0 },
    AMBIGUOUS: { passed: 0, total: 0 },
    FAILURE: { passed: 0, total: 0 },
    SECURITY: { passed: 0, total: 0 }
  };

  for (const scenario of scenarios) {
    console.log(`\nRunning scenario: ${scenario.id} (${scenario.category})`);
    
    // Increment category total
    if (results[scenario.category as keyof typeof results]) {
      results[scenario.category as keyof typeof results].total++;
    }

    const input: InvestigationInput = {
      id: `test_${scenario.id}`,
      jobDescription: scenario.input,
      recruiterEmail: scenario.input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)?.[0]
    };

    try {
      const result = await agent.investigate(input);
      
      const verdictPass = scenario.expectedVerdicts.includes(result.verdict);
      
      const toolsUsed = result.trace.map(t => t.tool);
      
      let requiredPass = true;
      for (const req of scenario.requiredTools) {
        if (!toolsUsed.includes(req)) {
          requiredPass = false;
          console.log(`❌ Failed: Missing required tool ${req}`);
        }
      }

      let forbiddenPass = true;
      for (const forb of scenario.forbiddenTools) {
        if (toolsUsed.includes(forb)) {
          forbiddenPass = false;
          console.log(`❌ Failed: Used forbidden tool ${forb}`);
        }
      }
      
      const maxCallsPass = result.agentMetrics.toolCalls <= scenario.maxToolCalls;
      if (!maxCallsPass) {
        console.log(`❌ Failed: Exceeded max tool calls. Allowed: ${scenario.maxToolCalls}, Actual: ${result.agentMetrics.toolCalls}`);
      }

      if (!verdictPass) {
        console.log(`❌ Failed: Expected one of ${scenario.expectedVerdicts}, got ${result.verdict}`);
      }

      if (verdictPass && requiredPass && forbiddenPass && maxCallsPass) {
        console.log(`✅ Passed: Verdict ${result.verdict}, Tools: ${toolsUsed.join(', ') || 'None'}`);
        if (results[scenario.category as keyof typeof results]) {
          results[scenario.category as keyof typeof results].passed++;
        }
      } else {
        console.log(`Trace: `, JSON.stringify(result.trace, null, 2));
      }
    } catch (e: any) {
      console.log(`❌ Failed: Exception thrown: ${e.message}`);
    }
  }

  console.log("\n====== SCENARIO RESULTS ======");
  for (const [cat, res] of Object.entries(results)) {
    console.log(`${cat}: ${res.passed}/${res.total} passed`);
  }

  await mongoose.disconnect();
}

runScenarios().catch(err => {
  console.error("Scenario Runner Error:", err);
  process.exit(1);
});
