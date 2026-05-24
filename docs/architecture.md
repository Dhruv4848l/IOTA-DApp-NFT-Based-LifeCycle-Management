# System Architecture

## Design Principle

The NFT layer is a trust anchor, not a replacement for the IIoT, AI, ontology, or metaverse layers. It stores durable identifiers, lifecycle states, hashes, and content-addressed references so every critical manufacturing event can be independently verified.

## Components

| Component | Responsibility |
| --- | --- |
| React dApp | User interface for wallet connection, NFT minting, lifecycle update, and verification. |
| IOTA EVM contract | ERC-721 lifecycle passport, role enforcement, stage transitions, and audit events. |
| IPFS-compatible storage | Stores detailed JSON metadata, reports, certificates, and semantic references. |
| Analytics adapter | Publishes prognosis and diagnosis result hashes into the NFT record. |
| Ontology adapter | Links RDF/OWL/knowledge graph resources to the asset passport. |
| Metaverse adapter | Records validation result URI and approval hash before physical action. |

## Data Flow

1. A physical component or machine is registered by the foundry/OEM.
2. The dApp uploads structured metadata to IPFS-compatible storage.
3. The contract mints a DPP NFT with the metadata URI and hash.
4. Lifecycle events update token metadata and emit immutable audit events.
5. Analytics, semantic, and metaverse layers attach signed result records.
6. Final validated actions can be used by the physical machine team for the next cycle.

## Trust Model

- **Wallet identity:** every write action is tied to a signer address.
- **Role authorization:** only approved actors can perform sensitive actions.
- **Content addressing:** metadata hash changes if content changes.
- **Event history:** blockchain events provide immutable auditability.
- **Lifecycle guards:** invalid lifecycle jumps are rejected by the contract.

