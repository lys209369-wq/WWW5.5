// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IStakeVault} from "./interfaces/IStakeVault.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

/**
 * @title StakeVault
 * @notice 质押金库合约 - 负责管理所有项目的质押资金
 * @dev 使用 Pull Payment 模式，防止重入攻击
 * 
 * 核心功能：
 * 1. 接收并锁定质押资金
 * 2. 根据 ProjectFactory 指令释放或罚没质押
 * 3. 用户主动提取可用资金（Pull Pattern）
 * 
 * 安全特性：
 * - ReentrancyGuard: 防止重入攻击
 * - Pausable: 紧急暂停功能
 * - Ownable: 管理员权限控制
 */
contract StakeVault is IStakeVault, ReentrancyGuard, Pausable, Ownable {
    // ============ State Variables ============

    /// @notice ProjectFactory 合约地址（只有它能调用 stake 操作）
    address public projectFactory;

    /// @notice TaskManager 合约地址（只有它能调用 release 操作）
    address public taskManager;

    /// @notice 项目质押记录：projectId => member => 质押金额
    mapping(uint256 => mapping(address => uint256)) public projectStakes;

    /// @notice 待提取金额：user => 可提取金额（Pull Payment 模式）
    mapping(address => uint256) public pendingWithdrawals;

    /// @notice 当前锁定的总金额
    uint256 public totalLocked;

    // ============ Modifiers ============

    /// @notice 只允许 ProjectFactory 调用
    modifier onlyFactory() {
        if (msg.sender != projectFactory) revert Errors.OnlyFactory();
        _;
    }

    /// @notice 只允许 ProjectFactory 或 TaskManager 调用
    modifier onlyAuthorized() {
        if (msg.sender != projectFactory && msg.sender != taskManager) {
            revert Errors.OnlyFactory();
        }
        _;
    }

    // ============ Constructor ============

    /**
     * @notice 构造函数
     */
    constructor() Ownable(msg.sender) {}

    // ============ External Functions ============

    /**
     * @notice 存入质押（只能由 ProjectFactory 调用）
     * @param projectId 项目 ID
     * @param member 成员地址
     * @dev 必须附带 ETH，金额会被锁定
     */
    function depositStake(
        uint256 projectId,
        address member
    ) external payable override onlyFactory whenNotPaused {
        if (msg.value == 0) revert Errors.InvalidStakeAmount();

        // 更新质押记录
        projectStakes[projectId][member] = msg.value;
        
        // 更新总锁定金额
        totalLocked += msg.value;

        emit Events.StakeDeposited(
            projectId,
            member,
            uint96(msg.value),
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 释放质押（只能由 ProjectFactory 调用）
     * @param projectId 项目 ID
     * @param member 成员地址
     * @dev 将质押金额添加到成员的待提取余额
     */
    function releaseStake(
        uint256 projectId,
        address member
    ) external override onlyFactory whenNotPaused {
        uint256 stakedAmount = projectStakes[projectId][member];
        if (stakedAmount == 0) revert Errors.StakeNotFound();

        // 清空质押记录（防止重复释放）
        delete projectStakes[projectId][member];

        // 添加到待提取余额（Pull Pattern）
        pendingWithdrawals[member] += stakedAmount;

        // 减少总锁定金额
        totalLocked -= stakedAmount;

        emit Events.StakeReleased(
            projectId,
            member,
            uint96(stakedAmount),
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 罚没质押（只能由 ProjectFactory 调用）
     * @param projectId 项目 ID
     * @param member 被罚没的成员地址
     * @param recipient 罚没金额接收者（通常是项目所有者）
     * @dev 将质押金额转移给接收者
     */
    function slashStake(
        uint256 projectId,
        address member,
        address recipient
    ) external override onlyFactory whenNotPaused {
        uint256 stakedAmount = projectStakes[projectId][member];
        if (stakedAmount == 0) revert Errors.StakeNotFound();

        // 清空质押记录
        delete projectStakes[projectId][member];

        // 添加到接收者的待提取余额
        pendingWithdrawals[recipient] += stakedAmount;

        // 减少总锁定金额
        totalLocked -= stakedAmount;

        emit Events.StakeSlashed(
            projectId,
            member,
            uint96(stakedAmount),
            recipient,
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 提取可用资金（Pull Payment 模式）
     * @dev 用户主动调用，防止重入攻击
     * 
     * 安全模式：Checks-Effects-Interactions
     * 1. Checks: 检查余额
     * 2. Effects: 先更新状态
     * 3. Interactions: 再转账
     */
    function withdrawFunds() external override nonReentrant whenNotPaused {
        uint256 amount = pendingWithdrawals[msg.sender];
        
        // Checks: 检查是否有可提取金额
        if (amount == 0) revert Errors.NoFundsToWithdraw();

        // Effects: 先更新状态（防止重入）
        pendingWithdrawals[msg.sender] = 0;

        // Interactions: 再转账
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert Errors.TransferFailed();

        emit Events.FundsWithdrawn(
            msg.sender,
            amount,
            uint32(block.timestamp)
        );
    }

    // ============ View Functions ============

    /**
     * @notice 查询质押金额
     * @param projectId 项目 ID
     * @param member 成员地址
     * @return 质押金额
     */
    function getStakedAmount(
        uint256 projectId,
        address member
    ) external view override returns (uint256) {
        return projectStakes[projectId][member];
    }

    /**
     * @notice 查询待提取金额
     * @param user 用户地址
     * @return 待提取金额
     */
    function getPendingWithdrawal(address user) external view returns (uint256) {
        return pendingWithdrawals[user];
    }

    /**
     * @notice 查询合约余额
     * @return 合约当前 ETH 余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Admin Functions ============

    /**
     * @notice 设置 ProjectFactory 地址
     * @param _projectFactory ProjectFactory 合约地址
     */
    function setProjectFactory(address _projectFactory) external onlyOwner {
        if (_projectFactory == address(0)) revert Errors.OnlyFactory();
        projectFactory = _projectFactory;
    }

    /**
     * @notice 设置 TaskManager 地址
     * @param _taskManager TaskManager 合约地址
     */
    function setTaskManager(address _taskManager) external onlyOwner {
        if (_taskManager == address(0)) revert Errors.OnlyFactory();
        taskManager = _taskManager;
    }

    /**
     * @notice 暂停合约（紧急情况）
     * @dev 只有 owner 可以调用
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice 恢复合约
     * @dev 只有 owner 可以调用
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice 紧急提取（仅用于合约升级或紧急情况）
     * @param to 接收地址
     * @param amount 提取金额
     * @dev 只有 owner 在暂停状态下可以调用
     */
    function emergencyWithdraw(
        address payable to,
        uint256 amount
    ) external onlyOwner whenPaused {
        if (amount > address(this).balance) revert Errors.InsufficientBalance();
        
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert Errors.TransferFailed();
    }

    // ============ Receive Function ============

    /// @notice 接收 ETH（仅用于退款等特殊情况）
    receive() external payable {}
}
