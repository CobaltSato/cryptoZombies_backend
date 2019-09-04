const Sample = artifacts.require("./zombieownership.sol");

module.exports = function(deployer){
    deployer.deploy(Sample);
}
