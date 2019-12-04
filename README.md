# Ethereum Estate Vault

**Ethereum Estate Vault** is a fully-tokenized dead-man's-switch vault for Ether, ERC-20 and ERC-721 tokens, written using the Truffle and OpenZeppelin frameworks. It allows you to bequeath Ether, DAI, God's Unchained Cards, Cryptokitties, ENS Names, and other Ethereum assets to a beneficiary after you are no longer capable of checking in regularly with the central smart contract.

To keep your Ethereum assets safe, create a **vault** by calling the `newVault()` function. This **vault** can contain ETH, ERC-20 tokens, and ERC-721 tokens. Each vault has the following tools associated with it:

* One **vault key** that allows withdrawal from the vault. This key is itself an ERC-721 token. To transfer ownership of the vault, send someone else the vault key.
* One **vault beneficiary claim ticket**. This ticket allows a third party to claim the **vault key** if the dead-man's-switch times out. This ticket is itself an ERC-721 token, and it starts out *inside the vault itself*, indicating that the vault has no beneficiary. To assign someone as your vault's beneficiary, withdraw the claim ticket and send it to someone else.

## Example

Alice owns Ethereum assets (ETH, ERC-20, and ERC-721 tokens) that she would like to pass on to Bob if something were to happen to her. She takes the following steps to secure her assets:

1. Alice calls `newVault()` on the central *Ethereum Estate Vault* smart contract. This creates a new  **vault** contract with its own Ethereum address, and sends Alice the **vault key** (an ERC-721 token). It also creates a **beneficiary claim ticket** (another ERC-721 token) and puts it in the vault for safekeeping.
2. Alice sends her assets (ETH, ERC-20 and ERC-721 tokens) to her vault's address to deposit them. She is allowed to withdraw them at any time, as long as she continues to own her **vault key**.
3. Alice withdraws her **beneficiary claim ticket** from the vault, and sends the ticket to Bob. Because Bob owns the beneficiary claim ticket, he will be the beneficiary once the dead-man's-switch times out.
4. Every few months, Alice calls the `checkIn()` function, which resets the endowment date to `365 days` in the future. Certain other actions of Alice's will also cause an automatic check-in, such as if she sets a new check-in interval, or if she transfers the key or the claim ticket (but not if someone else transfers the claim ticket).
5. Something bad happens to Alice, and she is unable to check in any more. After it has been `365 days` since her last check-in (or after a custom interval, if Alice had set one using `setCheckInInterval()`), the endowment date is reached, and Bob is able to claim ownership of the vault and withdraw the assets. To claim ownership, Bob calls the `claimVaultKeyAsBeneficiary()` function. This function first checks that Bob owns the **beneficiary claim ticket**, then yanks the key from Alice's dead account and gives it to Bob, and finally, returns the claim ticket back to the vault for future reuse. Now Bob has the key, and with it, full ownership of the vault.

## Dependencies

* Truffle
* Truffle-Assertions
* Mythx plugin for Truffle
* OpenZeppelin

## TODO

* Emit events
* Implement `IERC721Metadata` to give the user more info about the vault/ticket tokens.
* Write an end-user function reference
* Write a [web3-react](https://github.com/NoahZinsmeister/web3-react) frontend that makes these contracts easier for end-users to interact with

## Disclaimer

**This project is purely academic, incomplete, not properly tested, and not intended to secure real cryptocurrency of value on any "mainnet".** I take no responsibility for any lost funds as a result of using any code found in this repository. Please read the MIT License disclaimer in the `LICENSE` file for more details.
