import { expect } from "chai";
import { ethers } from "hardhat";

describe("ManufacturingLifecycleDPP", function () {
  async function deployFixture() {
    const [admin, foundry, quality, oem, mro, regulator, user] =
      await ethers.getSigners();
    const factory = await ethers.getContractFactory("ManufacturingLifecycleDPP");
    const contract = await factory.deploy(admin.address);
    await contract.waitForDeployment();

    await contract.grantRole(await contract.FOUNDRY_ROLE(), foundry.address);
    await contract.grantRole(await contract.QUALITY_ROLE(), quality.address);
    await contract.grantRole(await contract.OEM_ROLE(), oem.address);
    await contract.grantRole(await contract.MRO_ROLE(), mro.address);
    await contract.grantRole(await contract.REGULATOR_ROLE(), regulator.address);

    return { contract, admin, foundry, quality, oem, mro, regulator, user };
  }

  it("mints a product passport and stores core fields", async function () {
    const { contract, foundry, user } = await deployFixture();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("metadata-v1"));

    await expect(
      contract
        .connect(foundry)
        .mintPassport(
          user.address,
          0,
          0,
          "CLX-2026-001",
          "Foundry ABC",
          "IN718-HEAT-45678",
          "HT-2026-089",
          "ipfs://metadata",
          hash
        )
    ).to.emit(contract, "PassportMinted");

    const passport = await contract.passport(1);
    expect(passport.serialNumber).to.equal("CLX-2026-001");
    expect(passport.stage).to.equal(0);
    expect(await contract.ownerOf(1)).to.equal(user.address);
  });

  it("enforces lifecycle transition order", async function () {
    const { contract, foundry, oem, user } = await deployFixture();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("metadata-v1"));

    await contract
      .connect(foundry)
      .mintPassport(user.address, 0, 0, "CLX-2026-001", "Foundry ABC", "", "", "ipfs://metadata", hash);

    await expect(
      contract.connect(oem).transitionLifecycle(1, 4, hash, "ipfs://evidence")
    ).to.be.revertedWithCustomError(contract, "InvalidTransition");
  });

  it("freezes records at end of life", async function () {
    const { contract, foundry, quality, oem, mro, regulator, user } =
      await deployFixture();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("metadata-v1"));

    await contract
      .connect(foundry)
      .mintPassport(user.address, 0, 0, "CLX-2026-001", "Foundry ABC", "", "", "ipfs://metadata", hash);
    await contract.connect(foundry).transitionLifecycle(1, 1, hash, "ipfs://mfg");
    await contract.connect(quality).transitionLifecycle(1, 2, hash, "ipfs://qa");
    await contract.connect(oem).transitionLifecycle(1, 3, hash, "ipfs://supply");
    await contract.connect(oem).transitionLifecycle(1, 4, hash, "ipfs://service");
    await contract.connect(mro).transitionLifecycle(1, 5, hash, "ipfs://maintenance");
    await contract.connect(regulator).transitionLifecycle(1, 6, hash, "ipfs://eol");

    await expect(
      contract.connect(oem).updateMetadata(1, "ipfs://metadata-v2", hash, "late update")
    ).to.be.revertedWithCustomError(contract, "PassportFrozen");
  });
});

