# Metadata and Semantic Model

## Metadata Strategy

The contract stores only the compact trust anchor:

- token ID
- owner
- NFT kind
- lifecycle stage
- parent token ID
- latest metadata URI
- latest metadata hash
- blockchain event history

The full Digital Product Passport is stored off-chain using an IPFS-compatible content URI.

## Core Metadata Fields

```json
{
  "name": "Product NFT - Turbine Blade CLX-2026-001",
  "description": "IOTA Digital Product Passport for a manufactured component",
  "serialNumber": "CLX-2026-001",
  "manufacturer": "Foundry ABC",
  "materialBatch": "IN718-HEAT-45678",
  "heatNumber": "HT-2026-089",
  "currentLifecycleStage": "ManufacturingAndInspection",
  "semantic": {
    "ontologyUri": "ipfs://...",
    "rdfClass": "ManufacturingComponent",
    "knowledgeGraphNode": "urn:ufg:dpp:CLX-2026-001"
  }
}
```

## Semantic Integration

The ontology and semantic layer can use the NFT as a durable identifier. Recommended mappings:

- `tokenId` maps to a knowledge graph node.
- `serialNumber` maps to the physical asset identifier.
- `latestDataHash` verifies the current metadata document.
- `semantic.ontologyUri` points to OWL/RDF definitions.
- `semantic.reasoningResultUri` points to explainable reasoning output.

## Analytics Result Binding

Analytics results should be stored as structured metadata and hashed before being recorded on-chain:

- remaining useful life score
- anomaly class
- confidence score
- root cause label
- recommended action
- model version
- input data hash

## Metaverse Validation Binding

Before a recommendation is applied to a physical machine, the metaverse layer should append:

- simulation scenario ID
- validation result
- risk score
- approved parameter changes
- validator address or organization
- validation artifact URI

