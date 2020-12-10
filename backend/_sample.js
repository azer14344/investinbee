require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const cors = require('cors')

const erc20 = require('./contracts/ERC20.json');

const {
	WEB3_USER,
	WEB3_PASSWORD,
	WEB3_PROVIDER,
  OWNER_ADDRESS,
  OWNER_PRIVATE_KEY,
  ERC20_ADDRESS,
} = process.env;

// Connection to chain
const web3 = new Web3(new Web3.providers.HttpProvider(
  `https://${WEB3_USER}:${WEB3_PASSWORD}@${WEB3_PROVIDER}`,
));
// const web3 = new Web3('ws://localhost:8545');

web3.eth.net.isListening()
  .then(function() {
    // ERC20 details
    const erc20Contract = new web3.eth.Contract(
        erc20.abi,
        ERC20_ADDRESS,
    );
    const app = express();

    app.use(cors());

    // parse application/json
    app.use(bodyParser.json()); // if you want to read more what this, https://stackoverflow.com/a/41521743

    app.get('/api/wallet/totalSupply', async function (req, res) {
      try {
        const totalSupply = await erc20Contract
            .methods
            .totalSupply()
            .call({from: OWNER_ADDRESS});

        res.status(200).json({
          message: 'Successfully retrieved total supply.',
          totalSupply: totalSupply,
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Failed to retrieve total supply.'
        });
      }
    });

    app.get('/api/wallet/balances/:address', async function (req, res) {
      try {
        const address = req.params.address;

        const balance = await erc20Contract
            .methods
            .balanceOf(address)
            .call({from: address});

        res.status(200).json({
          message: 'Successfully retrieved balance.',
          balance: balance,
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Failed to retrieve balance.'
        });
      }
    });

    app.get('/api/wallet/allowances/:address', async function (req, res) {
      try {
        const OWNER_ADDRESS = req.params.address;
        const senderAddress = req.query.sender

        let allowance = await erc20Contract
            .methods
            .allowance(OWNER_ADDRESS, senderAddress)
            .call({from: senderAddress});

        res.status(200).json({
          message: 'Successfully retrieved allowance.',
          allowance: allowance,
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Failed to retrieve allowance.'
        });
      }
    });

    app.post('/api/wallet/transfer', async function (req, res) {
      try {
        const sender = req.body.sender;
        const recipient = req.body.recipient;
        const amount = req.body.amount;
        let transactionHash;

        if (sender) { // sender !== null || sender !== undefined
          // we will use transferFrom method
          const transferFromEncodedABI = erc20Contract
              .methods
              .transferFrom(
                  OWNER_ADDRESS,
                  recipient,
                  parseInt(amount), // parse amount to int "10" => 10
              )
              .encodeABI();
          transactionHash = await buildSendTransaction(
              sender.address,
              sender.privateKey,
              transferFromEncodedABI,
          );
        } else {
          // we will call transfer method; called by owner
          const transferEncodedABI = erc20Contract
              .methods
              .transfer(
                  recipient,
                  parseInt(amount), // parse amount to int "10" => 10
              )
              .encodeABI();
          transactionHash = await buildSendTransaction(
              OWNER_ADDRESS,
              OWNER_PRIVATE_KEY,
              transferEncodedABI,
          );
        }

        res.status(200).json({
          message: 'Successfully transferred funds.',
          transactionHash: transactionHash,
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Failed to transfer funds.'
        });
      }
    });

    app.post('/api/wallet/approve', async function (req, res) {
      try {
        const sender = req.body.sender;
        const amount = req.body.amount;

        const approveEncodedABI = erc20Contract
              .methods
              .approve(
                  sender,
                  parseInt(amount), // parse amount to int "10" => 10
              )
              .encodeABI();
          transactionHash = await buildSendTransaction(
              OWNER_ADDRESS,
              OWNER_PRIVATE_KEY,
              approveEncodedABI,
          );

        res.status(200).json({
          message: 'Successfully approve funds.',
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Failed to approve funds.'
        });
      }
    });

    const PORT = 8080; // the port where our api will be served

    app.listen(PORT, () => {
      console.log('Example app listening at http://localhost:' + PORT);
    });
  })
  .catch(function(error) {
    console.log('Connection to chain not established!');

    console.error(error);

    process.exit(1);
  });

/**
 * @param {String} address - sender of the transaction
 * @param {String} privateKey - sender's private key
 * @param {String} encodedABI - myContract.methods.myMethod().encodeABI()
 */
async function buildSendTransaction(
    address,
    privateKey,
    encodedABI,
) {

  const txParams = {
    from: address,
    nonce: await web3.eth.getTransactionCount(address),// incremental value
    to: ERC20_ADDRESS, // address - ERC20_ADDRESS
    value: 0,// if you're sending ether
    gasLimit: web3.utils.toHex(10000000),// limit of gas willing to spend
    gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),// transaction fee
    data: encodedABI, // instructions - function, values
  };

  // Initialize a new Transaction
  const tx = new Tx(txParams);

  // Sign the Transaction with sender's private key
  tx.sign(Buffer.from( // convert string to Buffer
      privateKey.substring(2), // remove 0x
      'hex',
  ));

  // Returns the rlp (Recursive Length Prefix) encoding of the transaction, https://eth.wiki/en/fundamentals/rlp
  const serializedTx = tx.serialize();

  // Convert buffer (array of 8-bit unsigned integers) to string
  const rawTx = '0x' + serializedTx.toString('hex'); // 0x + 247970ea6031894B5Da5B32c6E7BdDca223f6735

  // Send signed transaction to the chain
  const transaction = await web3.eth.sendSignedTransaction(rawTx);

  return transaction.transactionHash;
}