# Ethereum Estate Wallet

**Ethereum Estate Wallet** is a dead-man's-switch Ethereum wallet for ERC-20 and ERC-721 tokens, written using the Truffle and OpenZeppelin frameworks. It allows you to bequeath Wrapped Ether, DAI, God's Unchained Cards, Cryptokitties, ENS Names, and other tokens to a beneficiary after you are no longer capable of checking in regularly with the *Ethereum Estate Wallet* smart contract.

This contract's aim is to be as barebones, straightforward, and auditable as possible.

## Example

Alice owns ERC-20 and ERC-721 tokens that she would like to pass on to Bob if something were to happen to her. She takes the following steps:

1. Alice instantiates the *Ethereum Estate Wallet* smart contract, and leaves the `checkInInterval` at its default value of `365 days`. She sends her ERC-20 and ERC-721 tokens to it. She is allowed to withdraw them at any time.
2. Every 6 months, Alice calls the `checkIn()` function to reset the endowment date to `365 days` in the future.
3. Due to reasons outside her control, Alice is unable to check in. After it has been `365 days` since her last check-in, the endowment date is reached, and Bob is able to withdraw ERC-20 and ERC-721 tokens.
4. If Alice is able to check in again after the endowment date, she can reset the endowment date to the future again, and regain control of any tokens that Bob has not yet withdrawn from the contract.

## Dependencies

* Truffle
* Truffle-Assertions
* OpenZeppelin

**TODO:** Write a short *Getting Started* guide.

## Future Plans

Ideally, each *Ethereum Estate Wallet* instance should itself be an ERC-721 token. This would allow wallet ownership to show up on block explorers, and allow ownership to be transferred via standard Ethereum wallet functionality.

Then, beneficiary access could be simplified to calling a function that yanks ownership from the owner (when allowed to do so).

## Disclaimer

This project is purely academic, incomplete, not properly tested, and not intended to secure real cryptocurrency of value on any "mainnet". I take no responsibility for any lost funds as a result of using code found in this repository. Please read the MIT License disclaimer in the `LICENSE` file for more details.
