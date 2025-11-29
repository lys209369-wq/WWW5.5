require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19", // 与你的合约Solidity版本一致
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [process.env.PRIVATE_KEY],
      gas: 5000000, // 足够覆盖合约部署
      gasPrice: 30000000000 // 30 Gwei
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
      gas: 21000000,
      gasPrice: 8000000000,
      timeout: 300000, // 5分钟超时
      mining: {
        auto: true,
        interval: 5000 // 5秒挖一个块
      }
    }
  },
  paths: {
    sources: "./contracts", // 合约文件路径（原结构）
    scripts: "./scripts",   // 部署脚本路径（原结构）
    artifacts: "./artifacts" // 编译产物路径
  },
  mocha: {
    timeout: 20000
  }
};