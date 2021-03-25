const delay = require('delay');
const { makeRequest, getPricer } = require('./band');

(async () => {
  const symbols = ['BTC', 'ETH'];

  // Request data from BandChain
  console.log('---Requesting Data from BandChain---');
  console.log('Requesting prices of: ' + symbols.toString());
  const requestID = await makeRequest(symbols);
  console.log(
    `Price data requested with ID: ${requestID} (https://cosmoscan.io/request/${requestID})`
  );

  // Wait for request to resolve
  await delay(20000);

  await getPricer(symbols);
})();
