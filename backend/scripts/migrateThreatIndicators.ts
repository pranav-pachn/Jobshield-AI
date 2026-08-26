import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { ThreatLog } from "../src/models/ThreatLog";
import ScamEntity from "../src/models/ScamEntity";
import { ThreatIndicator, ThreatType, ThreatRiskLevel, ThreatSource } from "../src/models/ThreatIndicator";
import { ThreatIndicatorService } from "../src/services/threatIndicatorService";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function migrateThreats() {
  console.log("Starting ThreatIndicator migration...");
  
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found in env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  let migratedCount = 0;
  let errorCount = 0;

  try {
    // 1. Migrate ThreatLog
    console.log("Migrating ThreatLog collection...");
    const threatLogs = await ThreatLog.find({}).lean();
    console.log(`Found ${threatLogs.length} ThreatLog records.`);

    for (const log of threatLogs) {
      try {
        const metadata = {
          original_risk_score: log.original_risk_score,
          intelligence_boost: log.intelligence_boost,
          final_risk_score: log.final_risk_score,
          job_text_sample: log.job_text_sample,
          confidence_level: log.confidence_level,
          threat_category: log.threat_category,
        };

        const riskLevel = log.risk_level === "High" ? ThreatRiskLevel.HIGH : 
                          log.risk_level === "Medium" ? ThreatRiskLevel.MEDIUM : 
                          ThreatRiskLevel.LOW;

        const linkedInvestigations = log.job_analysis_id ? [log.job_analysis_id as any] : [];

        // Migrate email domains
        if (log.email_domain) {
          await ThreatIndicatorService.upsert(ThreatType.DOMAIN, log.email_domain, {
            riskLevel,
            metadata,
            source: ThreatSource.INVESTIGATION,
            linkedInvestigations
          });
          migratedCount++;
        }

        // Migrate website domains
        if (log.website_domain) {
          await ThreatIndicatorService.upsert(ThreatType.DOMAIN, log.website_domain, {
            riskLevel,
            metadata,
            source: ThreatSource.INVESTIGATION,
            linkedInvestigations
          });
          migratedCount++;
        }

        // Migrate phone numbers
        if (log.phone_number) {
          await ThreatIndicatorService.upsert(ThreatType.PHONE, log.phone_number, {
            riskLevel,
            metadata,
            source: ThreatSource.INVESTIGATION,
            linkedInvestigations
          });
          migratedCount++;
        }

        // Migrate suspicious phrases
        if (log.suspicious_phrases && log.suspicious_phrases.length > 0) {
          for (const phrase of log.suspicious_phrases) {
            await ThreatIndicatorService.upsert(ThreatType.SCAM_PHRASE, phrase, {
              riskLevel,
              metadata,
              source: ThreatSource.INVESTIGATION,
              linkedInvestigations
            });
            migratedCount++;
          }
        }
      } catch (err) {
        console.error(`Error migrating ThreatLog ${log._id}:`, err);
        errorCount++;
      }
    }

    // 2. Migrate ScamEntity
    console.log("Migrating ScamEntity collection...");
    const scamEntities = await ScamEntity.find({}).lean();
    console.log(`Found ${scamEntities.length} ScamEntity records.`);

    for (const entity of scamEntities) {
      try {
        const metadata = entity.metadata;
        const linkedInvestigations = entity.jobAnalysisId ? [new mongoose.Types.ObjectId(entity.jobAnalysisId)] : [];
        
        // Moderate risk unless specified
        const riskLevel = ThreatRiskLevel.MEDIUM;

        // Migrate emails
        if (entity.emails && entity.emails.length > 0) {
          for (const email of entity.emails) {
            await ThreatIndicatorService.upsert(ThreatType.EMAIL, email, {
              riskLevel,
              metadata,
              source: ThreatSource.INVESTIGATION,
              linkedInvestigations
            });
            migratedCount++;
          }
        }

        // Migrate domains
        if (entity.domains && entity.domains.length > 0) {
          for (const domain of entity.domains) {
            await ThreatIndicatorService.upsert(ThreatType.DOMAIN, domain, {
              riskLevel,
              metadata,
              source: ThreatSource.INVESTIGATION,
              linkedInvestigations
            });
            migratedCount++;
          }
        }

        // Migrate phone numbers
        if (entity.phoneNumbers && entity.phoneNumbers.length > 0) {
          for (const phone of entity.phoneNumbers) {
            await ThreatIndicatorService.upsert(ThreatType.PHONE, phone, {
              riskLevel,
              metadata,
              source: ThreatSource.INVESTIGATION,
              linkedInvestigations
            });
            migratedCount++;
          }
        }
      } catch (err) {
        console.error(`Error migrating ScamEntity ${entity._id}:`, err);
        errorCount++;
      }
    }

    console.log("--- Migration Complete ---");
    console.log(`Successfully migrated ${migratedCount} indicators.`);
    console.log(`Errors encountered: ${errorCount}`);
    
    // Count final unique indicators in the new collection
    const finalCount = await ThreatIndicator.countDocuments({});
    console.log(`Total unique ThreatIndicators now in DB: ${finalCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateThreats();
