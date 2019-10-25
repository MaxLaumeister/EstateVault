const LockBoxController = artifacts.require("LockBoxController");
const ERC20Mintable = artifacts.require("ERC20Mintable");
const ERC721Mintable = artifacts.require("ERC721Mintable");

module.exports = function(deployer) {
  deployer.deploy(LockBoxController);
  deployer.deploy(ERC20Mintable);
  deployer.deploy(ERC721Mintable);
};
