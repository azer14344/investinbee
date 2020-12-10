// 1. Connect to chain
// 2. Validations
// 3. Connect Smart Contract

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const web3 = new Web3(new Web3.providers.HttpProvider('https://k0kw6ia9j2:Nlk6vjccXvm3Z1_F4WXuWq5bR4YLgeegi3UT3JsHLww@k0jy73d24v-k0pu9805pa-rpc.kr0-aws.kaleido.io/'));

web3.eth.net.isListening()
    .then((con) => console.log('Connected'))
    .catch((err) => console.log('Error'))

// validate chain
/*web3.eth.getBlock('latest')
    .then((latestBlock) => console.log(latestBlock.number))
    .catch((err) => console.log('Not Connected'))*/


const erc20ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const erc20Address = '0x6Ac859e8158112396c9954Ce3396906DaC9a2441';
const erc20Contract = new web3.eth.Contract(erc20ABI, erc20Address);

//console.log(erc20Contract);
const acct1 = '0x1eB0026940d33C032063bc770ee5823452c20343';
const acct1Key = Buffer.from('2c9b7aca7e34db327b2566054e67e2f0ba2243f4bd5bd9e663ec2b3b3c4d0f6d', 'hex');
const acct2 = '0x09E29a7e08c14165F0CC17710af61ce8D35CAf23';
const acct2Key = Buffer.from('3d8c5e43b7fa1a8fc8740d49852e29aa02a59bf53683731fa971584a3fb3beea', 'hex');
const acct3 = '0x447AD059aEF5cA6F71a5297d2D80036a2bBee40a';
const acct3Key = Buffer.from('e866b3ccd8a666e400324d898245e8f586e7d91d69dabbacca612d8cd80c822c', 'hex');

const testAccount = '0x8f9F673147D7d5Cb823039B77572D27D66cEec63';
const testAccountKey = Buffer.from('913ab4f195a12c258ca466aafbb2a6ff7e9e25c8a24da3d9700ae47027104a6b', 'hex');
(async () => {

    let totalSupply = await erc20Contract.methods.totalSupply().call({from: acct1});
    console.log('Total Supply:', totalSupply);

    let balance1 = await erc20Contract.methods.balanceOf(acct1).call({from: acct1});
    console.log('Balance of Acct1:', balance1);

    let balance2 = await erc20Contract.methods.balanceOf(acct2).call({from: acct1});
    console.log('Balance of Acct2:', balance2);

    let balance3 = await erc20Contract.methods.balanceOf(acct3).call({from: acct1});
	console.log('Balance of Acct3:', balance3);
	
	let balanceTestAccount = await erc20Contract.methods.balanceOf(testAccount).call({from: acct1});
    console.log('Balance of Test Account:', balanceTestAccount);

    let allowance = await erc20Contract.methods.allowance(acct1, acct2).call({from: acct2});
    console.log('Allowance:', allowance);

    /*let approvedData = erc20Contract.methods.approve(acct2, 10).encodeABI();
    const approve = await buildSendTransaction(acct1, acct1Key, approvedData);
    console.log('Approve Txhash:', approve);*/

    /*let transferDataToTest = erc20Contract.methods.transfer(testAccount, 50).encodeABI();
    const transfer = await buildSendTransaction(acct1, acct1Key, transferDataToTest);
	console.log('Transfer Txhash:', transfer);*/

	let transferFromData = erc20Contract.methods.transferFrom(acct1, acct3, 4).encodeABI();
    const transferFrom = await buildSendTransaction(acct2, acct2Key, transferDataToTest);
	console.log('Transfer Txhash:', transferFrom);

	//web3.eth.personal.newAccount('!@superpassword').then(console.log);

	/*createWallet(result => {
		console.log("Wallet Add is:", result.address);
		console.log("Private Key is:", result.privateKey);
	});*/
	
})();

async function buildSendTransaction(account, accountKey, data) {
    const txParams = {
        from: account,// sender of the transaction
        nonce: await web3.eth.getTransactionCount(account), // incremental value
        to: erc20Address, // address - erc20 address
        value: 0, // if sending ether
        gasLimit: web3.utils.toHex(10000000), //
        gasPrice: web3.utils.toHex(web3.utils.toWei('0', 'gwei')),
        data: data,
    }

    // initialize the transaction
    const tx = new Tx(txParams);

    // sign the transaction
    tx.sign(accountKey);

    const serializedTx = tx.serialize();

    // send signed transaction to chain
    const rawTx = '0x' + serializedTx.toString('hex');
    const transaction = await web3.eth.sendSignedTransaction(rawTx);
    return transaction.transactionHash;

}

/*async function buildSendTransaction(account, accountKey, data) {
    const Tx = ethereumjs.Tx;
    // Build the Object
    const txObject = {
        from: account,
        nonce: await web3.eth.getTransactionCount(account),
        to: erc20Address,
        value: 0,
        gasLimit: web3.utils.toHex(2100000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
        data,
    };

    const tx = new Tx(txObject);
    accountKey = new ethereumjs.Buffer.Buffer(accountKey.substring(2), 'hex');
    tx.sign(accountKey);
    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');
    const transaction = await web3.eth.sendSignedTransaction(raw);
    return transaction.transactionHash;
}*/

createWallet = cb => {
	cb(web3.eth.accounts.create());
  };