const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const web3 = new Web3(new Web3.providers.HttpProvider('https://k0kw6ia9j2:Nlk6vjccXvm3Z1_F4WXuWq5bR4YLgeegi3UT3JsHLww@k0jy73d24v-k0pu9805pa-rpc.kr0-aws.kaleido.io/'));

const express = require("express");
var mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

// MYSQL CONNECTION
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "investinbee"
  });

  // ERC20
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

var sha1 = require('sha1');
const salt = "xxx";

web3.eth.net.isListening()
    .then(function() {

		console.log('Connected to ethereum network');
    	app.use(cors());
		app.use(bodyParser.json());
		
		// ACCOUNT: REGISTER
		app.post('/api/account/register', async function (req, res) {
			try {
				const { fName, 
						mName, 
						lName, 
						email, 
						mobileNum, 
						password } = req.body;

				createWallet(result => {
					con.connect(function(err) {
						if (err) res.status(500).json({message: 'Failed to create account'});
						var sql = "INSERT INTO tblaccounts (Type, FName, MName, LName, Email, MobileNum, Password, OwnerAddress, PrivateKey) VALUES ?";
						var values = [
						  ['Investor', fName, mName, lName, email, mobileNum, sha1(password + salt), result.address, result.privateKey]
						];
						con.query(sql, [values], function (err, result) {
						  if (err) throw err;
						  console.log("Successfully inserted: " + result.affectedRows);
						});
					});
				});

				res.status(201).json({
				  message: 'Successfully created an account',
				});
			  } catch (error) {
				console.error(error);
				res.status(500).json({message: 'Failed to create account'});
			  }
		});
		

		const PORT = 8080;
		app.listen(PORT, () => {
			console.log('Listening at http://localhost:' + PORT);
		});
	})
    .catch((err) => console.log('Error'))



async function buildSendTransaction(account, accountKey, data) {
    const txParams = {
        from: account,
        nonce: await web3.eth.getTransactionCount(account),
        to: erc20Address, 
        value: 0,
        gasLimit: web3.utils.toHex(10000000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('0', 'gwei')),
        data: data,
    }

    const tx = new Tx(txParams);
    tx.sign(accountKey);
    const serializedTx = tx.serialize();
    const rawTx = '0x' + serializedTx.toString('hex');
    const transaction = await web3.eth.sendSignedTransaction(rawTx);
    return transaction.transactionHash;

}

createWallet = cb => {
	cb(web3.eth.accounts.create());
};