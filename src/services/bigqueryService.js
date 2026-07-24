import { BigQuery } from "@google-cloud/bigquery";

let bigquery = null;
const datasetId = "legal_risk_radar";
const tableId = "audit_logs";

/**
 * Initializes and retrieves the BigQuery client wrapper
 */
function getBigQueryClient() {
  if (bigquery) return bigquery;

  const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    console.warn("[BigQuery] Missing FIREBASE_SERVICE_ACCOUNT_KEY. Logging to local console only.");
    return null;
  }

  try {
    const credentials = JSON.parse(credentialsJson);
    bigquery = new BigQuery({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key
      }
    });
    return bigquery;
  } catch (error) {
    console.error("[BigQuery] Initialization error:", error.message);
    return null;
  }
}

/**
 * Streams an audit analytics event row into BigQuery.
 * Automatically checks for and creates the dataset and schema-table if missing.
 */
export async function logAuditAnalyticsEvent({ eventType, docType, riskScore, latencyMs, userType }) {
  const row = {
    timestamp: new Date().toISOString(),
    eventType: eventType || "unknown",
    docType: docType || "unknown",
    riskScore: Number(riskScore ?? 0),
    latencyMs: Number(latencyMs ?? 0),
    userType: userType || "guest"
  };

  console.log("[Audit Log Event]:", JSON.stringify(row));

  const client = getBigQueryClient();
  if (!client) {
    console.log("[BigQuery] BigQuery client unavailable. Local logging fallback complete.");
    return;
  }

  try {
    const dataset = client.dataset(datasetId);
    const table = dataset.table(tableId);

    // 1. Check/create dataset
    let datasetExists = false;
    try {
      [datasetExists] = await dataset.exists();
      if (!datasetExists) {
        console.log(`[BigQuery] Creating dataset "${datasetId}"...`);
        await dataset.create({ location: "US" });
      }
    } catch (dsError) {
      if (dsError.message?.includes("free tier") || dsError.message?.includes("Streaming insert")) {
        console.warn("[BigQuery Audit]: BigQuery Sandbox active. Event logged to server console.");
        return;
      }
    }

    // 2. Check/create table
    let tableExists = false;
    try {
      [tableExists] = await table.exists();
      if (!tableExists) {
        console.log(`[BigQuery] Creating table "${tableId}" with schema...`);
        const schema = [
          { name: "timestamp", type: "TIMESTAMP", mode: "REQUIRED" },
          { name: "eventType", type: "STRING", mode: "NULLABLE" },
          { name: "docType", type: "STRING", mode: "NULLABLE" },
          { name: "riskScore", type: "FLOAT", mode: "NULLABLE" },
          { name: "latencyMs", type: "INTEGER", mode: "NULLABLE" },
          { name: "userType", type: "STRING", mode: "NULLABLE" }
        ];
        await table.create({ schema });
      }
    } catch (tblError) {
      if (tblError.message?.includes("free tier") || tblError.message?.includes("Streaming insert")) {
        console.warn("[BigQuery Audit]: BigQuery Sandbox active. Event logged to server console.");
        return;
      }
    }

    // 3. Stream record row into table
    await table.insert([row]);
    console.log("[BigQuery] Audit log streamed successfully into BigQuery!");
  } catch (error) {
    if (error.message?.includes("free tier") || error.message?.includes("Streaming insert")) {
      console.warn("[BigQuery Audit]: BigQuery Sandbox active. Event logged to server console.");
    } else {
      console.warn("[BigQuery Log Warning]:", error.message);
    }
  }
}
