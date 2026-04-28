import mongoose from "mongoose";
import { ThreatLog } from "../src/models/ThreatLog";
import { logger } from "../src/utils/logger";

/**
 * Demo Threat Intelligence Data Seeder
 * 
 * This script seeds the ThreatLog collection with realistic demo data
 * for hackathon presentation purposes. It creates:
 * 
 * 1. Top scam domains with varying frequencies
 * 2. Common suspicious phrases with counts
 * 3. Suspicious email domains
 * 4. Recent high-risk activities
 * 5. Various threat categories
 */

const DEMO_THREAT_DATA = [
  // High-frequency scam domains
  {
    website_domain: "fakejobs-careers.xyz",
    email_domain: "hr.alert@gmail.com",
    suspicious_phrases: ["registration fee", "earn weekly", "no interview required"],
    job_title: "Remote Data Entry Specialist",
    salary_pattern: "high_unrealistic" as const,
    original_risk_score: 65,
    intelligence_boost: 25,
    final_risk_score: 90,
    risk_level: "High" as const,
    job_text: "Urgent hiring for Remote Data Entry Specialist. Earn $2000 weekly working from home. No interview required. Registration fee of $50 for background check. Contact hr.alert@gmail.com to apply immediately. Visit fakejobs-careers.xyz for more info.",
    job_text_hash: "demo_hash_1",
    job_text_sample: "Urgent hiring for Remote Data Entry Specialist. Earn $2000 weekly working from home. No interview required. Registration fee of $50 for background check.",
    threat_category: "financial_scam" as const,
    confidence_level: "High" as const,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    website_domain: "quickhire-now.com",
    email_domain: "jobs.quick@gmail.com",
    suspicious_phrases: ["processing fee", "guaranteed job", "act fast"],
    job_title: "Customer Service Representative",
    salary_pattern: "high_unrealistic" as const,
    original_risk_score: 60,
    intelligence_boost: 20,
    final_risk_score: 80,
    risk_level: "High" as const,
    job_text: "Customer Service Representative needed immediately. Guaranteed job position. Processing fee of $25 required. Act fast - limited positions available. Contact jobs.quick@gmail.com. Apply at quickhire-now.com",
    job_text_hash: "demo_hash_2",
    job_text_sample: "Customer Service Representative needed immediately. Guaranteed job position. Processing fee of $25 required. Act fast - limited positions available.",
    threat_category: "financial_scam" as const,
    confidence_level: "High" as const,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    website_domain: "tcs-careers-now.xyz",
    email_domain: "recruitment.tcs@gmail.com",
    suspicious_phrases: ["no experience required", "instant hiring", "wire transfer"],
    job_title: "Software Developer",
    salary_pattern: "suspicious" as const,
    original_risk_score: 55,
    intelligence_boost: 30,
    final_risk_score: 85,
    risk_level: "High" as const,
    job_text: "Software Developer position available. No experience required. Instant hiring process. Wire transfer needed for equipment setup. Visit tcs-careers-now.xyz to apply. Contact recruitment.tcs@gmail.com",
    job_text_hash: "demo_hash_3",
    job_text_sample: "Software Developer position available. No experience required. Instant hiring process. Wire transfer needed for equipment setup.",
    threat_category: "phishing" as const,
    confidence_level: "High" as const,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  // Medium-frequency domains
  {
    website_domain: "amazon-jobs-careers.com",
    email_domain: "amazon.hr@outlook.com",
    suspicious_phrases: ["personal information", "verification required"],
    job_title: "Warehouse Associate",
    salary_pattern: "normal" as const,
    original_risk_score: 45,
    intelligence_boost: 15,
    final_risk_score: 60,
    risk_level: "Medium" as const,
    job_text: "Warehouse Associate position at Amazon. Verification required. Please provide personal information for background check. Contact amazon.hr@outlook.com. Visit amazon-jobs-careers.com",
    job_text_hash: "demo_hash_4",
    job_text_sample: "Warehouse Associate position at Amazon. Verification required. Please provide personal information for background check.",
    threat_category: "phishing" as const,
    confidence_level: "Medium" as const,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    website_domain: "indeed-apply-now.com",
    email_domain: "careers.indeed@gmail.com",
    suspicious_phrases: ["click here", "confirm account"],
    job_title: "Marketing Coordinator",
    salary_pattern: "normal" as const,
    original_risk_score: 40,
    intelligence_boost: 10,
    final_risk_score: 50,
    risk_level: "Medium" as const,
    job_text: "Marketing Coordinator position available. Click here to confirm your account and complete application. Visit indeed-apply-now.com. Email careers.indeed@gmail.com for questions.",
    job_text_hash: "demo_hash_5",
    job_text_sample: "Marketing Coordinator position available. Click here to confirm your account and complete application.",
    threat_category: "phishing" as const,
    confidence_level: "Medium" as const,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  // Low-frequency but suspicious domains
  {
    website_domain: "linkedin-jobs-portal.net",
    email_domain: "recruiter@linkedin-jobs-portal.net",
    suspicious_phrases: ["off-platform communication"],
    job_title: "Project Manager",
    salary_pattern: "normal" as const,
    original_risk_score: 35,
    intelligence_boost: 5,
    final_risk_score: 40,
    risk_level: "Medium" as const,
    job_text: "Project Manager needed. Off-platform communication required. Contact recruiter@linkedin-jobs-portal.net. Visit linkedin-jobs-portal.net for details.",
    job_text_hash: "demo_hash_6",
    job_text_sample: "Project Manager needed. Off-platform communication required.",
    threat_category: "fake_job" as const,
    confidence_level: "Low" as const,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  // Recent high-risk activities
  {
    website_domain: "work-from-home-today.com",
    email_domain: "apply.now@work-from-home-today.com",
    suspicious_phrases: ["unlimited earning", "start today"],
    job_title: "Virtual Assistant",
    salary_pattern: "high_unrealistic" as const,
    original_risk_score: 70,
    intelligence_boost: 20,
    final_risk_score: 90,
    risk_level: "High" as const,
    job_text: "Virtual Assistant position with unlimited earning potential. Start today! No experience needed. Apply now at work-from-home-today.com. Contact apply.now@work-from-home-today.com",
    job_text_hash: "demo_hash_7",
    job_text_sample: "Virtual Assistant position with unlimited earning potential. Start today! No experience needed.",
    threat_category: "financial_scam" as const,
    confidence_level: "High" as const,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  },
  {
    website_domain: "urgent-hiring-247.com",
    email_domain: "urgent.hiring@gmail.com",
    suspicious_phrases: ["limited positions", "immediate start"],
    job_title: "Sales Representative",
    salary_pattern: "high_unrealistic" as const,
    original_risk_score: 75,
    intelligence_boost: 15,
    final_risk_score: 90,
    risk_level: "High" as const,
    job_text: "Sales Representative - Immediate start! Limited positions available. Earn $3000+ weekly. Contact urgent.hiring@gmail.com. Visit urgent-hiring-247.com",
    job_text_hash: "demo_hash_8",
    job_text_sample: "Sales Representative - Immediate start! Limited positions available. Earn $3000+ weekly.",
    threat_category: "fake_job" as const,
    confidence_level: "High" as const,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  // Identity theft attempts
  {
    website_domain: "secure-job-verification.com",
    email_domain: "verification@secure-job-verification.com",
    suspicious_phrases: ["passport copy", "bank account", "identity verification"],
    job_title: "Security Guard",
    salary_pattern: "normal" as const,
    original_risk_score: 60,
    intelligence_boost: 25,
    final_risk_score: 85,
    risk_level: "High" as const,
    job_text: "Security Guard position available. Identity verification required. Please provide passport copy and bank account details. Contact verification@secure-job-verification.com. Visit secure-job-verification.com",
    job_text_hash: "demo_hash_9",
    job_text_sample: "Security Guard position available. Identity verification required. Please provide passport copy and bank account details.",
    threat_category: "identity_theft" as const,
    confidence_level: "High" as const,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
  },
  // Additional varied threats
  {
    website_domain: "remote-work-pro.com",
    email_domain: "info@remote-work-pro.com",
    suspicious_phrases: ["buy equipment", "training fee"],
    job_title: "Content Writer",
    salary_pattern: "low_unrealistic" as const,
    original_risk_score: 50,
    intelligence_boost: 10,
    final_risk_score: 60,
    risk_level: "Medium" as const,
    job_text: "Content Writer needed for remote work. Must purchase own equipment. Training fee of $100 required. Contact info@remote-work-pro.com. Visit remote-work-pro.com",
    job_text_hash: "demo_hash_10",
    job_text_sample: "Content Writer needed for remote work. Must purchase own equipment. Training fee of $100 required.",
    threat_category: "financial_scam" as const,
    confidence_level: "Medium" as const,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  }
];

async function seedThreatIntelligenceData(): Promise<void> {
  try {
    logger.info("Starting threat intelligence data seeding...");

    // Clear existing demo data (optional - uncomment if you want to start fresh)
    // await ThreatLog.deleteMany({});

    // Insert demo data
    const insertedDocs = await ThreatLog.insertMany(DEMO_THREAT_DATA);

    logger.info("Threat intelligence data seeded successfully", {
      recordsInserted: insertedDocs.length,
      topDomains: [...new Set(DEMO_THREAT_DATA.map(d => d.website_domain).filter(Boolean))],
      topPhrases: [...new Set(DEMO_THREAT_DATA.flatMap(d => d.suspicious_phrases))],
      threatCategories: [...new Set(DEMO_THREAT_DATA.map(d => d.threat_category).filter(Boolean))]
    });

    // Log summary statistics
    const domainCounts = DEMO_THREAT_DATA.reduce((acc, item) => {
      if (item.website_domain) {
        acc[item.website_domain] = (acc[item.website_domain] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const phraseCounts = DEMO_THREAT_DATA.reduce((acc, item) => {
      item.suspicious_phrases.forEach(phrase => {
        acc[phrase] = (acc[phrase] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    logger.info("Demo Data Summary:", {
      totalRecords: DEMO_THREAT_DATA.length,
      domainFrequencies: domainCounts,
      phraseFrequencies: phraseCounts,
      highRiskCount: DEMO_THREAT_DATA.filter(d => d.risk_level as string === "High").length,
      mediumRiskCount: DEMO_THREAT_DATA.filter(d => d.risk_level as string === "Medium").length,
      lowRiskCount: DEMO_THREAT_DATA.filter(d => d.risk_level as string === "Low").length,
    });

    console.log("\n🎯 THREAT INTELLIGENCE DEMO DATA SEEDED SUCCESSFULLY!");
    console.log(`📊 Total Records: ${DEMO_THREAT_DATA.length}`);
    console.log(`🔥 High Risk: ${DEMO_THREAT_DATA.filter(d => d.risk_level as string === "High").length}`);
    console.log(`⚠️ Medium Risk: ${DEMO_THREAT_DATA.filter(d => d.risk_level as string === "Medium").length}`);
    console.log(`✅ Low Risk: ${DEMO_THREAT_DATA.filter(d => d.risk_level as string === "Low").length}`);
    console.log("\n🌐 Top Scam Domains:");
    Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([domain, count]) => {
        console.log(`   ${domain}: ${count} reports`);
      });
    
    console.log("\n💬 Common Scam Phrases:");
    Object.entries(phraseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([phrase, count]) => {
        console.log(`   "${phrase}": ${count} times`);
      });

  } catch (error) {
    logger.error("Error seeding threat intelligence data", { error });
    console.error("❌ Failed to seed threat intelligence data:", error);
    process.exit(1);
  }
}

// Connect to database and seed data
async function main(): Promise<void> {
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.mongoUri;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB for seeding");

    // Seed the data
    await seedThreatIntelligenceData();

    // Close connection
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
    
    console.log("\n✅ Threat intelligence seeding completed!");
    console.log("🚀 Your JobShield AI system now has realistic threat intelligence data for demo purposes.");
    
  } catch (error) {
    logger.error("Failed to connect to database", { error });
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  main();
}

export { seedThreatIntelligenceData };
