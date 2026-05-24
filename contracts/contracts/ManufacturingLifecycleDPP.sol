// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract ManufacturingLifecycleDPP is ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant FOUNDRY_ROLE = keccak256("FOUNDRY_ROLE");
    bytes32 public constant OEM_ROLE = keccak256("OEM_ROLE");
    bytes32 public constant MRO_ROLE = keccak256("MRO_ROLE");
    bytes32 public constant QUALITY_ROLE = keccak256("QUALITY_ROLE");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");

    enum PassportKind {
        Product,
        Machine,
        Maintenance,
        Quality,
        Skill,
        SupplyChain,
        Carbon
    }

    enum LifecycleStage {
        RawMaterial,
        ManufacturingInspection,
        QualityAssurance,
        SupplyChain,
        InService,
        Maintenance,
        EndOfLife
    }

    struct Passport {
        PassportKind kind;
        LifecycleStage stage;
        uint256 parentTokenId;
        string serialNumber;
        string manufacturer;
        string materialBatch;
        string heatNumber;
        bytes32 latestDataHash;
        bool exists;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => Passport) private _passports;
    mapping(uint256 => uint256[]) private _children;

    event PassportMinted(
        uint256 indexed tokenId,
        address indexed owner,
        PassportKind indexed kind,
        string serialNumber,
        uint256 parentTokenId,
        string tokenUri,
        bytes32 dataHash
    );
    event LifecycleStageChanged(
        uint256 indexed tokenId,
        LifecycleStage indexed oldStage,
        LifecycleStage indexed newStage,
        bytes32 evidenceHash,
        string evidenceUri
    );
    event MetadataUpdated(
        uint256 indexed tokenId,
        string tokenUri,
        bytes32 dataHash,
        string reason
    );
    event ProcessStepRecorded(
        uint256 indexed tokenId,
        string processCode,
        bytes32 evidenceHash,
        string evidenceUri
    );
    event MaintenanceRecorded(
        uint256 indexed tokenId,
        string maintenanceCode,
        bytes32 evidenceHash,
        string evidenceUri
    );
    event QualityRecorded(
        uint256 indexed tokenId,
        string certificateCode,
        bytes32 evidenceHash,
        string evidenceUri
    );
    event SemanticResultRecorded(
        uint256 indexed tokenId,
        bytes32 reasoningHash,
        string ontologyUri,
        string resultUri
    );
    event MetaverseValidationRecorded(
        uint256 indexed tokenId,
        bytes32 validationHash,
        string scenarioId,
        string resultUri
    );

    error PassportNotFound(uint256 tokenId);
    error PassportFrozen(uint256 tokenId);
    error InvalidTransition(LifecycleStage fromStage, LifecycleStage toStage);
    error ParentPassportRequired();

    constructor(address admin) ERC721("IOTA Manufacturing Lifecycle DPP", "IOTADPP") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FOUNDRY_ROLE, admin);
        _grantRole(OEM_ROLE, admin);
        _grantRole(MRO_ROLE, admin);
        _grantRole(QUALITY_ROLE, admin);
        _grantRole(REGULATOR_ROLE, admin);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mintPassport(
        address to,
        PassportKind kind,
        uint256 parentTokenId,
        string calldata serialNumber,
        string calldata manufacturer,
        string calldata materialBatch,
        string calldata heatNumber,
        string calldata tokenUri,
        bytes32 dataHash
    ) external whenNotPaused onlyRole(FOUNDRY_ROLE) returns (uint256 tokenId) {
        if (parentTokenId != 0 && !_passports[parentTokenId].exists) {
            revert ParentPassportRequired();
        }

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        _passports[tokenId] = Passport({
            kind: kind,
            stage: LifecycleStage.RawMaterial,
            parentTokenId: parentTokenId,
            serialNumber: serialNumber,
            manufacturer: manufacturer,
            materialBatch: materialBatch,
            heatNumber: heatNumber,
            latestDataHash: dataHash,
            exists: true
        });

        if (parentTokenId != 0) {
            _children[parentTokenId].push(tokenId);
        }

        emit PassportMinted(
            tokenId,
            to,
            kind,
            serialNumber,
            parentTokenId,
            tokenUri,
            dataHash
        );
    }

    function transitionLifecycle(
        uint256 tokenId,
        LifecycleStage newStage,
        bytes32 evidenceHash,
        string calldata evidenceUri
    ) external whenNotPaused onlyLifecycleActor(newStage) {
        Passport storage passportRef = _requireLivePassport(tokenId);
        LifecycleStage oldStage = passportRef.stage;

        if (!_isValidTransition(oldStage, newStage)) {
            revert InvalidTransition(oldStage, newStage);
        }

        passportRef.stage = newStage;
        emit LifecycleStageChanged(tokenId, oldStage, newStage, evidenceHash, evidenceUri);
    }

    function updateMetadata(
        uint256 tokenId,
        string calldata tokenUri,
        bytes32 dataHash,
        string calldata reason
    ) external whenNotPaused onlyRole(OEM_ROLE) {
        Passport storage passportRef = _requireLivePassport(tokenId);
        passportRef.latestDataHash = dataHash;
        _setTokenURI(tokenId, tokenUri);
        emit MetadataUpdated(tokenId, tokenUri, dataHash, reason);
    }

    function recordProcessStep(
        uint256 tokenId,
        string calldata processCode,
        bytes32 evidenceHash,
        string calldata evidenceUri
    ) external whenNotPaused onlyRole(FOUNDRY_ROLE) {
        _requireLivePassport(tokenId);
        emit ProcessStepRecorded(tokenId, processCode, evidenceHash, evidenceUri);
    }

    function recordMaintenance(
        uint256 tokenId,
        string calldata maintenanceCode,
        bytes32 evidenceHash,
        string calldata evidenceUri
    ) external whenNotPaused onlyRole(MRO_ROLE) {
        _requireLivePassport(tokenId);
        emit MaintenanceRecorded(tokenId, maintenanceCode, evidenceHash, evidenceUri);
    }

    function recordQuality(
        uint256 tokenId,
        string calldata certificateCode,
        bytes32 evidenceHash,
        string calldata evidenceUri
    ) external whenNotPaused onlyRole(QUALITY_ROLE) {
        _requireLivePassport(tokenId);
        emit QualityRecorded(tokenId, certificateCode, evidenceHash, evidenceUri);
    }

    function recordSemanticResult(
        uint256 tokenId,
        bytes32 reasoningHash,
        string calldata ontologyUri,
        string calldata resultUri
    ) external whenNotPaused onlyRole(OEM_ROLE) {
        _requireLivePassport(tokenId);
        emit SemanticResultRecorded(tokenId, reasoningHash, ontologyUri, resultUri);
    }

    function recordMetaverseValidation(
        uint256 tokenId,
        bytes32 validationHash,
        string calldata scenarioId,
        string calldata resultUri
    ) external whenNotPaused onlyRole(OEM_ROLE) {
        _requireLivePassport(tokenId);
        emit MetaverseValidationRecorded(tokenId, validationHash, scenarioId, resultUri);
    }

    function passport(uint256 tokenId) external view returns (Passport memory) {
        if (!_passports[tokenId].exists) revert PassportNotFound(tokenId);
        return _passports[tokenId];
    }

    function childTokenIds(uint256 tokenId) external view returns (uint256[] memory) {
        if (!_passports[tokenId].exists) revert PassportNotFound(tokenId);
        return _children[tokenId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    modifier onlyLifecycleActor(LifecycleStage newStage) {
        if (newStage == LifecycleStage.ManufacturingInspection) {
            _checkRole(FOUNDRY_ROLE);
        } else if (newStage == LifecycleStage.QualityAssurance) {
            _checkRole(QUALITY_ROLE);
        } else if (newStage == LifecycleStage.Maintenance) {
            _checkRole(MRO_ROLE);
        } else if (newStage == LifecycleStage.EndOfLife) {
            _checkRole(REGULATOR_ROLE);
        } else {
            _checkRole(OEM_ROLE);
        }
        _;
    }

    function _requireLivePassport(uint256 tokenId) private view returns (Passport storage) {
        Passport storage passportRef = _passports[tokenId];
        if (!passportRef.exists) revert PassportNotFound(tokenId);
        if (passportRef.stage == LifecycleStage.EndOfLife) revert PassportFrozen(tokenId);
        return passportRef;
    }

    function _isValidTransition(LifecycleStage fromStage, LifecycleStage toStage)
        private
        pure
        returns (bool)
    {
        if (fromStage == LifecycleStage.RawMaterial) {
            return toStage == LifecycleStage.ManufacturingInspection;
        }
        if (fromStage == LifecycleStage.ManufacturingInspection) {
            return toStage == LifecycleStage.QualityAssurance;
        }
        if (fromStage == LifecycleStage.QualityAssurance) {
            return toStage == LifecycleStage.SupplyChain;
        }
        if (fromStage == LifecycleStage.SupplyChain) {
            return toStage == LifecycleStage.InService;
        }
        if (fromStage == LifecycleStage.InService) {
            return toStage == LifecycleStage.Maintenance || toStage == LifecycleStage.EndOfLife;
        }
        if (fromStage == LifecycleStage.Maintenance) {
            return toStage == LifecycleStage.InService || toStage == LifecycleStage.EndOfLife;
        }
        return false;
    }
}
