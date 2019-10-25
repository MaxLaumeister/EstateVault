const ERC20Mintable = artifacts.require("ERC20Mintable");
const ERC721Mintable = artifacts.require("ERC721Mintable");
const VaultManager = artifacts.require("VaultManager");

module.exports = function(deployer) {
  deployer.deploy(ERC20Mintable);
  deployer.deploy(ERC721Mintable);
  deployer.deploy(VaultManager);
};
