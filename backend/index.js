require('dotenv').config();

const express = require('express');
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

// Investment Contract
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "percentInterest",
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
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			}
		],
		"name": "getPayout",
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
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "GetPayout",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "invest",
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
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Invest",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			}
		],
		"name": "refundInvestment",
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
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "RefundInvestment",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			},
			{
				"internalType": "enum Investment.CampaignStatus",
				"name": "campaignStatus",
				"type": "uint8"
			}
		],
		"name": "setCampaignStatus",
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
				"internalType": "uint256",
				"name": "percentInterest",
				"type": "uint256"
			}
		],
		"name": "setPercentInterest",
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
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "setTargetFund",
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
		"name": "contractOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			}
		],
		"name": "getCampaignStatus",
		"outputs": [
			{
				"internalType": "enum Investment.CampaignStatus",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			}
		],
		"name": "totalCampaignFunds",
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
				"internalType": "uint256",
				"name": "campaignID",
				"type": "uint256"
			}
		],
		"name": "totalInvestments",
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
const erc20Contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

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
		app.use(session({
			secret: process.env.SESSION_SECRET,
			saveUninitialized: true,
			resave: true,
		}));

		con.connect(function(err) {
			if (err) {
				console.log('Unable to connect to MYSQL Database');
				process.exit(1);
			}
		});

		// ACCOUNT: REGISTER
		app.post('/api/account/register', async function (req, res) {
			try {
				
				const { fName,  
						lName, 
						email, 
						password } = req.body;
				
				emailAlreadyExists(email, function(err, emailExists) {

					if (err) {
						res.status(500).json({message: 'Failed to create account'});
					}
					else {
						if(emailExists) {
							res.status(400).json({message: 'Email already exists'});
						}
						else
						{
							createWallet(result => {
							
								const sql = 'INSERT INTO tblaccounts (Type, FName, LName, Email, Password, OwnerAddress, PrivateKey) VALUES ?';
								const values = [
									['Investor', fName, lName, email, sha1(password + salt), result.address, result.privateKey]
								];
								con.query(sql, [values], function (err, result) {
									if (err) res.status(500).json({
										message: 'Failed to create account'
									});
									
									console.log('Successfully created account. ' + result.affectedRows + ' record inserted.');
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

				const sql = 'SELECT * FROM tblaccounts WHERE Email = ? AND Password = ? ';
				const values = [email, sha1(password + salt)];
				con.query(sql, values, function (err, result, fields) {

					if (err) res.status(500).json({
						message: 'An error occured while logging in'
					});
					
					if(parseInt(result.length) > 0)
					{
						req.session.email = result[0].Email;
						req.session.address = result[0].OwnerAddress;

						console.log(req.session.email + ' logged in');

						res.status(200).json({
							message: 'Successfully logged in. ',
						});
					}
					else{
						res.status(401).json({
							message: 'Incorrect login details'
						})
					}

					
				});
					
			  } catch (error) {
				res.status(500).json({
					message: 'An error occured while performing action'
				});
			  }
		});

		// ACCOUNT: LOGOUT
		app.delete('/api/account/logout', (req, res) => {
			try {
				
				req.session.destroy((err) => {
					if (err) {
						res.status(500).json({message: 'Failed to log out'});
					} else {
						res.status(204).send();
					}
				});
					
			} catch (error) {
				res.status(500).json({message: 'An error occured while performing action'});
			}
			
		});

		// ACCOUNT: PROFILE
		app.get('/api/account/profile', authenticationMiddleware, (req, res) => {
			try {

				const sql = 'SELECT * FROM tblaccounts WHERE Email = ? ';
				const values = [req.session.email];
				con.query(sql, values, function (err, result) {
					if (err) res.status(500).json({
						message: 'An error occured while logging in'
					});
					
					if(parseInt(result.length) > 0)
					{
						res.status(200).json({
							message: 'Success', 'profile':  {
								Type: result[0].Type,
								FName: result[0].FName,
								MName: result[0].MName,
								LName: result[0].LName,
								Email: result[0].Email,
								MobileNum: result[0].MobileNum,
								OwnerAddress: result[0].OwnerAddress
							}
						});
					}
					else{
						res.status(500).json({
							message: 'Unable to retrieve profile'
						})
					}
					
				});

					
			  } catch (error) {
				res.status(500).json({
					message: 'An error occured while performing action'
				});
			  }
		});

		// ACCOUNT: BALANCE
		app.get('/api/account/balance', authenticationMiddleware, async function (req, res) {
			try {

				let balance = await erc20Contract.methods.balanceOf(req.session.address).call({
					from: req.session.address
				});

				console.log(req.session.address + ' balance: ' + balance);

				res.status(200).json({
					message: 'Success', balance : balance
				});
					
			} catch (error) {
				res.status(500).json({
					message: 'An error occured while performing action'
				});
			}
		});

		// ACCOUNT: REQUEST CASH IN
		app.post('/api/account/requestcashin', authenticationMiddleware, async function (req, res) {
			try {
				
				const { amount } = req.body;
				
				const sql = 'INSERT INTO tblloadhist (OwnerAddress, Amount, Status, DateSave) VALUES (?, ?, ?, NOW())';
				const values = [req.session.address, parseInt(amount), 'P'];
				con.query(sql, values, function (err, result) {
					if (err) res.status(500).json({
						message: 'Failed to create request'
					});

					console.log('Successfully created load request: ' + req.session.address);

					res.status(201).json({
						message: 'Success',
					});
				});

			  } catch (error) {
				res.status(500).json({message: 'Failed to create account'});
			  }
		});

		// ADMIN: LOGIN
		app.post('/api/admin/login', async function (req, res) {
			try {
				
				const { username, 
						password } = req.body;

				const sql = 'SELECT * FROM tbladmin WHERE Username = ? AND Password = ? ';
				const values = [username, sha1(password + salt)];
				con.query(sql, values, function (err, result, fields) {

					if (err) res.status(500).json({
						message: 'An error occured while logging in'
					});
					
					if(parseInt(result.length) > 0)
					{
						req.session.adminusername = result[0].Username;

						console.log(req.session.adminusername + ' logged in');

						res.status(200).json({
							message: 'Successfully logged in. ',
						});
					}
					else{
						res.status(401).json({
							message: 'Incorrect login details'
						})
					}

					
				});
					
			  } catch (error) {
				res.status(500).json({
					message: 'An error occured while performing action'
				});
			  }
		});

		// ADMIN: CASH IN REQUESTS
		app.get('/api/admin/cashinrequests/:status', adminAuthenticationMiddleware, (req, res) => {
			try {

				const reqstatus = req.params.status;

				const sql = 'SELECT lh.RKEY, '
							+ ' lh.OwnerAddress, ' 
							+ ' lh.Amount, '
							+ ' lh.Status, '
							+ ' lh.DateSave, '
							+ ' acc.FName, '
							+ ' acc.MName, '
							+ ' acc.LName, '
							+ ' acc.Email, '
							+ ' acc.MobileNum '
							+ ' FROM tblloadhist lh '
							+ 'LEFT OUTER JOIN tblaccounts acc ON acc.OwnerAddress = lh.OwnerAddress '
							+ 'WHERE lh.Status = ? ';

				const values = [reqstatus];
				con.query(sql, values, function (err, result) {
					if (err) res.status(500).json({
						message: 'An error occured while logging in'
					});
					
					if(parseInt(result.length) > 0)
					{
						res.status(200).json({
							message: 'Success', 'CashInRequests':  result
						});
					}
					else{
						res.status(500).json({
							message: 'Unable to retrieve records'
						})
					}
					
				});

					
			  } catch (error) {
				res.status(500).json({
					message: 'An error occured while performing action'
				});
			  }
		});

		// ADMIN: APPROVE CASH IN REQUESTS
		app.post('/api/admin/approvecashin', adminAuthenticationMiddleware, async function (req, res) {
			try {
					const rkey = req.body.id;
					const sql = 'UPDATE tblloadhist SET Status = ? WHERE RKEY = ?';
					const values = ['S', rkey];
					con.query(sql, values, function (err, result) {
						if (err) res.status(500).json({
							message: 'An error occured while performing action'
						});
						
						if(result.affectedRows > 0)
						{
							getLoadRequestDetails(rkey, async function(err, details) {

								const recipient = details[0].OwnerAddress;
								const transferAmt = details[0].Amount;
								let transferData = await erc20Contract.methods.transfer(recipient, transferAmt).encodeABI();
								const transfer =  buildSendTransaction(mainAccount, mainAccountKey, transferData);

								

								res.status(201).json({
									message: 'Success'
								});
								console.log("Approved cash in request");
							});
							
						}
						else{
							res.status(400).json({
								message: 'Invalid ID provided'
							});
						}
						
						
					});

					
				} catch (error) {
					res.status(500).json({
						message: 'An error occured while performing action'
					});
				}
		});

		// ADMIN: CREATE CAMPAIGN
		app.post('/api/admin/createcampaign', adminAuthenticationMiddleware, async function (req, res) {
			try {
				const { name, 
						description, 
						location,
						targetFund,
						status } = req.body;

					const sql = 'INSERT INTO tblcampaign (Name, Description, Location, TargetFund, Status) VALUES (?,?,?,?,?)';
					const values = [name, description, location, targetFund, status];
					con.query(sql, values, async function (err, result) {
						if (err) res.status(500).json({
							message: 'An error occured while performing action'
						});
						
						if(result.affectedRows > 0)
						{
							
							const campaignID = result.insertId;

							let campaignStatusData = await erc20Contract.methods.setCampaignStatus(campaignID, 2).encodeABI();
							const setCampaignStatus =  buildSendTransaction(mainAccount, mainAccountKey, campaignStatusData);
							



							console.log("Created campaign ", campaignID);
							res.status(201).json({
								message: 'Success'
							});
							
							
						}
						else{
							res.status(400).json({
								message: 'Incomplete details'
							});
						}
						
					});

					
				} catch (error) {
					res.status(500).json({
						message: 'An error occured while performing action'
					});
				}
		});

		// ADMIN: GET CAMPAIGN STATUS
		app.get('/api/admin/getcampaignstatus/:campaignId', adminAuthenticationMiddleware, async function (req, res) {
			try {

				const campaignId = req.params.campaignId;

				let campaignStatus = await erc20Contract.methods.getCampaignStatus(campaignId).call({from: mainAccount});
				//console.log('Get campaign status:', campaignStatus, ':', campaignStatus);
				
				res.status(201).json({
					message: 'Success', campaignStatus: campaignStatus 
				});
			} catch (error) {
				console.log(error);
				res.status(500).json({
					message: 'An error occured while performing action. '
				});
			}
		});

		// ADMIN: BALANCE
		app.get('/api/admin/balance', adminAuthenticationMiddleware, async function (req, res) {
			try {

				let balance = await erc20Contract.methods.balanceOf(mainAccount).call({
					from: mainAccount
				});

				console.log('Main account balance: ' + balance);

				res.status(200).json({
					message: 'Success', balance : balance
				});
					
			} catch (error) {
				res.status(500).json({
					message: 'An error occured while performing action'
				});
			}
		});

		const PORT = 8080;
		app.listen(PORT, () => {
			console.log('Listening at http://localhost:' + PORT);
		});
	})
    .catch((err) => {
		console.log('Unable to connect to chain');
    	process.exit(1);
	})


async function buildSendTransaction(account, accountKey, data) {
    const txParams = {
        from: account,
        nonce: await web3.eth.getTransactionCount(account),
        to: process.env.CONTRACT_ADDRESS, 
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

function authenticationMiddleware (req, res, next) {
	if (req.session.email) {
		return next();
	}

	res.status(401).json({
		message: 'Not authorized'
	});
}

function adminAuthenticationMiddleware (req, res, next) {
	if (req.session.adminusername) {
		return next();
	}

	res.status(401).json({
		message: 'Not authorized'
	});
}

function createWallet(callback) {
	callback(web3.eth.accounts.create());
}

function emailAlreadyExists(email, callback){
	var sql = 'SELECT * FROM tblaccounts WHERE email = ?';
	con.query(sql, [email], function (err, result) {
		callback(err, parseInt(result.length) > 0 ? true : false);
	});
}

async function getLoadRequestDetails(id, callback){
	var sql = 'SELECT * FROM tblloadhist WHERE RKEY = ?';
	con.query(sql, [id], function (err, result) {
		callback(err, result);
	});
}
