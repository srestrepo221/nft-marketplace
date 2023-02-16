# NFT Minting DApp

- This application allows an end user to upload whatever media that they want to mint an NFT directly to their wallet for a small fee
- Show the users Minted NFTs on the page once they’ve done this

## Technology Stack & Tools
- Solidity (Writing Smart Contracts & Tests)
- Javascript (React & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [React.js](https://reactjs.org/) (Frontend Framework)
- [Ipfs](https://ipfs.tech/) (Metadata storage)

Connect your Metamask wallet and use the Goerli testnet to purchase GB tokens with Goerli Ether.

https://goerlifaucet.com/

Please make sure you have Goerli test Ether in your wallet.

This project comes with a NFT & Marketplace contract, a test for the Market contract, and a script that deploys both contracts.

### Run tests
`$ npx hardhat test`

### Start Hardhat node
`$ npx hardhat node`

### Run deployment script
In a separate terminal execute:
`$ npm run deploy/localhost`

### Start frontend
`$ npm run start`
