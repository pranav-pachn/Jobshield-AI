export const AgentTools = [
  {
    type: "function",
    function: {
      name: "search_threat_knowledge",
      description: "Search the Threat Knowledge Base for historical scam patterns or specific keywords related to the job description.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query (e.g. 'registration fee scam' or a snippet of the job description). Do NOT pass raw MongoDB queries."
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_url",
      description: "Check if a domain or URL associated with the job or company is suspicious.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The domain or URL to analyze (e.g., 'careers-google.com')."
          }
        },
        required: ["url"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_recruiter",
      description: "Analyze the recruiter's email address or contact information for anomalies (e.g., generic domains, mismatch with company).",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The email address of the recruiter."
          }
        },
        required: ["email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "find_similar_cases",
      description: "Find historically similar job analyses that have been processed by the system to see if this exact job was previously flagged.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search phrase for finding similar historical analyses."
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_threat_record",
      description: "Retrieve a specific threat intelligence record by its ID to get detailed evidence.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The MongoDB ID of the threat record."
          }
        },
        required: ["id"]
      }
    }
  }
];
