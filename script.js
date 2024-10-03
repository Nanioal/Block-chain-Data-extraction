import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: "JMG1NF4CVDFumWOmpLY_h_ecWoCbewqt",
  network: Network.ARB_MAINNET,
};

const alchemy = new Alchemy(settings);

const main = async () => {
  let logs = await alchemy.core.getLogs({
    address: "0x82aF49447d8a07e3bd95BD0d56f35241523fBab1",
    fromBlock: "0x100000",
    toBlock: "0x1007D0",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    ]
  });
  console.log(logs);
};

main();