const Token = artifacts.require('Token');
const Timelock = artifacts.require('Timelock');
const Governance = artifacts.require('Governance');
const Treasury = artifacts.require('Treasury');

module.exports = async function (deployer) {
    const [executor, voter1, voter2, voter3, voter4, voter5] = await web3.eth.getAccounts();

    const name = "Polygon DAO Token";
    const symbol = "PDT";

    await deployer.deploy(Token, name, symbol);
    const token = await Token.deployed();

    await token.mint(executor, 0, {from: deployer});
    await token.mint(voter1, 1, {from: deployer});
    await token.mint(voter2, 2, {from: deployer});
    await token.mint(voter3, 3, {from: deployer});
    await token.mint(voter4, 4, {from: deployer});
    await token.mint(voter5, 5, {from: deployer});


    // Deploy timelock
    const minDelay = 1;


    await deployer.deploy(Timelock, minDelay, [executor], [executor]);
    const timelock = Timelock.deployed();


    // Deploy Governance
    const quorum = 1;
    const votingDelay = 0;
    const votingPeriod = 10;

    await deployer.deploy(Governance, token.address, quorum, votingDelay, votingPeriod);
    const governance = await Governance.deployed();

    // Deploy Treasury

    // Timelock contract will be the owner of our treasury contract.
    // In the provided example, once the proposal is successful and executed,
    // timelock contract will be responsible for calling the function.

    const funds = web3.utils.toWei('50', 'ether')

    await deployer.deploy(Treasury, executor, { value: funds })
    const treasury = await Treasury.deployed()

    await treasury.transferOwnership(timelock.address, { from: executor })

    // Assign roles

    const proposerRole = await timelock.PROPOSER_ROLE()
    const executorRole = await timelock.EXECUTOR_ROLE()

    await timelock.grantRole(proposerRole, governance.address, { from: executor })
    await timelock.grantRole(executorRole, governance.address, { from: executor })


}