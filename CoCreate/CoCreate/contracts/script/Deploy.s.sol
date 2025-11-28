// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StakeVault} from "../src/StakeVault.sol";
import {ContributionNFT} from "../src/ContributionNFT.sol";
import {TaskManager} from "../src/TaskManager.sol";
import {ProjectFactory} from "../src/ProjectFactory.sol";

/**
 * @title Deploy
 * @notice Cocreate 系统部署脚本
 * @dev 部署顺序：
 *   1. StakeVault（独立合约）
 *   2. ContributionNFT（独立合约）
 *   3. TaskManager（依赖 ProjectFactory、StakeVault、ContributionNFT）
 *   4. ProjectFactory（依赖 StakeVault、TaskManager）
 * 
 * 使用方法：
 *   # 本地部署（Anvil）
 *   forge script script/Deploy.s.sol --rpc-url localhost --broadcast
 * 
 *   # 测试网部署（Sepolia）
 *   forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
 * 
 *   # 主网部署
 *   forge script script/Deploy.s.sol --rpc-url mainnet --broadcast --verify
 */
contract Deploy is Script {
    // 部署的合约实例
    StakeVault public stakeVault;
    ContributionNFT public contributionNFT;
    TaskManager public taskManager;
    ProjectFactory public projectFactory;

    // 配置参数
    address public deployer;
    address public owner;

    function setUp() public {}

    function run() public {
        // 获取部署者私钥
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);
        
        // 默认 owner 为 deployer，可以通过环境变量覆盖
        owner = vm.envOr("OWNER_ADDRESS", deployer);

        console.log("=== Cocreate Deployment Script ===");
        console.log("Deployer:", deployer);
        console.log("Owner:", owner);
        console.log("Chain ID:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // ============ Step 1: 部署 StakeVault ============
        console.log("Step 1: Deploying StakeVault...");
        stakeVault = new StakeVault();
        console.log("StakeVault deployed at:", address(stakeVault));
        console.log("");

        // ============ Step 2: 部署 TaskManager（临时地址） ============
        console.log("Step 2: Deploying TaskManager (with temp ProjectFactory)...");
        // 先用零地址占位，稍后会设置 ProjectFactory
        taskManager = new TaskManager(
            address(0), // ProjectFactory 稍后设置
            address(stakeVault),
            address(0), // ContributionNFT 稍后设置
            owner
        );
        console.log("TaskManager deployed at:", address(taskManager));
        console.log("");

        // ============ Step 3: 部署 ContributionNFT ============
        console.log("Step 3: Deploying ContributionNFT...");
        contributionNFT = new ContributionNFT(
            "Cocreate Contribution",    // name
            "COCONT",                    // symbol
            true,                        // soulbound (不可转让)
            owner,                       // admin
            address(taskManager)         // minter
        );
        console.log("ContributionNFT deployed at:", address(contributionNFT));
        console.log("");

        // ============ Step 4: 部署 ProjectFactory ============
        console.log("Step 4: Deploying ProjectFactory...");
        projectFactory = new ProjectFactory(
            address(stakeVault),
            address(taskManager),
            owner
        );
        console.log("ProjectFactory deployed at:", address(projectFactory));
        console.log("");

        // ============ Step 5: 配置合约权限 ============
        console.log("Step 5: Configuring contract permissions...");
        
        // 5.1 StakeVault 授权 ProjectFactory 和 TaskManager
        stakeVault.setProjectFactory(address(projectFactory));
        stakeVault.setTaskManager(address(taskManager));
        console.log("- StakeVault authorized ProjectFactory and TaskManager");

        // 5.2 TaskManager 设置 ProjectFactory
        taskManager.setProjectFactory(address(projectFactory));
        console.log("- TaskManager set ProjectFactory address");
        console.log("");

        vm.stopBroadcast();

        // ============ 部署总结 ============
        console.log("=== Deployment Summary ===");
        console.log("StakeVault:       ", address(stakeVault));
        console.log("ContributionNFT:  ", address(contributionNFT));
        console.log("TaskManager:      ", address(taskManager));
        console.log("ProjectFactory:   ", address(projectFactory));
        console.log("");
        console.log("Deployment completed successfully!");
        console.log("");

        // ============ 保存部署地址 ============
        string memory deploymentInfo = string.concat(
            "# Cocreate Deployment Addresses\n\n",
            "## Network: ", vm.toString(block.chainid), "\n",
            "## Deployer: ", vm.toString(deployer), "\n",
            "## Owner: ", vm.toString(owner), "\n\n",
            "- **StakeVault**: `", vm.toString(address(stakeVault)), "`\n",
            "- **ContributionNFT**: `", vm.toString(address(contributionNFT)), "`\n",
            "- **TaskManager**: `", vm.toString(address(taskManager)), "`\n",
            "- **ProjectFactory**: `", vm.toString(address(projectFactory)), "`\n"
        );

        string memory fileName = string.concat(
            "deployments/",
            vm.toString(block.chainid),
            ".md"
        );
        
        vm.writeFile(fileName, deploymentInfo);
        console.log("Deployment info saved to:", fileName);
    }
}
