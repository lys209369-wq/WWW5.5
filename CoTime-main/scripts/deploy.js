const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 确保使用本地网络
  const network = hre.network.name;
  console.log(`当前网络: ${network}`);
  
  // 部署合约（不再指定部署器）
  const CoTime = await hre.ethers.getContractFactory("CoTime");
  console.log("部署合约中...");
  
  try {
    // 使用ethers v5 API
    const coTime = await CoTime.deploy({
      gasLimit: 5000000
    });
    
    // 在ethers v5中，使用deployed()方法等待部署完成
    await coTime.deployed();
    // 在ethers v5中，地址直接从contract.address获取
    const address = coTime.address;
    
    console.log("合约部署成功！地址：", address);
    
    // 更新前端的合约地址
    try {
      const utilsDir = path.resolve(__dirname, '../frontend/src/utils');
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      
      const contractJsPath = path.resolve(utilsDir, 'contract.js');
      if (fs.existsSync(contractJsPath)) {
        let contractJsContent = fs.readFileSync(contractJsPath, 'utf8');
        contractJsContent = contractJsContent.replace(
          /export const CONTRACT_ADDRESS = "[^"]*";/, 
          `export const CONTRACT_ADDRESS = "${address}";`
        );
        fs.writeFileSync(contractJsPath, contractJsContent);
        console.log("已更新前端合约地址");
      } else {
        console.warn("未找到contract.js文件，无法自动更新合约地址");
      }
    } catch (fileError) {
      console.error("更新合约地址文件时出错:", fileError);
    }
    
  } catch (deployError) {
    console.error("合约部署失败:", deployError);
    throw deployError;
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("部署过程中发生错误:", err);
    process.exitCode = 1;
  });