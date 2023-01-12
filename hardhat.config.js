require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || ""
module.exports = {
  solidity: "0.8.4",
  networks: {
    localhost: {},
    goerli : {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: privateKeys.split(','),
    }
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
};
