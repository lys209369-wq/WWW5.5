import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    localhost: {
      url: "http://0.0.0.0:8545", // 直接修改URL
    },
    // 添加一个新的网络配置
    localnetwork: {
      url: "http://192.168.124.5:8545",
    },
  },
};

export default config;
