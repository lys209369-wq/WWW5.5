// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

/**
 * @title ITaskManager
 * @notice 任务管理接口
 */
interface ITaskManager {
    /// @notice 创建任务
    function createTask(
        uint256 projectId,
        address assignee,
        string calldata title,
        string calldata metadataURI
    ) external returns (uint256);
    
    /// @notice 提交证明
    function submitProof(uint256 taskId, string calldata proofCID) external;
    
    /// @notice 审核任务
    function reviewTask(uint256 taskId, bool approved) external;
    
    /// @notice 获取任务信息
    function getTaskInfo(uint256 taskId) 
        external 
        view 
        returns (DataTypes.Task memory);
}
