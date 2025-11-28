// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title DataTypes
 * @notice 定义 Cocreate DApp 中使用的所有数据结构
 * @dev 使用库来存储共享的数据类型，避免重复定义
 */
library DataTypes {
    /// @notice 项目状态枚举
    enum ProjectStatus {
        Active,      // 0 - 进行中
        Finalized,   // 1 - 已结算
        Cancelled    // 2 - 已取消
    }

    /// @notice 成员状态枚举
    enum MemberStatus {
        None,        // 0 - 未加入
        Staked,      // 1 - 已质押
        Returned,    // 2 - 已退还
        Slashed      // 3 - 已罚没
    }

    /// @notice 任务状态枚举
    enum TaskStatus {
        Pending,        // 0 - 待处理
        Submitted,      // 1 - 已提交
        UnderReview,    // 2 - 审核中
        Approved,       // 3 - 已批准
        Rejected        // 4 - 已拒绝
    }

    /// @notice 项目数据结构
    struct Project {
        uint256 id;                     // 项目 ID
        address owner;                  // 项目所有者
        string name;                    // 项目名称
        string metadataURI;             // 项目元数据 IPFS URI
        uint96 stakeAmount;             // 每个成员需质押的金额（wei）
        ProjectStatus status;           // 项目状态
        uint32 createdAt;               // 创建时间戳
        uint32 memberCount;             // 成员数量
        uint96 totalStaked;             // 总质押金额
        uint96 totalSlashed;            // 已罚没金额
    }

    /// @notice 成员数据结构
    struct Member {
        address memberAddress;          // 成员地址
        uint96 stakedAmount;            // 质押金额
        uint32 joinedAt;                // 加入时间
        MemberStatus status;            // 成员状态
        uint16 tasksCompleted;          // 完成任务数
        uint16 tasksRejected;           // 被拒绝任务数
    }

    /// @notice 任务数据结构
    struct Task {
        uint256 id;                     // 任务 ID
        uint256 projectId;              // 所属项目 ID
        address assignee;               // 指派给谁
        string title;                   // 任务标题
        string metadataURI;             // 任务详情 IPFS URI
        string proofCID;                // 证明文件 IPFS CID
        TaskStatus status;              // 任务状态
        uint32 submittedAt;             // 提交时间
        uint32 reviewedAt;              // 审核时间
        uint96 rewardAmount;            // 奖励金额（可选）
    }

    /// @notice NFT 元数据结构
    struct TokenMetadata {
        uint256 projectId;              // 项目 ID
        uint256 taskId;                 // 任务 ID
        address contributor;            // 贡献者地址
        string proofCID;                // 证明 CID
        uint32 mintedAt;                // 铸造时间
    }
}
