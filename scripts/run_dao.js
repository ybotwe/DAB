const Token = artifacts.require("Token")
const Timelock = artifacts.require("Timelock")
const Governance = artifacts.require("Governance")
const Treasury = artifacts.require("Treasury")

module.exports = async function (callback) {

    const [executor, voter1, voter2, voter3, voter4, voter5] = await web3.eth.getAccounts()

    let funds, blockNumber, proposalState, vote

    const amount = web3.utils.toWei('1', 'ether')

    const token = await Token.deployed()
    await token.delegate(voter1, { from: voter1 })
    await token.delegate(voter2, { from: voter2 })
    await token.delegate(voter3, { from: voter3 })
    await token.delegate(voter4, { from: voter4 })
    await token.delegate(voter5, { from: voter5 })

    const treasury = await Treasury.deployed()

    funds = await web3.eth.getBalance(treasury.address)
    console.log(`Funds in treasury: ${web3.utils.fromWei(funds.toString(), 'ether')} ETH\n`)

    const governance = await Governance.deployed()
    const encodedFunction = await treasury.contract.methods.releaseFunds(web3.utils.toWei('10', 'ether')).encodeABI()
    const description = "Release Funds from Treasury to buy stuff for the community"

    const tx = await governance.propose([treasury.address], [0], [encodedFunction], description, {from: executor})

    const id = tx.logs[0].args.proposalId
    console.log(`Created Proposal: ${id.toString()}\n`)

    proposalState = await governance.state.call(id)
    console.log(`Current state of proposal: ${proposalState.toString()} \n`)

    const snapshot = await governance.proposalSnapshot.call(id)
    console.log(`Proposal created on block ${snapshot.toString()}`)

    const deadline = await governance.proposalDeadline.call(id)
    console.log(`Proposal deadline on block ${deadline.toString()}\n`)

    blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)

    const quorum = await governance.quorum(blockNumber - 1)
    console.log(`Number of votes required to pass: ${web3.utils.fromWei(quorum.toString(), 'ether')}\n`)

    // Vote
    console.log(`Casting votes...\n`)

    // 0 = Against, 1 = For, 2 = Abstain
    vote = await governance.castVote(id, 1, {from: voter1})
    vote = await governance.castVote(id, 1, {from: voter2})
    vote = await governance.castVote(id, 1, {from: voter3})
    vote = await governance.castVote(id, 0, {from: voter4})
    vote = await governance.castVote(id, 1, {from: voter5})

    proposalState = await governance.state.call(id)
    console.log(`Current state of proposal: ${proposalState.toString()} \n`)

    //This is to speed up to one block after the voting period ends
    await token.mint(voter1, 6, { from: executor })

    const { againstVotes, forVotes, abstainVotes } = await governance.proposalVotes.call(id)
    console.log(`Votes For: ${web3.utils.fromWei(forVotes.toString(), 'ether')}`)
    console.log(`Votes Against: ${web3.utils.fromWei(againstVotes.toString(), 'ether')}`)
    console.log(`Votes Abstained: ${web3.utils.fromWei(abstainVotes.toString(), 'ether')}\n`)


    blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)

    proposalState = await governance.state.call(id)
    console.log(`Current state of proposal: ${proposalState.toString()} \n`)

    //Queue
    const hash = web3.utils.sha3("Release Funds from Treasury to buy stuff for the community");
    await governance.queue([treasury.address], [0], [encodedFunction], hash, {from: executor})

    proposalState = await governance.state.call(id)
    console.log(`Current state of proposal: ${proposalState.toString()} \n`)

    // Execute
    await governance.execute([treasury.address], [0], [encodedFunction], hash, { from: executor })

    proposalState = await governance.state.call(id)
    console.log(`Current state of proposal: ${proposalState.toString()} \n`)

    funds = await web3.eth.getBalance(treasury.address)
    console.log(`Funds inside of treasury: ${web3.utils.fromWei(funds.toString(), 'ether')} ETH\n`)

    callback()


}