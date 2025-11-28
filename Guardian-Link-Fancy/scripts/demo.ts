import { ethers } from "hardhat";
import { GuardianToken, EmergencyTask } from "../typechain-types";

async function main() {
  console.log("🎬 开始 Guardian Link 演示...\n");

  // 使用预定义的合约地址（从部署输出中复制）
  const GUARDIAN_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EMERGENCY_TASK_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // 获取测试账户
  const [user, responder, verifier] = await ethers.getSigners();

  // 使用正确的类型连接到已部署的合约
  const guardianToken = await ethers.getContractAt(
    "GuardianToken",
    GUARDIAN_TOKEN_ADDRESS
  );
  const emergencyTask = await ethers.getContractAt(
    "EmergencyTask",
    EMERGENCY_TASK_ADDRESS
  );

  console.log("👥 角色分配:");
  console.log(`   用户: ${user.address}`);
  console.log(`   响应者: ${responder.address}`);
  console.log(`   验证者: ${verifier.address}`);

  // 检查余额
  console.log("\n💰 初始余额检查:");
  const userBalance = await guardianToken.balanceOf(user.address);
  const responderBalance = await guardianToken.balanceOf(responder.address);
  console.log(`   用户余额: ${ethers.formatEther(userBalance)} GLT`);
  console.log(`   响应者余额: ${ethers.formatEther(responderBalance)} GLT`);

  // 演示开始
  console.log("\n1. 🆘 用户创建紧急任务（悬赏 100 GLT）...");
  const bounty = ethers.parseEther("100");

  // 先授权
  const approveTx = await guardianToken
    .connect(user)
    .approve(EMERGENCY_TASK_ADDRESS, bounty);
  await approveTx.wait();
  console.log("   ✅ 授权成功！");

  // 创建任务
  const createTaskTx = await emergencyTask.connect(user).createTask(bounty);
  await createTaskTx.wait();
  console.log("   ✅ 任务创建成功！");

  console.log("\n2. 🏃 响应者抢单...");
  const acceptTaskTx = await emergencyTask.connect(responder).acceptTask(0);
  await acceptTaskTx.wait();
  console.log("   ✅ 响应者成功接单！");

  console.log("\n3. 📄 响应者提交完成证明...");
  const proofHash = "QmXyZ123abcProofHashForDemo";
  const submitProofTx = await emergencyTask
    .connect(responder)
    .submitProof(0, proofHash);
  await submitProofTx.wait();
  console.log("   ✅ 证明提交成功！");

  console.log("\n4. ✅ 社区验证证明...");
  const verifyTx = await emergencyTask.connect(verifier).verifyProof(0);
  await verifyTx.wait();
  console.log("   ✅ 验证通过！");

  console.log("\n5. 💰 检查赏金支付...");
  const finalBalance = await guardianToken.balanceOf(responder.address);
  console.log(`   ✅ 响应者最终余额: ${ethers.formatEther(finalBalance)} GLT`);

  console.log("\n🎉 演示完成！完整流程验证成功！");
  console.log("\n📊 任务状态:");
  const task = await emergencyTask.tasks(0);
  console.log(`   任务ID: 0`);
  console.log(`   发布者: ${task.user}`);
  console.log(`   响应者: ${task.acceptedBy}`);
  console.log(`   赏金: ${ethers.formatEther(task.bounty)} GLT`);
  console.log(`   状态: ${task.status} (4 = 已支付)`);
  console.log(`   证明哈希: ${task.proofIPFSHash}`);
}

main().catch((error) => {
  console.error("❌ 演示失败:", error);
  process.exitCode = 1;
});
