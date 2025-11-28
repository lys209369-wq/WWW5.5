import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { GuardianToken, EmergencyTask } from "../typechain-types";

describe("Guardian Link 测试套件", function () {
  let guardianToken: GuardianToken;
  let emergencyTask: EmergencyTask;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let responder: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;

  // 测试常量
  const TASK_BOUNTY = ethers.parseEther("100"); // 100 GLT
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 100万 GLT

  beforeEach(async function () {
    // 获取签名者
    [owner, user, responder, verifier] = await ethers.getSigners();

    // 部署代币合约
    const GuardianTokenFactory = await ethers.getContractFactory(
      "GuardianToken"
    );
    guardianToken = await GuardianTokenFactory.deploy();

    // 部署任务合约
    const EmergencyTaskFactory = await ethers.getContractFactory(
      "EmergencyTask"
    );
    emergencyTask = await EmergencyTaskFactory.deploy(
      await guardianToken.getAddress()
    );

    // 给用户和响应者分配代币（从所有者账户转账，而不是铸造新币）
    await guardianToken.transfer(user.address, ethers.parseEther("1000"));
    await guardianToken.transfer(responder.address, ethers.parseEther("1000"));
  });

  describe("代币基础功能", function () {
    it("应该正确初始化代币", async function () {
      expect(await guardianToken.name()).to.equal("GuardianLink Token");
      expect(await guardianToken.symbol()).to.equal("GLT");
      // 修复：检查初始供应量，不包含后续转账
      expect(await guardianToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("应该允许所有者铸造新代币", async function () {
      const initialBalance = await guardianToken.balanceOf(owner.address);
      await guardianToken.mint(owner.address, ethers.parseEther("500"));
      expect(await guardianToken.balanceOf(owner.address)).to.equal(
        initialBalance + ethers.parseEther("500")
      );
    });

    it("非所有者不应该能够铸造代币", async function () {
      await expect(
        guardianToken.connect(user).mint(user.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Only owner can mint");
    });
  });

  describe("紧急任务流程", function () {
    beforeEach(async function () {
      // 用户批准任务合约使用代币
      await guardianToken
        .connect(user)
        .approve(await emergencyTask.getAddress(), TASK_BOUNTY);
    });

    it("应该允许用户创建紧急任务", async function () {
      await expect(emergencyTask.connect(user).createTask(TASK_BOUNTY))
        .to.emit(emergencyTask, "TaskCreated")
        .withArgs(0, user.address);

      const task = await emergencyTask.tasks(0);
      expect(task.user).to.equal(user.address);
      expect(task.bounty).to.equal(TASK_BOUNTY);
    });

    it("应该允许响应者抢单", async function () {
      await emergencyTask.connect(user).createTask(TASK_BOUNTY);

      await expect(emergencyTask.connect(responder).acceptTask(0))
        .to.emit(emergencyTask, "TaskAccepted")
        .withArgs(0, responder.address);

      const task = await emergencyTask.tasks(0);
      expect(task.acceptedBy).to.equal(responder.address);
    });

    it("应该允许响应者提交证明", async function () {
      const proofHash = "QmXtestProofIPFSHash123";

      await emergencyTask.connect(user).createTask(TASK_BOUNTY);
      await emergencyTask.connect(responder).acceptTask(0);

      await expect(emergencyTask.connect(responder).submitProof(0, proofHash))
        .to.emit(emergencyTask, "ProofSubmitted")
        .withArgs(0, proofHash);

      const task = await emergencyTask.tasks(0);
      expect(task.proofIPFSHash).to.equal(proofHash);
    });

    it("应该完成完整的任务流程并支付赏金", async function () {
      // 创建任务
      await emergencyTask.connect(user).createTask(TASK_BOUNTY);

      // 响应者抢单
      await emergencyTask.connect(responder).acceptTask(0);

      // 提交证明
      await emergencyTask.connect(responder).submitProof(0, "proofHash");

      // 验证证明（任何地址都可以验证）
      const initialBalance = await guardianToken.balanceOf(responder.address);
      await emergencyTask.connect(verifier).verifyProof(0);

      // 检查赏金支付
      const finalBalance = await guardianToken.balanceOf(responder.address);
      expect(finalBalance).to.equal(initialBalance + TASK_BOUNTY);
    });

    it("不应该允许非响应者提交证明", async function () {
      await emergencyTask.connect(user).createTask(TASK_BOUNTY);
      await emergencyTask.connect(responder).acceptTask(0);

      await expect(
        emergencyTask.connect(verifier).submitProof(0, "proofHash")
      ).to.be.revertedWith("Only accepted guardian can submit proof");
    });
  });

  describe("边界情况测试", function () {
    it("不应该允许创建赏金为0的任务", async function () {
      await expect(
        emergencyTask.connect(user).createTask(0)
      ).to.be.revertedWith("Bounty must be positive");
    });

    it("不应该允许重复抢单", async function () {
      // 用户需要授权足够的代币用于两个任务
      await guardianToken
        .connect(user)
        .approve(await emergencyTask.getAddress(), TASK_BOUNTY * 2n);

      await emergencyTask.connect(user).createTask(TASK_BOUNTY);
      await emergencyTask.connect(responder).acceptTask(0);

      await expect(
        emergencyTask.connect(verifier).acceptTask(0)
      ).to.be.revertedWith("Task not available");
    });
  });
});
