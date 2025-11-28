// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ITaskManager} from "./interfaces/ITaskManager.sol";
import {IStakeVault} from "./interfaces/IStakeVault.sol";
import {IContributionNFT} from "./interfaces/IContributionNFT.sol";
import {IProjectFactory} from "./interfaces/IProjectFactory.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

/**
 * @title TaskManager
 * @notice 任务管理合约 - 负责任务的创建、提交证明和审核
 * @dev 核心协作逻辑合约
 * 
 * 核心功能：
 * 1. 项目所有者创建任务
 * 2. 成员提交任务证明（IPFS CID）
 * 3. 项目所有者审核任务
 * 4. 审核通过 → 铸造 NFT + 释放质押
 * 5. 审核拒绝 → 罚没质押
 * 
 * 安全特性：
 * - ReentrancyGuard: 防止重入攻击
 * - Pausable: 紧急暂停功能
 * - 严格的权限检查
 */
contract TaskManager is ITaskManager, ReentrancyGuard, Pausable, Ownable {
    // ============ State Variables ============

    /// @notice ProjectFactory 合约地址
    address public PROJECT_FACTORY;

    /// @notice StakeVault 合约地址
    address public STAKE_VAULT;

    /// @notice ContributionNFT 合约地址
    address public CONTRIBUTION_NFT;

    /// @notice 任务 ID 计数器
    uint256 private _taskIdCounter;

    /// @notice 任务存储：taskId => Task
    mapping(uint256 => DataTypes.Task) private _tasks;

    /// @notice 项目任务列表：projectId => taskId[]
    mapping(uint256 => uint256[]) private _projectTasks;

    /// @notice 用户任务列表：userAddress => taskId[]
    mapping(address => uint256[]) private _userTasks;

    /// @notice 任务提交历史（支持重新提交）
    struct SubmissionHistory {
        string proofCID;
        uint32 timestamp;
        bool isActive;
    }
    mapping(uint256 => SubmissionHistory[]) private _taskSubmissions;

    // ============ Modifiers ============

    /// @notice 只允许项目所有者调用
    modifier onlyProjectOwner(uint256 projectId) {
        DataTypes.Project memory project = IProjectFactory(PROJECT_FACTORY).getProject(projectId);
        if (project.owner != msg.sender) revert Errors.OnlyProjectOwner();
        _;
    }

    /// @notice 只允许任务指派人调用
    modifier onlyAssignee(uint256 taskId) {
        if (_tasks[taskId].assignee != msg.sender) revert Errors.OnlyAssignee();
        _;
    }

    /// @notice 检查项目是否处于活跃状态
    modifier onlyActiveProject(uint256 projectId) {
        DataTypes.Project memory project = IProjectFactory(PROJECT_FACTORY).getProject(projectId);
        if (project.status != DataTypes.ProjectStatus.Active) revert Errors.ProjectNotActive();
        _;
    }

    // ============ Constructor ============

    /**
     * @notice 构造函数
     * @param projectFactory ProjectFactory 合约地址
     * @param stakeVault StakeVault 合约地址
     * @param contributionNFT ContributionNFT 合约地址
     * @param initialOwner 合约所有者地址
     */
    constructor(
        address projectFactory,
        address stakeVault,
        address contributionNFT,
        address initialOwner
    ) Ownable(initialOwner) {
        PROJECT_FACTORY = projectFactory;
        STAKE_VAULT = stakeVault;
        CONTRIBUTION_NFT = contributionNFT;
        _taskIdCounter = 1;
    }

    // ============ External Functions ============

    /**
     * @notice 创建任务
     * @param projectId 项目 ID
     * @param assignee 任务指派人地址
     * @param title 任务标题
     * @param metadataURI 任务元数据 IPFS URI
     * @return taskId 创建的任务 ID
     * @dev 只有项目所有者可以调用
     */
    function createTask(
        uint256 projectId,
        address assignee,
        string calldata title,
        string calldata metadataURI
    ) 
        external 
        override 
        onlyProjectOwner(projectId) 
        onlyActiveProject(projectId)
        whenNotPaused 
        returns (uint256) 
    {
        // 验证参数
        if (bytes(title).length == 0) revert Errors.EmptyTitle();
        if (assignee == address(0)) revert Errors.NotMember();
        
        // 验证 assignee 是否为项目成员
        DataTypes.Member memory member = IProjectFactory(PROJECT_FACTORY).getMember(projectId, assignee);
        if (member.memberAddress == address(0)) revert Errors.NotMember();

        // 生成任务 ID
        uint256 taskId = _taskIdCounter;
        unchecked {
            _taskIdCounter++;
        }

        // 创建任务
        _tasks[taskId] = DataTypes.Task({
            id: taskId,
            projectId: projectId,
            assignee: assignee,
            title: title,
            metadataURI: metadataURI,
            proofCID: "",
            status: DataTypes.TaskStatus.Pending,
            submittedAt: 0,
            reviewedAt: 0,
            rewardAmount: 0
        });

        // 更新索引
        _projectTasks[projectId].push(taskId);
        _userTasks[assignee].push(taskId);

        emit Events.TaskCreated(
            taskId,
            projectId,
            assignee,
            title,
            uint32(block.timestamp)
        );

        return taskId;
    }

    /**
     * @notice 提交任务证明
     * @param taskId 任务 ID
     * @param proofCID 证明文件 IPFS CID
     * @dev 只有任务指派人可以调用，允许重复提交
     */
    function submitProof(
        uint256 taskId,
        string calldata proofCID
    ) external override onlyAssignee(taskId) whenNotPaused {
        DataTypes.Task storage task = _tasks[taskId];
        
        // 验证任务状态（只有 Pending 或 Rejected 状态可以提交）
        if (
            task.status != DataTypes.TaskStatus.Pending &&
            task.status != DataTypes.TaskStatus.Rejected
        ) {
            revert Errors.InvalidTaskStatus();
        }

        // 验证 proofCID
        if (bytes(proofCID).length == 0) revert Errors.InvalidProofCID();
        if (bytes(proofCID).length > 100) revert Errors.InvalidProofCID(); // CID 长度限制

        // 验证项目是否活跃
        DataTypes.Project memory project = IProjectFactory(PROJECT_FACTORY).getProject(task.projectId);
        if (project.status != DataTypes.ProjectStatus.Active) revert Errors.ProjectNotActive();

        // 记录旧状态
        DataTypes.TaskStatus oldStatus = task.status;

        // 更新任务数据
        task.proofCID = proofCID;
        task.status = DataTypes.TaskStatus.Submitted;
        task.submittedAt = uint32(block.timestamp);

        // 记录提交历史
        _taskSubmissions[taskId].push(
            SubmissionHistory({
                proofCID: proofCID,
                timestamp: uint32(block.timestamp),
                isActive: true
            })
        );

        emit Events.ProofSubmitted(
            taskId,
            task.projectId,
            msg.sender,
            proofCID,
            uint32(block.timestamp)
        );

        emit Events.TaskStatusUpdated(
            taskId,
            oldStatus,
            DataTypes.TaskStatus.Submitted,
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 审核任务
     * @param taskId 任务 ID
     * @param approved 是否批准
     * @dev 只有项目所有者可以调用
     * 
     * 审核逻辑：
     * - 批准：释放质押 + 铸造 NFT + 更新成员统计
     * - 拒绝：罚没质押 + 更新成员统计
     */
    function reviewTask(
        uint256 taskId,
        bool approved
    ) external override nonReentrant whenNotPaused {
        DataTypes.Task storage task = _tasks[taskId];
        
        // 验证任务存在
        if (task.id == 0) revert Errors.TaskNotFound();

        // 验证调用者是项目所有者
        DataTypes.Project memory project = IProjectFactory(PROJECT_FACTORY).getProject(task.projectId);
        if (project.owner != msg.sender) revert Errors.OnlyProjectOwner();

        // 验证任务状态（只有 Submitted 状态可以审核）
        if (task.status != DataTypes.TaskStatus.Submitted) {
            revert Errors.InvalidTaskStatus();
        }

        // 记录旧状态
        DataTypes.TaskStatus oldStatus = task.status;

        if (approved) {
            // ========== 批准任务 ==========
            
            // 1. 更新任务状态
            task.status = DataTypes.TaskStatus.Approved;
            task.reviewedAt = uint32(block.timestamp);

            // 2. 释放质押（调用 StakeVault）
            IStakeVault(STAKE_VAULT).releaseStake(task.projectId, task.assignee);

            // 3. 铸造 NFT（调用 ContributionNFT）
            IContributionNFT(CONTRIBUTION_NFT).mint(
                task.assignee,
                task.projectId,
                taskId,
                task.proofCID
            );

            // 注意：成员统计的更新由 ProjectFactory 负责
            
        } else {
            // ========== 拒绝任务 ==========
            
            // 1. 更新任务状态
            task.status = DataTypes.TaskStatus.Rejected;
            task.reviewedAt = uint32(block.timestamp);

            // 2. 罚没质押（质押转给项目所有者）
            IStakeVault(STAKE_VAULT).slashStake(
                task.projectId,
                task.assignee,
                project.owner
            );

            // 注意：成员统计的更新由 ProjectFactory 负责
        }

        emit Events.TaskReviewed(
            taskId,
            task.projectId,
            msg.sender,
            approved,
            uint32(block.timestamp)
        );

        emit Events.TaskStatusUpdated(
            taskId,
            oldStatus,
            task.status,
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 批量创建任务（Gas 优化）
     * @param projectId 项目 ID
     * @param assignees 任务指派人地址数组
     * @param titles 任务标题数组
     * @param metadataURIs 任务元数据 URI 数组
     * @return taskIds 创建的任务 ID 数组
     */
    function createTasksBatch(
        uint256 projectId,
        address[] calldata assignees,
        string[] calldata titles,
        string[] calldata metadataURIs
    ) 
        external 
        onlyProjectOwner(projectId) 
        onlyActiveProject(projectId)
        whenNotPaused 
        returns (uint256[] memory) 
    {
        uint256 length = assignees.length;
        if (length != titles.length || length != metadataURIs.length) {
            revert Errors.InvalidTaskStatus();
        }

        uint256[] memory taskIds = new uint256[](length);

        for (uint256 i = 0; i < length; ) {
            taskIds[i] = this.createTask(
                projectId,
                assignees[i],
                titles[i],
                metadataURIs[i]
            );
            unchecked {
                ++i;
            }
        }

        return taskIds;
    }

    // ============ View Functions ============

    /**
     * @notice 获取任务信息
     * @param taskId 任务 ID
     * @return 任务数据
     */
    function getTaskInfo(uint256 taskId) 
        external 
        view 
        override 
        returns (DataTypes.Task memory) 
    {
        if (_tasks[taskId].id == 0) revert Errors.TaskNotFound();
        return _tasks[taskId];
    }

    /**
     * @notice 获取项目的所有任务
     * @param projectId 项目 ID
     * @return taskIds 任务 ID 数组
     */
    function getProjectTasks(uint256 projectId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _projectTasks[projectId];
    }

    /**
     * @notice 获取用户的所有任务
     * @param user 用户地址
     * @return taskIds 任务 ID 数组
     */
    function getUserTasks(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _userTasks[user];
    }

    /**
     * @notice 获取任务提交历史
     * @param taskId 任务 ID
     * @return submissions 提交历史数组
     */
    function getTaskSubmissions(uint256 taskId) 
        external 
        view 
        returns (SubmissionHistory[] memory) 
    {
        return _taskSubmissions[taskId];
    }

    /**
     * @notice 获取下一个任务 ID
     * @return 下一个将被创建的任务 ID
     */
    function nextTaskId() external view returns (uint256) {
        return _taskIdCounter;
    }

    /**
     * @notice 获取项目的任务统计
     * @param projectId 项目 ID
     * @return total 总任务数
     * @return pending 待处理任务数
     * @return submitted 已提交任务数
     * @return approved 已批准任务数
     * @return rejected 已拒绝任务数
     */
    function getProjectTaskStats(uint256 projectId) 
        external 
        view 
        returns (
            uint256 total,
            uint256 pending,
            uint256 submitted,
            uint256 approved,
            uint256 rejected
        ) 
    {
        uint256[] memory tasks = _projectTasks[projectId];
        total = tasks.length;

        for (uint256 i = 0; i < total; ) {
            DataTypes.TaskStatus status = _tasks[tasks[i]].status;
            
            if (status == DataTypes.TaskStatus.Pending) {
                pending++;
            } else if (status == DataTypes.TaskStatus.Submitted || status == DataTypes.TaskStatus.UnderReview) {
                submitted++;
            } else if (status == DataTypes.TaskStatus.Approved) {
                approved++;
            } else if (status == DataTypes.TaskStatus.Rejected) {
                rejected++;
            }

            unchecked {
                ++i;
            }
        }
    }

    // ============ Admin Functions ============

    /**
     * @notice 设置 ProjectFactory 地址
     * @param _projectFactory ProjectFactory 合约地址
     */
    function setProjectFactory(address _projectFactory) external onlyOwner {
        if (_projectFactory == address(0)) revert Errors.OnlyFactory();
        PROJECT_FACTORY = _projectFactory;
    }

    /**
     * @notice 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
