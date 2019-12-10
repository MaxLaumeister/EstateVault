import React, { Component } from 'react';
import Web3 from 'web3';
import queryString from 'query-string'
import './App.css';

class App extends Component {

	componentDidMount() {
		this.loadBlockchainData();
	}


	async loadBlockchainData() {
		// Load account
		const web3 = new Web3(/*Web3.givenProvider || */"http://localhost:7545");
		const network = await web3.eth.net.getNetworkType();
		await window.ethereum.enable();
		const accounts = await web3.eth.getAccounts();
		this.setState({ account: accounts[0] });

		// Load vault number
		let search = window.location.search;
		let params = new URLSearchParams(search);
		let vaultid = params.get('vaultid');
		this.setState({ vaultid: vaultid });
		
		
	}
  
	constructor(props) {
		super(props);
		this.state = { account: '', vaultid: '' };
	}
  
	render() {
		return (
			<div className="container">
				<h1>Estate Vaults</h1>
				<p>Your account: {this.state.account}</p>
				<h2>Vault {this.state.vaultid}</h2>
			</div>
		);
	}
}

export default App;
