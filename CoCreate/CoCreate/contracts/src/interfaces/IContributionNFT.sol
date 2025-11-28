// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

/**
 * @title IContributionNFT
 * @notice 贡献 NFT 接口
 */
interface IContributionNFT {
    /// @notice 铸造 NFT
    function mint(
        address to,
        uint256 projectId,
        uint256 taskId,
        string calldata proofCID
    ) external returns (uint256);
    
    /// @notice 获取 Token 元数据
    function getTokenMetadata(uint256 tokenId) 
        external 
        view 
        returns (DataTypes.TokenMetadata memory);
    
    /// @notice 检查是否为 Soulbound Token
    function isSoulbound() external view returns (bool);
}
