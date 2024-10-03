const { keccak256 } = require('ethers/lib/utils');

const eventSignatures = [
    "OpenPosition(address,address,uint256)", 
    "ClosePosition(address,address,uint256)", 
    "Liquidate(address,address,uint256)"
];

const topicHashes = eventSignatures.map(sig => keccak256(sig));

console.log("Event Topic Hashes:");
topicHashes.forEach((hash, index) => {
    console.log(`${eventSignatures[index]}: ${hash}`);
});