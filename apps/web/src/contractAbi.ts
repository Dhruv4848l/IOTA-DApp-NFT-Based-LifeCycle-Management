export const manufacturingLifecycleDppAbi = [
  "function mintPassport(address to,uint8 kind,uint256 parentTokenId,string serialNumber,string manufacturer,string materialBatch,string heatNumber,string tokenUri,bytes32 dataHash) returns (uint256)",
  "function transitionLifecycle(uint256 tokenId,uint8 newStage,bytes32 evidenceHash,string evidenceUri)",
  "function updateMetadata(uint256 tokenId,string tokenUri,bytes32 dataHash,string reason)",
  "function recordProcessStep(uint256 tokenId,string processCode,bytes32 evidenceHash,string evidenceUri)",
  "function recordMaintenance(uint256 tokenId,string maintenanceCode,bytes32 evidenceHash,string evidenceUri)",
  "function recordQuality(uint256 tokenId,string certificateCode,bytes32 evidenceHash,string evidenceUri)",
  "function recordSemanticResult(uint256 tokenId,bytes32 reasoningHash,string ontologyUri,string resultUri)",
  "function recordMetaverseValidation(uint256 tokenId,bytes32 validationHash,string scenarioId,string resultUri)",
  "function passport(uint256 tokenId) view returns (uint8 kind,uint8 stage,uint256 parentTokenId,string serialNumber,string manufacturer,string materialBatch,string heatNumber,bytes32 latestDataHash,bool exists)",
  "event PassportMinted(uint256 indexed tokenId,address indexed owner,uint8 indexed kind,string serialNumber,uint256 parentTokenId,string tokenUri,bytes32 dataHash)",
  "event LifecycleStageChanged(uint256 indexed tokenId,uint8 indexed oldStage,uint8 indexed newStage,bytes32 evidenceHash,string evidenceUri)"
] as const;

