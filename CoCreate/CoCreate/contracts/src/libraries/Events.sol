// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DataTypes} from "./DataTypes.sol";

/**
 * @title Events
 * @notice 定义所有事件，便于前端监听
 */
library Events {
    // ============ ProjectFactory Events ============
    
    /// @notice 项目创建事件
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        string name,
        uint96 stakeAmount,
        uint32 timestamp
    );

    /// @notice 成员加入事件
    event MemberJoined(
        uint256 indexed projectId,
        address indexed member,
        uint96 stakedAmount,
        uint32 timestamp
    );

    /// @notice 项目结算事件
    event ProjectFinalized(
        uint256 indexed projectId,
        uint96 totalReturned,
        uint96 totalSlashed,
        uint32 timestamp
    );

    /// @notice 项目取消事件
    event ProjectCancelled(
        uint256 indexed projectId,
        uint32 timestamp
    );

    // ============ TaskManager Events ============
    
    /// @notice 任务创建事件
    event TaskCreated(
        uint256 indexed taskId,
        uint256 indexed projectId,
        address indexed assignee,
        string title,
        uint32 timestamp
    );

    /// @notice 证明提交事件
    event ProofSubmitted(
        uint256 indexed taskId,
        uint256 indexed projectId,
        address indexed assignee,
        string proofCID,
        uint32 timestamp
    );

    /// @notice 任务状态更新事件
    event TaskStatusUpdated(
        uint256 indexed taskId,
        DataTypes.TaskStatus oldStatus,
        DataTypes.TaskStatus newStatus,
        uint32 timestamp
    );

    /// @notice 任务审核事件
    event TaskReviewed(
        uint256 indexed taskId,
        uint256 indexed projectId,
        address indexed reviewer,
        bool approved,
        uint32 timestamp
    );

    // ============ StakeVault Events ============
    
    /// @notice 质押存入事件
    event StakeDeposited(
        uint256 indexed projectId,
        address indexed member,
        uint96 amount,
        uint32 timestamp
    );

    /// @notice 质押释放事件
    event StakeReleased(
        uint256 indexed projectId,
        address indexed member,
        uint96 amount,
        uint32 timestamp
    );

    /// @notice 质押罚没事件
    event StakeSlashed(
        uint256 indexed projectId,
        address indexed member,
        uint96 amount,
        address indexed recipient,
        uint32 timestamp
    );

    /// @notice 资金提取事件
    event FundsWithdrawn(
        address indexed user,
        uint256 amount,
        uint32 timestamp
    );

    // ============ ContributionNFT Events ============
    
    /// @notice NFT 铸造事件
    event ContributionNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed projectId,
        uint256 indexed taskId,
        address contributor,
        string proofCID,
        uint32 timestamp
    );

    /// @notice 元数据更新事件
    event TokenMetadataUpdated(
        uint256 indexed tokenId,
        string newMetadataURI,
        uint32 timestamp
    );
}
