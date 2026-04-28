#!/bin/bash

# Threat Intelligence Data Seeder
# 
# This script seeds the ThreatLog collection with demo data
# for hackathon presentation purposes.

echo "🚀 Starting Threat Intelligence Data Seeding..."
echo "📊 This will create realistic demo data for your dashboard."
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the seeder
echo "🌱 Seeding threat intelligence data..."
npx ts-node scripts/seedThreatIntelligenceData.ts

echo ""
echo "✅ Threat Intelligence seeding completed!"
echo "🎯 Your dashboard now has realistic data including:"
echo "   • Top scam domains with report counts"
echo "   • Common suspicious phrases"
echo "   • Recent high-risk activities"
echo "   • Various threat categories"
echo ""
echo "🔄 Restart your backend server to see the data in the dashboard!"
echo "📱 Visit http://localhost:3001/dashboard to view the threat intelligence"
