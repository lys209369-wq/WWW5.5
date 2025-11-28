// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

/**
 * @title IProjectFactory
 * @notice 项目工厂接口
 */
interface IProjectFactory {
    /// @notice 创建项目
    function createProject(
        string calldata name,
        string calldata metadataURI,
        uint96 stakeAmount
    ) external returns (uint256);
    
    /// @notice 加入项目
    function joinProject(uint256 projectId) external payable;
    
    /// @notice 结算项目
    function finalizeProject(uint256 projectId) external;
    
    /// @notice 获取项目信息
    function getProject(uint256 projectId) 
        external 
        view 
        returns (DataTypes.Project memory);
    
    /// @notice 获取成员信息
    function getMember(uint256 projectId, address member) 
        external 
        view 
        returns (DataTypes.Member memory);
}
