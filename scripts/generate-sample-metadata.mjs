import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const now = new Date().toISOString();

const metadata = {
  name: "Product NFT - Turbine Blade CLX-2026-001",
  description: "IOTA Digital Product Passport for a manufactured turbine blade.",
  serialNumber: "CLX-2026-001",
  manufacturer: "Foundry ABC",
  materialBatch: "IN718-HEAT-45678",
  heatNumber: "HT-2026-089",
  nftKind: "Product",
  currentLifecycleStage: "ManufacturingAndInspection",
  createdAt: now,
  updatedAt: now,
  physicalBinding: {
    qrPayload: "iota-dpp://1076/0xCONTRACT/1",
    nfcTagId: "NFC-UFG-0001",
    machineId: "CNC-MACHINE-01"
  },
  semantic: {
    ontologyUri: "ipfs://replace-with-ontology-cid",
    rdfClass: "ManufacturingComponent",
    knowledgeGraphNode: "urn:ufg:dpp:CLX-2026-001",
    reasoningResultUri: "ipfs://replace-with-reasoning-result-cid"
  },
  analytics: {
    modelVersion: "rul-model-v0.1",
    remainingUsefulLife: 0.87,
    anomalyScore: 0.06,
    rootCause: "No defect detected",
    recommendation: "Continue manufacturing cycle"
  },
  metaverseValidation: {
    scenarioId: "DT-SIM-2026-001",
    result: "Approved",
    riskScore: 0.08,
    artifactUri: "ipfs://replace-with-metaverse-validation-cid"
  },
  history: [
    {
      eventType: "ManufacturingStep",
      timestamp: now,
      artifactUri: "ipfs://replace-with-process-report-cid",
      artifactHash: "0xreplace",
      submittedBy: "0x0000000000000000000000000000000000000000"
    }
  ]
};

const body = JSON.stringify(metadata, null, 2);
const digest = createHash("sha256").update(body).digest("hex");

await mkdir("generated", { recursive: true });
await writeFile(join("generated", "sample-dpp-metadata.json"), body);
await writeFile(join("generated", "sample-dpp-metadata.sha256"), `${digest}\n`);

console.log(`Wrote generated/sample-dpp-metadata.json`);
console.log(`SHA-256: ${digest}`);

