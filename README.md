# Ethereum Vault Manager

**Ethereum Vault Manager** is a tokenized dead-man's-switch vault for Ether, ERC-20 and ERC-721 tokens, written using the Truffle and OpenZeppelin frameworks. It allows you to bequeath Ether, DAI, God's Unchained Cards, Cryptokitties, ENS Names, and any other tokens to a beneficiary after you are no longer capable of checking in regularly with the central smart contract.

Each vault is itself an ERC-721 token, so you can view it on block explorers, and you can transfer ownership of the vault and all tokens inside by using the standard "send" function of your wallet.

## Example

Alice owns ETH, ERC-20, and ERC-721 tokens that she would like to pass on to Bob if something were to happen to her. She takes the following steps:

1. Alice calls `newVault()` on the central *Ethereum Estate Vaults* smart contract. This creates a child "vault contract" under her ownership, and gives her a personal vault contract with a new `vault id`. She sends her ERC-20 and ERC-721 tokens to this new vault contract. She is allowed to withdraw them at any time.
2. Alice calls `setBeneficiary(<vault id>, <Bob's address>)` to set Bob as the beneficiary.
3. Alice sends Eth, ERC-20 tokens, and ERC-721 tokens to her vault contract. There are no special deposit functions, so anyone can send any asset into the vault normally.
4. Every few months, Alice calls the `checkIn()` function, which resets the endowment date to `365 days` in the future.
5. Due to reasons outside her control, Alice is unable to check in. After it has been `365 days` since her last check-in (or a custom number of days that Alice had set using `setCheckInInterval()`), the endowment date is reached, and Bob is able to claim ownership of the vault and withdraw the assets.

## Dependencies

* Truffle
* Truffle-Assertions
* OpenZeppelin

**TODO:** Write short *Getting Started: As A User* and *Getting Started: As A Developer* guides.

## Disclaimer

This project is purely academic, incomplete, not properly tested, and not intended to secure real cryptocurrency of value on any "mainnet". I take no responsibility for any lost funds as a result of using any code found in this repository. Please read the MIT License disclaimer in the `LICENSE` file for more details.
