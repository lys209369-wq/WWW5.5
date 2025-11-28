// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IProjectFactory} from "./interfaces/IProjectFactory.sol";
import {IStakeVault} from "./interfaces/IStakeVault.sol";
import {ITaskManager} from "./interfaces/ITaskManager.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

/**
 * @title ProjectFactory
 * @notice 项目工厂合约 - 系统核心协调合约
 * @dev 负责项目创建、成员管理和协调其他合约
 * 
 * 核心功能：
 * 1. 创建项目并设置质押金额
 * 2. 管理项目成员（加入、退出）
 * 3. 协调 StakeVault、TaskManager、ContributionNFT
 * 4. 项目结算和资金分配
 * 
 * 安全特性：
 * - ReentrancyGuard: 防止重入攻击
 * - Pausable: 紧急暂停功能
 * - 成员数量限制：防止 DOS 攻击
 */
contract ProjectFactory is IProjectFactory, ReentrancyGuard, Pausable, Ownable {
    // ============ Constants ============

    /// @notice 每个项目的最大成员数量（防止 Gas 超限）
    uint256 public constant MAX_MEMBERS_PER_PROJECT = 100;

    /// @notice 最小质押金额（0.001 ETH）
    uint96 public constant MIN_STAKE_AMOUNT = 0.001 ether;

    /// @notice 项目名称最大长度
    uint256 public constant MAX_NAME_LENGTH = 100;

    // ============ State Variables ============

    /// @notice StakeVault 合约地址
    address public immutable STAKE_VAULT;

    /// @notice TaskManager 合约地址
    address public immutable TASK_MANAGER;

    /// @notice 项目 ID 计数器
    uint256 private _projectIdCounter;

    /// @notice 项目存储：projectId => Project
    mapping(uint256 => DataTypes.Project) private _projects;

    /// @notice 用户创建的项目列表：owner => projectId[]
    mapping(address => uint256[]) private _userProjects;

    /// @notice 项目成员数据：projectId => member => Member
    mapping(uint256 => mapping(address => DataTypes.Member)) private _projectMembers;

    /// @notice 项目成员地址列表：projectId => memberAddress[]
    mapping(uint256 => address[]) private _projectMemberList;

    /// @notice 用户参与的项目列表：member => projectId[]
    mapping(address => uint256[]) private _memberProjects;

    // ============ Constructor ============

    /**
     * @notice 构造函数
     * @param stakeVault StakeVault 合约地址
     * @param taskManager TaskManager 合约地址
     * @param initialOwner 合约所有者地址
     */
    constructor(
        address stakeVault,
        address taskManager,
        address initialOwner
    ) Ownable(initialOwner) {
        STAKE_VAULT = stakeVault;
        TASK_MANAGER = taskManager;
        _projectIdCounter = 1;
    }

    // ============ External Functions ============

    /**
     * @notice 创建项目
     * @param name 项目名称
     * @param metadataURI 项目元数据 IPFS URI
     * @param stakeAmount 每个成员需质押的金额（wei）
     * @return projectId 创建的项目 ID
     */
    function createProject(
        string calldata name,
        string calldata metadataURI,
        uint96 stakeAmount
    ) external override whenNotPaused returns (uint256) {
        // 验证参数
        if (bytes(name).length == 0 || bytes(name).length > MAX_NAME_LENGTH) {
            revert Errors.InvalidProjectName();
        }
        if (stakeAmount < MIN_STAKE_AMOUNT) {
            revert Errors.InvalidStakeAmount();
        }

        // 生成项目 ID
        uint256 projectId = _projectIdCounter;
        unchecked {
            _projectIdCounter++;
        }

        // 创建项目
        _projects[projectId] = DataTypes.Project({
            id: projectId,
            owner: msg.sender,
            name: name,
            metadataURI: metadataURI,
            stakeAmount: stakeAmount,
            status: DataTypes.ProjectStatus.Active,
            createdAt: uint32(block.timestamp),
            memberCount: 0,
            totalStaked: 0,
            totalSlashed: 0
        });

        // 更新用户项目列表
        _userProjects[msg.sender].push(projectId);

        emit Events.ProjectCreated(
            projectId,
            msg.sender,
            name,
            stakeAmount,
            uint32(block.timestamp)
        );

        return projectId;
    }

    /**
     * @notice 加入项目并质押
     * @param projectId 项目 ID
     * @dev 需要附带正确金额的 ETH
     */
    function joinProject(uint256 projectId) 
        external 
        payable 
        override 
        nonReentrant 
        whenNotPaused 
    {
        DataTypes.Project storage project = _projects[projectId];
        
        // 验证项目存在
        if (project.id == 0) revert Errors.ProjectNotFound();
        
        // 验证项目状态
        if (project.status != DataTypes.ProjectStatus.Active) {
            revert Errors.ProjectNotActive();
        }

        // 验证是否已是成员
        if (_projectMembers[projectId][msg.sender].memberAddress != address(0)) {
            revert Errors.AlreadyMember();
        }

        // 验证质押金额
        if (msg.value != project.stakeAmount) {
            revert Errors.IncorrectStakeAmount();
        }

        // 验证成员数量限制
        if (project.memberCount >= MAX_MEMBERS_PER_PROJECT) {
            revert Errors.MemberLimitReached();
        }

        // 调用 StakeVault 存入质押
        IStakeVault(STAKE_VAULT).depositStake{value: msg.value}(projectId, msg.sender);

        // 创建成员记录
        _projectMembers[projectId][msg.sender] = DataTypes.Member({
            memberAddress: msg.sender,
            stakedAmount: uint96(msg.value),
            joinedAt: uint32(block.timestamp),
            status: DataTypes.MemberStatus.Staked,
            tasksCompleted: 0,
            tasksRejected: 0
        });

        // 更新索引
        _projectMemberList[projectId].push(msg.sender);
        _memberProjects[msg.sender].push(projectId);

        // 更新项目统计
        project.memberCount++;
        project.totalStaked += uint96(msg.value);

        emit Events.MemberJoined(
            projectId,
            msg.sender,
            uint96(msg.value),
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 结算项目
     * @param projectId 项目 ID
     * @dev 只有项目所有者可以调用
     * 
     * 结算逻辑：
     * 1. 遍历所有成员
     * 2. 状态为 Staked 的成员（未完成任务）→ 罚没质押
     * 3. 状态为 Returned 的成员（已完成任务）→ 已处理，跳过
     * 4. 更新项目状态为 Finalized
     */
    function finalizeProject(uint256 projectId) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
    {
        DataTypes.Project storage project = _projects[projectId];
        
        // 验证项目存在
        if (project.id == 0) revert Errors.ProjectNotFound();
        
        // 验证调用者是项目所有者
        if (project.owner != msg.sender) revert Errors.OnlyProjectOwner();
        
        // 验证项目状态
        if (project.status != DataTypes.ProjectStatus.Active) {
            revert Errors.ProjectAlreadyFinalized();
        }

        uint96 totalReturned = 0;
        uint96 totalSlashed = 0;

        // 遍历所有成员处理未结算的质押
        address[] memory members = _projectMemberList[projectId];
        for (uint256 i = 0; i < members.length; ) {
            address member = members[i];
            DataTypes.Member storage m = _projectMembers[projectId][member];

            // 只处理仍处于 Staked 状态的成员（未完成任务或任务被拒绝）
            if (m.status == DataTypes.MemberStatus.Staked) {
                // 罚没质押（转给项目所有者）
                IStakeVault(STAKE_VAULT).slashStake(projectId, member, project.owner);
                
                // 更新成员状态
                m.status = DataTypes.MemberStatus.Slashed;
                
                // 累计罚没金额
                totalSlashed += m.stakedAmount;
            } else if (m.status == DataTypes.MemberStatus.Returned) {
                // 已返还的质押
                totalReturned += m.stakedAmount;
            }

            unchecked {
                ++i;
            }
        }

        // 更新项目状态
        project.status = DataTypes.ProjectStatus.Finalized;
        project.totalSlashed = totalSlashed;

        emit Events.ProjectFinalized(
            projectId,
            totalReturned,
            totalSlashed,
            uint32(block.timestamp)
        );
    }

    /**
     * @notice 更新成员状态（由 TaskManager 调用）
     * @param projectId 项目 ID
     * @param member 成员地址
     * @param approved 是否批准任务
     * @dev 这是一个内部辅助函数，用于在任务审核后更新成员统计
     */
    function updateMemberStats(
        uint256 projectId,
        address member,
        bool approved
    ) external {
        // 只允许 TaskManager 调用
        if (msg.sender != TASK_MANAGER) revert Errors.OnlyProjectOwner();

        DataTypes.Member storage m = _projectMembers[projectId][member];
        
        if (m.memberAddress == address(0)) revert Errors.NotMember();

        if (approved) {
            // 任务批准
            m.tasksCompleted++;
            m.status = DataTypes.MemberStatus.Returned;
        } else {
            // 任务拒绝
            m.tasksRejected++;
        }
    }

    // ============ View Functions ============

    /**
     * @notice 获取项目信息
     * @param projectId 项目 ID
     * @return 项目数据
     */
    function getProject(uint256 projectId) 
        external 
        view 
        override 
        returns (DataTypes.Project memory) 
    {
        if (_projects[projectId].id == 0) revert Errors.ProjectNotFound();
        return _projects[projectId];
    }

    /**
     * @notice 获取成员信息
     * @param projectId 项目 ID
     * @param member 成员地址
     * @return 成员数据
     */
    function getMember(uint256 projectId, address member) 
        external 
        view 
        override 
        returns (DataTypes.Member memory) 
    {
        return _projectMembers[projectId][member];
    }

    /**
     * @notice 获取项目的所有成员地址
     * @param projectId 项目 ID
     * @return 成员地址数组
     */
    function getProjectMembers(uint256 projectId) 
        external 
        view 
        returns (address[] memory) 
    {
        return _projectMemberList[projectId];
    }

    /**
     * @notice 获取用户创建的所有项目
     * @param owner 项目所有者地址
     * @return 项目 ID 数组
     */
    function getUserProjects(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _userProjects[owner];
    }

    /**
     * @notice 获取用户参与的所有项目
     * @param member 成员地址
     * @return 项目 ID 数组
     */
    function getMemberProjects(address member) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _memberProjects[member];
    }

    /**
     * @notice 检查用户是否为项目成员
     * @param projectId 项目 ID
     * @param member 成员地址
     * @return 是否为成员
     */
    function isMember(uint256 projectId, address member) 
        external 
        view 
        returns (bool) 
    {
        return _projectMembers[projectId][member].memberAddress != address(0);
    }

    /**
     * @notice 检查用户是否为项目所有者
     * @param projectId 项目 ID
     * @param owner 用户地址
     * @return 是否为所有者
     */
    function isProjectOwner(uint256 projectId, address owner) 
        external 
        view 
        returns (bool) 
    {
        return _projects[projectId].owner == owner;
    }

    /**
     * @notice 获取下一个项目 ID
     * @return 下一个将被创建的项目 ID
     */
    function nextProjectId() external view returns (uint256) {
        return _projectIdCounter;
    }

    /**
     * @notice 获取项目统计信息
     * @param projectId 项目 ID
     * @return activeMembers 活跃成员数
     * @return returnedMembers 已返还成员数
     * @return slashedMembers 已罚没成员数
     */
    function getProjectStats(uint256 projectId) 
        external 
        view 
        returns (
            uint256 activeMembers,
            uint256 returnedMembers,
            uint256 slashedMembers
        ) 
    {
        address[] memory members = _projectMemberList[projectId];
        
        for (uint256 i = 0; i < members.length; ) {
            DataTypes.MemberStatus status = _projectMembers[projectId][members[i]].status;
            
            if (status == DataTypes.MemberStatus.Staked) {
                activeMembers++;
            } else if (status == DataTypes.MemberStatus.Returned) {
                returnedMembers++;
            } else if (status == DataTypes.MemberStatus.Slashed) {
                slashedMembers++;
            }

            unchecked {
                ++i;
            }
        }
    }

    // ============ Admin Functions ============

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

    /**
     * @notice 取消项目（紧急情况）
     * @param projectId 项目 ID
     * @dev 只有 owner 可以调用，用于处理异常情况
     */
    function cancelProject(uint256 projectId) external onlyOwner {
        DataTypes.Project storage project = _projects[projectId];
        
        if (project.id == 0) revert Errors.ProjectNotFound();
        if (project.status != DataTypes.ProjectStatus.Active) {
            revert Errors.ProjectAlreadyFinalized();
        }

        project.status = DataTypes.ProjectStatus.Cancelled;

        emit Events.ProjectCancelled(projectId, uint32(block.timestamp));
    }
}
