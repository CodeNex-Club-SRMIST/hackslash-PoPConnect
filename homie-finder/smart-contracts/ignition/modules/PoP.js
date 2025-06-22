const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const PoPBadgeModule = buildModule("PoPBadgeModule", (m) => {
  // Deploy the PoPBadge contract
  const popBadge = m.contract("PoPBadge");

  // Log deployment information
  m.call(popBadge, "name", [], { id: "getContractName" });
  m.call(popBadge, "symbol", [], { id: "getContractSymbol" });

  return { popBadge };
});

module.exports = PoPBadgeModule; 