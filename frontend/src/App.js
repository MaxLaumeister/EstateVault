import Blockies from 'ethereum-blockies-base64';
import React, { Component } from 'react';
import Web3 from 'web3';
import queryString from 'query-string'
import './App.css';

class Address extends Component {
	render() {
		return <span className="panel addressComponent"><img className="blockies" alt="" src={this.props.address ? Blockies(this.props.address) : ""} /> <span className="address">{this.props.address ? this.props.address.substring(0, 7) + "..." : ""}</span></span>;
	}
}

class NewVaultButton extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	async clickHandler(e) {
		this.setState({ working: true });

		console.log(this);

		const newVaultGas = await this.props.managerContractWeb3.methods.newVault().estimateGas({
			from: this.props.account
		});
		const newvault = await this.props.managerContractWeb3.methods.newVault().send({
			from: this.props.account,
			gas: newVaultGas
		});

		const totalVaults = await this.props.managerContractWeb3.methods.vaultCount().call();

		this.setState({ working: false });
		this.setState({ vaultCreated: totalVaults - 1 });
	}
	
	render() {
		return <span><button disabled={this.state.working ? "disabled" : ""} onClick={this.clickHandler.bind(this)}>{!this.state.working ? "New Vault" : "Creating New Vault..."}</button> {this.state.vaultCreated === undefined ? "" : "Vault " + this.state.vaultCreated + " Created"}</span>
	}
}

class CheckInButton extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	async clickHandler(e) {
		this.setState({ working: true });

		console.log("checkin");

		this.setState({ working: false });
	}
	
	render() {
		return <button disabled={this.state.working ? "disabled" : ""} onClick={this.clickHandler.bind(this)}>{!this.state.working ? "Check In" : "Checking In..."}</button>
	}
}

class ChangeIntervalButton extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	async clickHandler(e) {
		this.setState({ working: true });

		console.log("checkin");

		this.setState({ working: false });
	}
	
	render() {
		return <button disabled={this.state.working ? "disabled" : ""} onClick={this.clickHandler.bind(this)}>{!this.state.working ? "Change" : "Changing..."}</button>
	}
}

class DepositButton extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	async clickHandler(e) {
		this.setState({ working: true });

		console.log("click");

		this.setState({ working: false });
	}
	
	render() {
		return <button disabled={this.state.working ? "disabled" : ""} onClick={this.clickHandler.bind(this)}>{!this.state.working ? "Deposit" : "Loading..."}</button>
	}
}

class WithdrawButton extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	async clickHandler(e) {
		this.setState({ working: true });

		console.log("click");

		this.setState({ working: false });
	}
	
	render() {
		return <button disabled={this.state.working ? "disabled" : ""} onClick={this.clickHandler.bind(this)}>{!this.state.working ? "Withdraw" : "Loading..."}</button>
	}
}

class App extends Component {

	componentDidMount() {
		const vaultManagerAddress = "0x060D08f8D9D8b859B286A3570F29EFB6bff5B442";
		const vaultManagerABI = [
			{
			  "inputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "constructor"
			},
			{
			  "constant": true,
			  "inputs": [],
			  "name": "vaultBeneficiaryTicketTokenContract",
			  "outputs": [
				{
				  "internalType": "contract VaultAccessERC721",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [],
			  "name": "vaultKeyTokenContract",
			  "outputs": [
				{
				  "internalType": "contract VaultAccessERC721",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "name": "vaults",
			  "outputs": [
				{
				  "internalType": "contract Vault",
				  "name": "vaultContract",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "checkInInterval",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lastCheckIn",
				  "type": "uint256"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [],
			  "name": "vaultCount",
			  "outputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [],
			  "name": "newVault",
			  "outputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "vaultId",
				  "type": "uint256"
				}
			  ],
			  "name": "claimVaultKeyAsBeneficiary",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "vaultId",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "newCheckInInterval",
				  "type": "uint256"
				}
			  ],
			  "name": "setCheckInInterval",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "vaultId",
				  "type": "uint256"
				}
			  ],
			  "name": "checkIn",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "vaultId",
				  "type": "uint256"
				},
				{
				  "internalType": "address",
				  "name": "sender",
				  "type": "address"
				}
			  ],
			  "name": "autoCheckIn",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			}
		  ];
		const vaultContractABI = [
			{
			  "inputs": [
				{
				  "internalType": "contract VaultAccessERC721",
				  "name": "vaultKeyTokenContract",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "vaultId",
				  "type": "uint256"
				}
			  ],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "constructor"
			},
			{
			  "payable": true,
			  "stateMutability": "payable",
			  "type": "fallback"
			},
			{
			  "constant": true,
			  "inputs": [],
			  "name": "_vaultId",
			  "outputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [],
			  "name": "_vaultKeyTokenContract",
			  "outputs": [
				{
				  "internalType": "contract VaultAccessERC721",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				},
				{
				  "internalType": "bytes",
				  "name": "",
				  "type": "bytes"
				}
			  ],
			  "name": "onERC721Received",
			  "outputs": [
				{
				  "internalType": "bytes4",
				  "name": "",
				  "type": "bytes4"
				}
			  ],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "contract IERC20",
				  "name": "tokenContract",
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
			  "name": "transferERC20",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "contract IERC721",
				  "name": "tokenContract",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "recipient",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "transferERC721",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address payable",
				  "name": "recipient",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "amount",
				  "type": "uint256"
				}
			  ],
			  "name": "transferETH",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			}
		  ];
		  const vaultAccessABI = [
			{
			  "inputs": [
				{
				  "internalType": "contract VaultManager",
				  "name": "parentContract",
				  "type": "address"
				}
			  ],
			  "payable": false,
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
				  "name": "approved",
				  "type": "address"
				},
				{
				  "indexed": true,
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "Approval",
			  "type": "event"
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
				  "name": "operator",
				  "type": "address"
				},
				{
				  "indexed": false,
				  "internalType": "bool",
				  "name": "approved",
				  "type": "bool"
				}
			  ],
			  "name": "ApprovalForAll",
			  "type": "event"
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
				  "indexed": true,
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "Transfer",
			  "type": "event"
			},
			{
			  "constant": true,
			  "inputs": [],
			  "name": "_parentContract",
			  "outputs": [
				{
				  "internalType": "contract VaultManager",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "approve",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "owner",
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
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "getApproved",
			  "outputs": [
				{
				  "internalType": "address",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "owner",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "operator",
				  "type": "address"
				}
			  ],
			  "name": "isApprovedForAll",
			  "outputs": [
				{
				  "internalType": "bool",
				  "name": "",
				  "type": "bool"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "ownerOf",
			  "outputs": [
				{
				  "internalType": "address",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "from",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "safeTransferFrom",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "from",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				},
				{
				  "internalType": "bytes",
				  "name": "_data",
				  "type": "bytes"
				}
			  ],
			  "name": "safeTransferFrom",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "bool",
				  "name": "approved",
				  "type": "bool"
				}
			  ],
			  "name": "setApprovalForAll",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": true,
			  "inputs": [
				{
				  "internalType": "bytes4",
				  "name": "interfaceId",
				  "type": "bytes4"
				}
			  ],
			  "name": "supportsInterface",
			  "outputs": [
				{
				  "internalType": "bool",
				  "name": "",
				  "type": "bool"
				}
			  ],
			  "payable": false,
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "from",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "transferFrom",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "mintAuthorized",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "constant": false,
			  "inputs": [
				{
				  "internalType": "address",
				  "name": "from",
				  "type": "address"
				},
				{
				  "internalType": "address",
				  "name": "to",
				  "type": "address"
				},
				{
				  "internalType": "uint256",
				  "name": "tokenId",
				  "type": "uint256"
				}
			  ],
			  "name": "transferAuthorized",
			  "outputs": [],
			  "payable": false,
			  "stateMutability": "nonpayable",
			  "type": "function"
			}
		  ];
		this.setState({ 
			vaultManagerAddress: vaultManagerAddress,
			vaultContractABI: vaultContractABI,
			vaultManagerABI: vaultManagerABI,
			vaultAccessABI: vaultAccessABI
		});
		this.loadBlockchainData();

		setInterval(() => {
			this.setState({currentDate: Date.now()});
		}, 100);
	}


	async loadBlockchainData() {
		// Load account
		const web3 = new Web3(/*Web3.givenProvider || */"http://localhost:7545");
		const network = await web3.eth.net.getNetworkType();
		const accounts = await web3.eth.getAccounts();
		this.setState({ account: accounts[0] });

		web3.eth.getBalance(accounts[0], (err, wei) => {
			this.setState({ balance: web3.utils.fromWei(wei, 'ether') });
		});
		

		// Load vault number
		let search = window.location.search;
		let params = new URLSearchParams(search);
		let vaultid = params.get('vaultid');
		
		// Load vault data
		const manager = new web3.eth.Contract(this.state.vaultManagerABI, this.state.vaultManagerAddress);
		this.setState({ managerContractWeb3: manager });
		//console.log(manager.methods);

		const vaultKey721Address = await manager.methods.vaultKeyTokenContract().call();
		this.setState({ vaultKey721Address: vaultKey721Address });

		const vaultTicket721Address = await manager.methods.vaultBeneficiaryTicketTokenContract().call();
		this.setState({ vaultTicket721Address: vaultTicket721Address });

		//console.log(newvault);
		//const newvault2 = await manager.methods.newVault();
		//console.log(newvault2);

		const totalVaults = await manager.methods.vaultCount().call();
		this.setState({ totalVaults: totalVaults });


		if (vaultid) {
			this.setState({ vaultid: vaultid });
			const vault = await manager.methods.vaults(vaultid).call();
			//console.log(vault);
			const vaultAddress = vault.vaultContract;
			this.setState({ vaultAddress: vaultAddress });
			const vaultKeyTokenContract = new web3.eth.Contract(this.state.vaultAccessABI, vaultKey721Address);
			const vaultTicketTokenContract = new web3.eth.Contract(this.state.vaultAccessABI, vaultTicket721Address);
			const keyOwner = await vaultKeyTokenContract.methods.ownerOf(vaultid).call();
			const ticketOwner = await vaultTicketTokenContract.methods.ownerOf(vaultid).call();
			this.setState({ keyOwner: keyOwner });
			this.setState({ ticketOwner: ticketOwner });
			console.log(vault);
			this.setState({ checkInInterval: parseInt(vault.checkInInterval, 10) });
			this.setState({ lastCheckIn: parseInt(vault.lastCheckIn, 10) });
		} else {
			this.setState({ vaultid: null });
		}
		
		//this.setState({
		//	vaultAddress: 
		//});
	}
  
	constructor(props) {
		super(props);
		this.state = { account: '', vaultid: '' };
	}
  
	render() {
		let id = (this.state.vaultid === null) ? "(no vault selected)" : "Vault " + this.state.vaultid + " Details";

		//const blocky = Blockies.create();
		//console.log(blocky);
		return (
			<div className="container">
				<h1>Estate Vaults</h1>
				<hr />
				<details>
					<summary>Contract Details</summary>
					<p>
						Manager Contract: <Address address={this.state.vaultManagerAddress} />
					</p>
					<p>
						Vault Key ERC721 Contract: <Address address={this.state.vaultKey721Address} />
					</p>
					<p>
						Vault Ticket ERC721 Contract: <Address address={this.state.vaultTicket721Address} />
					</p>
					<p>
						Total Vault Count: {this.state.totalVaults}
					</p>
				</details>
				<hr />
				<p>Your account: <Address address={this.state.account} /></p>
				<p>Balance: {this.state.balance} ETH (testnet)</p>
				<div class="vault panel">
					<h2>{id}</h2>
					<DepositButton /> <WithdrawButton />
					<hr />
					<p>Vault Address: <Address address={this.state.vaultAddress} /></p>
					<p>Vault Key Owner: <Address address={this.state.keyOwner} /></p>
					<p>Vault Beneficiary Ticket Owner: <Address address={this.state.ticketOwner} /></p>
					<hr />
					<p>Last Check-in: {((this.state.currentDate / 1000 - this.state.lastCheckIn) / 60 / 60 / 24).toFixed(6)} days ago <CheckInButton /></p>
					<p>Check-in Interval: {this.state.checkInInterval / 60 / 60 / 24} days <ChangeIntervalButton /></p>
					<p>Beneficiary Can Claim In: {Math.max(((this.state.lastCheckIn + this.state.checkInInterval - this.state.currentDate / 1000) / 60 / 60 / 24), 0).toFixed(6)} days</p>
				</div>
				<NewVaultButton managerContractWeb3={this.state.managerContractWeb3} account={this.state.account}/>
			</div>
		);
	}
}

export default App;
