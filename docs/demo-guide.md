# Demo Guide

## Demonstration Story

The demo follows a manufactured turbine blade through its lifecycle:

1. Foundry mints a Product NFT.
2. Foundry records raw material and manufacturing process steps.
3. Quality team records inspection evidence.
4. OEM transfers custody through supply chain.
5. AI team publishes prognosis and diagnosis output.
6. Ontology team links semantic reasoning.
7. Metaverse team records validation before execution.
8. Regulator or authorized actor decommissions the component at end of life.

## Local Demo

```bash
npm install
npm run compile
npm test
npm run metadata:sample
npm run dev
```

## Suggested Evaluation Checklist

- NFT is minted with correct kind and serial number.
- Metadata URI resolves to structured DPP JSON.
- Lifecycle transition follows the valid state machine.
- Unauthorized wallet calls revert.
- End-of-life NFT cannot be modified.
- Process, semantic, and metaverse events are visible in transaction logs.

