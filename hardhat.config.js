require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337
    },
    
    // Ethereum
    mainnet: {
      url: "https://mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f",
      accounts: ["b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5"],
      chainId: 1
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f",
      accounts: ["b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5"],
      chainId: 11155111
    },
    
    // Polygon
    polygon: {
      url: "https://polygon-mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f",
      accounts: ["b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5"],
      chainId: 137
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f",
      accounts: ["b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5"],
      chainId: 80001
    }
  },
  etherscan: {
    apiKey: {
      mainnet: "2AbR4u0i6YDElUC0uLyGpzeomDR",
      sepolia: "2AbR4u0i6YDElUC0uLyGpzeomDR",
      polygon: "2AbR4u0i6YDElUC0uLyGpzeomDR",
      polygonMumbai: "2AbR4u0i6YDElUC0uLyGpzeomDR"
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: "e99cf75235349e1c01dbf1afa33fa840"
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    strict: true,
  }
};
