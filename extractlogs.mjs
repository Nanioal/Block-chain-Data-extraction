import fetch from 'node-fetch';
import fs from 'fs';
const ARBITRUM_API_URL=`https://arb1.arbitrum.io/rpc`; //Arbitrum Mainnet RPC URL
const GMX_V2_ADDRESS = '0xc8ee91a54287db53897056e12d9819156d3822fb';
const START_DATE = new Date('2024-07-01T00:00:00Z').getTime() / 1000; // Start date in seconds

async function getLogs() {
    try{//Get latest block number
    const latestBlockResponse = await fetch (`${ARBITRUM_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] })
    }
    ); 
    const latestBlockData= await latestBlockResponse.json();
    const latestBlock= parseInt(latestBlockData.result, 16);
    //Fetch logs from GMX V2 contract
        const logsresponse = await fetch(`${ARBITRUM_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
                fromBlock: '0x0', // Start from the genesis block, adjust as needed
                toBlock: `0x${latestBlock.toString(16)}`, // Latest block
                address: GMX_V2_ADDRESS,
                topics: [
                    // Event signatures (replace with actual event topic hashes)
                    null, //OpenPosition
                    null, //ClosePosition,
                    null, //Liquidate,
                ]
            }]
        })
    })

    const logsData= await logsresponse.json();//check if logs are returned
    if (!logsData.result){
        console.error('No logs found or an error occured:', logsData);
        return[]; //return empty array if no logs are found
    }
    return logsData.result;
} catch (error){
    console.error('Error fetching logs: ', error);
    return[];
    }
    }

async function processLogs() {
    const logs = await getLogs();
    const processedLogs = logs.map(log => ({
        blockNumber: parseInt(log.blockNumber, 16),
        eventName: determineEventName(log.topics[0]), // You'll need to implement this function
        traderAddress: log.topics[1], // Adjust based on event structure
        assetInvolved: log.topics[2], // Adjust based on event structure
        amounts: {
            collateral: log.data, // Adjust based on event structure
            transactionQuantity: log.data // Adjust based on event structure
        },
        timestamp: parseInt(log.timestamp, 16)
    }));

    console.log(JSON.stringify(processedLogs, null, 2));

    const filteredLogs = processedLogs.filter(log => log.timestamp >= START_DATE);

    // Generate summary
    const summary = filteredLogs.reduce((acc, log) => {
        acc[log.eventName] = (acc[log.eventName] || 0) + 1;
        return acc;
    }, {});

    console.log('Summary of Findings:', summary);

    // Notable trends or insights
    const totalEvents = Object.values(summary).reduce((sum, count) => sum + count, 0);
    console.log(`Total events from July 1, 2024, to latest block: ${totalEvents}`);

    // Analyze trends
    if (summary.OpenPosition > summary.ClosePosition) {
        console.log('Trend: More OpenPosition events than ClosePosition events, indicating increased trading activity.');
    } else if (summary.ClosePosition > summary.OpenPosition) {
        console.log('Trend: More ClosePosition events than OpenPosition events, indicating a possible market correction.');
    }

    // Additional insights can be added here

    // Write to CSV
    const csvOutput = filteredLogs.map(log =>
        `${log.blockNumber},${log.eventName},${log.traderAddress},${log.assetInvolved},${log.amounts.collateral},${log.amounts.transactionQuantity}`
    ).join('\n');

    fs.writeFileSync('output.csv', `Block Number,Event Name,Trader Address,Asset Involved,Collateral,Transaction Quantity\n${csvOutput}`);
    console.log('Data written to output.csv');
}

function determineEventName(topic) {
    // Map topics to event names
    const eventMap = {
        '0x...': 'OpenPosition',  // Replace with actual topic hash
        '0x...': 'ClosePosition', // Replace with actual topic hash
        '0x...': 'Liquidate'      // Replace with actual topic hash
    };
    return eventMap[topic] || 'Unknown';
}

processLogs();
