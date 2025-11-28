import { ethers } from "hardhat";

async function main() {
  console.log("🚀 开始部署 Guardian Link 合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log(`📝 部署者地址: ${deployer.address}`);

  // 1. 部署 GuardianToken
  console.log("\n📦 正在部署 GuardianToken...");
  const GuardianToken = await ethers.getContractFactory("GuardianToken");
  const guardianToken = await GuardianToken.deploy();
  await guardianToken.waitForDeployment();
  const tokenAddress = await guardianToken.getAddress();
  console.log(`✅ GuardianToken 已部署: ${tokenAddress}`);

  // 2. 部署 EmergencyTask
  console.log("\n📦 正在部署 EmergencyTask...");
  const EmergencyTask = await ethers.getContractFactory("EmergencyTask");
  const emergencyTask = await EmergencyTask.deploy(tokenAddress);
  await emergencyTask.waitForDeployment();
  const taskAddress = await emergencyTask.getAddress();
  console.log(`✅ EmergencyTask 已部署: ${taskAddress}`);

  // 3. 给测试账户分配代币
  console.log("\n💰 分配测试代币...");
  const accounts = await ethers.getSigners();

  // 给几个测试账户各分配 1000 GLT
  for (let i = 1; i <= 3; i++) {
    const amount = ethers.parseEther("1000");
    await guardianToken.transfer(accounts[i].address, amount);
    console.log(`✅ 给 ${accounts[i].address} 分配了 1000 GLT`);
  }

  console.log("\n🎉 部署完成！");
  console.log("==========================================");
  console.log("📊 合约地址:");
  console.log(`   GuardianToken: ${tokenAddress}`);
  console.log(`   EmergencyTask: ${taskAddress}`);
  console.log("\n👥 测试账户:");
  accounts.slice(0, 4).forEach((account, index) => {
    console.log(`   账户 ${index}: ${account.address}`);
  });
  console.log("==========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
