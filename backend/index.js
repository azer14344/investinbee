require('dotenv').config();

const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const sha1 = require('sha1');
const mysql = require('mysql');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_URL));
const app = express();
const mainAccount = process.env.MAIN_ACCOUNT;
const mainAccountKey = Buffer.from(process.env.MAIN_ACCOUNT_KEY, 'hex');
const salt = process.env.DB_PASSWORD_SALT;

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
const erc20Contract = new web3.eth.Contract(erc20ABI, process.env.ERC20_ADDRESS);

// MYSQL CONNECTION
var con = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE
});

web3.eth.net.isListening()
    .then(function() {

		console.log('Connected to ethereum network');
    	app.use(cors());
		app.use(bodyParser.json());
		app.use(session({secret: 'xyz',saveUninitialized: true,resave: true}));

		var sess;

		con.connect(function(err) {
		});

		(async () => {
			let transferData = erc20Contract.methods.transfer('0x24b5ff51b5Ec52950AC5a8248D7480D44Fa06C7d', 50).encodeABI();
    		const transfer = await buildSendTransaction(mainAccount, mainAccountKey, transferData);
			console.log('Transfer Txhash:', transfer);
		})
		
		// ACCOUNT: REGISTER
		app.post('/api/account/register', async function (req, res) {
			try {
				
				const { fName, mName, 
						lName, email, 
						mobileNum, password } = req.body;
				
				emailAlereadyExists(email, function(err, emailExists) {

					if (err) {
						res.status(500).json({message: 'Failed to create account'});
					}
					else {
						if(emailExists) {
							res.status(500).json({message: 'Email already exists'});
						}
						else
						{
							createWallet(result => {
							
								var sql = "INSERT INTO tblaccounts (Type, FName, MName, LName, Email, MobileNum, Password, OwnerAddress, PrivateKey) VALUES ?";
								var values = [
									['Investor', fName, mName, lName, email, mobileNum, sha1(password + salt), result.address, result.privateKey]
								];
								con.query(sql, [values], function (err, result) {
									if (err) res.status(500).json({message: 'Failed to create account'});;
									console.log("Successfully inserted: " + result.affectedRows);
									res.status(201).json({
										message: 'Successfully created an account',
									});
								});
								
							});
							
						}
					}
				});
					
			  } catch (error) {
				res.status(500).json({message: 'Failed to create account'});
			  }
		});
		
		// ACCOUNT: LOGIN
		app.post('/api/account/login', async function (req, res) {
			try {
				
				const { email, 
						password } = req.body;

				var sql = "SELECT * FROM tblaccounts WHERE Email = ? AND Password = ? ";
				var values = [email, sha1(password + salt)];
				con.query(sql, values, function (err, result, fields) {
					if (err) res.status(500).json({message: 'An error occured while logging in'});
					
					if(parseInt(result.length) > 0)
					{
						sess = req.session;
						sess.email = result[0].Email;
						sess.address = result[0].OwnerAddress;

						console.log(sess.address);

						res.status(201).json({
							message: 'Successfully logged in. ',
						});
					}
					else{
						res.status(500).json({message: 'Incorrect login details'})
					}

					
				});
					
			  } catch (error) {
				res.status(500).json({message: 'An error occured while logging in'});
			  }
		});

		// ACCOUNT: LOGOUT
		app.get('/api/account/logout', async function (req, res) {
			try {
				
					req.session.destroy((err) => {
						if(err) {
							res.status(500).json({message: 'An error occured while logging out'});
						}
						else
						{
							res.status(201).json({
								message: 'Successfully logged out. ',
							});
						}
					});
					
				} catch (error) {
					res.status(500).json({message: 'An error occured while logging in'});
				}
		});

		// ACCOUNT: PROFILE
		app.get('/api/account/profile', function (req, res) {
			try {

				sess = req.session;

				if(sess.email)
				{
					var sql = "SELECT * FROM tblaccounts WHERE Email = ? ";
					var values = [sess.email];
					con.query(sql, values, function (err, result) {
						if (err) res.status(500).json({message: 'An error occured while logging in'});
						
						if(parseInt(result.length) > 0)
						{
							res.status(201).json({
								message: 'Success', "profile":  {
									"Type": result[0].Type,
									"FName": result[0].FName,
									"MName": result[0].MName,
									"LName": result[0].LName,
									"Email": result[0].Email,
									"MobileNum": result[0].MobileNum,
									"OwnerAddress": result[0].OwnerAddress
								}
							});
						}
						else{
							res.status(500).json({message: 'Incorrect login details'})
						}
						
					});
				}
				else
				{
					res.status(500).json({message: 'Not logged in'});
				}

					
			  } catch (error) {
				res.status(500).json({message: 'An error occured while logging in'});
			  }
		});

		// ACCOUNT: BALANCE
		app.get('/api/account/balance', async function (req, res) {
			try {

				sess = req.session;

				if(sess.address)
				{
					let balance = await erc20Contract.methods.balanceOf(sess.address).call({from: sess.address});
					console.log('Balance:', balance);
				}
				else
				{
					res.status(500).json({message: 'Not logged in'});
				}

					
			  } catch (error) {
				res.status(500).json({message: 'An error occured while logging in'});
			  }
		});

		// ACCOUNT: LOAD REQUEST
		app.post('/api/account/loadrequest', async function (req, res) {
			try {
				
				const { amount } = req.body;
				
				sess = req.session;

				if(sess.address)
				{
					var sql = "INSERT INTO tblloadhist (OwnerAddress, Amount, Status, DateSave) VALUES (?, ?, ?, NOW())";
					var values = [sess.address, parseInt(amount), 'P'];
					con.query(sql, values, function (err, result) {
						if (err) res.status(500).json({message: 'Failed to save request'});;
						console.log("Successfully inserted request: " + result.affectedRows);
						res.status(201).json({
							message: 'Success',
						});
					});
				}
				else
				{
					res.status(500).json({message: 'Not logged in'});
				}

			  } catch (error) {
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

function emailAlereadyExists(email, callback){

	var sql = 'SELECT * FROM tblaccounts WHERE email = ?';
	con.query(sql, [email], function (err, result) {
		callback(err, parseInt(result.length) > 0 ? true : false);
	});
}
