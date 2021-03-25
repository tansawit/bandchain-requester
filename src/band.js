const delay = require('delay');
const axios = require('axios').default;
const { Client, Wallet, Transaction, Message, Obi } = require('@bandprotocol/bandchain.js');

const { PrivateKey } = Wallet;
const { MsgRequest } = Message;

// BandChain mainnet REST endpoint
const rpcURL = 'https://rpc.bandchain.org';
const client = new Client(rpcURL);

const privateKey = PrivateKey.fromMnemonic(
  'subject economy equal whisper turn boil guard giraffe stick retreat wealth card only buddy joy leave genuine resemble submit ghost top polar adjust avoid'
);

const pubKey = privateKey.toPubkey();
const address = pubKey.toAddress();

// Standard Dataset Schema
const obi = new Obi('{symbols: [string], multiplier: u64}/{rates: [u64]}');

// Get Data Request Calldata
function getCalldata(symbols) {
  const multiplier = 1000000000;
  const input = { symbols: symbols, multiplier: multiplier };
  const calldata = obi.encodeInput(input);
  return calldata;
}

// Send Data Request to BandChain and returns the associated request ID
async function makeRequest(symbols) {
  const account = await client.getAccount(address);
  const chainID = await client.getChainID();

  // Request parameters
  const oracleScriptID = 3; // Standard Dataset (Crypto) oracle script
  const askCount = 16;
  const minCount = 10;
  const clientID = 'band_requester';
  const calldata = Buffer.from(getCalldata(symbols));

  const tx = new Transaction()
    .withMessages(new MsgRequest(oracleScriptID, calldata, askCount, minCount, clientID, address))
    .withAccountNum(account.accountNumber)
    .withSequence(account.sequence)
    .withChainID(chainID)
    .withGas(1000000)
    .withMemo('band_requester_demo');
  const rawData = tx.getSignData();
  const signature = privateKey.sign(rawData);
  const rawTx = tx.getTxData(signature, pubKey);

  const res = await client.sendTxBlockMode(rawTx);
  return res.log[0]['events'][2]['attributes'][0]['value'];
}

// Get EVM proof bytes of a request
async function getPricer(symbols) {
  const options = {
    method: 'POST',
    url: `${rpcURL}/oracle/request_prices`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { symbols: symbols, min_count: 10, ask_count: 16 },
  };
  const data = await axios.request(options);
  console.log(data.data['result']);
}

module.exports = {
  makeRequest,
  getPricer,
};
