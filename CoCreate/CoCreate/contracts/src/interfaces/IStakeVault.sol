// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IStakeVault
 * @notice 质押金库接口
 */
interface IStakeVault {
    /// @notice 存入质押
    function depositStake(uint256 projectId, address member) external payable;
    
    /// @notice 释放质押
    function releaseStake(uint256 projectId, address member) external;
    
    /// @notice 罚没质押
    function slashStake(uint256 projectId, address member, address recipient) external;
    
    /// @notice 查询质押金额
    function getStakedAmount(uint256 projectId, address member) external view returns (uint256);
    
    /// @notice 提取可用资金
    function withdrawFunds() external;
}
