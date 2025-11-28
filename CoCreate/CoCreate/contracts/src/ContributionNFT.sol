// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IContributionNFT} from "./interfaces/IContributionNFT.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

/**
 * @title ContributionNFT
 * @notice 贡献证明 NFT 合约 - 为完成任务的贡献者铸造 SBT（Soulbound Token）
 * @dev 继承 ERC721 标准，支持 Soulbound 模式（不可转让）
 * 
 * 核心功能：
 * 1. 为完成任务的贡献者铸造 NFT
 * 2. 存储任务证明和项目信息
 * 3. 支持 Soulbound Token 模式（可选）
 * 
 * 安全特性：
 * - AccessControl: 基于角色的权限控制
 * - Pausable: 紧急暂停功能
 * - Soulbound: 可选的不可转让模式
 */
contract ContributionNFT is 
    IContributionNFT, 
    ERC721URIStorage, 
    AccessControl, 
    Pausable 
{
    // ============ State Variables ============

    /// @notice Minter 角色（只有 TaskManager 可以铸造）
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Admin 角色（管理员）
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Token ID 计数器
    uint256 private _tokenIdCounter;

    /// @notice 是否为 Soulbound Token（不可转让）
    bool public immutable IS_SOULBOUND;

    /// @notice Token 元数据存储
    mapping(uint256 => DataTypes.TokenMetadata) private _tokenMetadata;

    /// @notice 任务 ID 到 Token ID 的映射（一个任务只能铸造一个 NFT）
    mapping(uint256 => uint256) private _taskToToken;

    /// @notice 基础 URI（用于生成完整的 token URI）
    string private _baseTokenURI;

    // ============ Constructor ============

    /**
     * @notice 构造函数
     * @param name NFT 名称
     * @param symbol NFT 符号
     * @param soulbound 是否为不可转让的 SBT
     * @param admin 管理员地址
     * @param minter Minter 地址（通常是 TaskManager）
     */
    constructor(
        string memory name,
        string memory symbol,
        bool soulbound,
        address admin,
        address minter
    ) ERC721(name, symbol) {
        IS_SOULBOUND = soulbound;
        
        // 设置角色
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);

        // 初始化 token ID（从 1 开始）
        _tokenIdCounter = 1;
    }

    // ============ External Functions ============

    /**
     * @notice 铸造贡献 NFT
     * @param to 接收者地址
     * @param projectId 项目 ID
     * @param taskId 任务 ID
     * @param proofCID 证明文件 IPFS CID
     * @return tokenId 铸造的 Token ID
     * @dev 只有具有 MINTER_ROLE 的地址可以调用（通常是 TaskManager）
     */
    function mint(
        address to,
        uint256 projectId,
        uint256 taskId,
        string calldata proofCID
    ) external override onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        // 检查参数
        if (to == address(0)) revert Errors.InvalidMetadata();
        if (bytes(proofCID).length == 0) revert Errors.InvalidProofCID();
        
        // 检查该任务是否已经铸造过 NFT
        if (_taskToToken[taskId] != 0) revert Errors.InvalidMetadata();

        // 获取当前 token ID 并递增
        uint256 tokenId = _tokenIdCounter;
        unchecked {
            _tokenIdCounter++;
        }

        // 铸造 NFT
        _safeMint(to, tokenId);

        // 存储元数据
        _tokenMetadata[tokenId] = DataTypes.TokenMetadata({
            projectId: projectId,
            taskId: taskId,
            contributor: to,
            proofCID: proofCID,
            mintedAt: uint32(block.timestamp)
        });

        // 记录任务到 token 的映射
        _taskToToken[taskId] = tokenId;

        // 设置 token URI（可选）
        // 格式：ipfs://<proofCID>
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", proofCID)));

        emit Events.ContributionNFTMinted(
            tokenId,
            projectId,
            taskId,
            to,
            proofCID,
            uint32(block.timestamp)
        );

        return tokenId;
    }

    /**
     * @notice 批量铸造（Gas 优化）
     * @param recipients 接收者地址数组
     * @param projectIds 项目 ID 数组
     * @param taskIds 任务 ID 数组
     * @param proofCIDs 证明 CID 数组
     * @return tokenIds 铸造的 Token ID 数组
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata projectIds,
        uint256[] calldata taskIds,
        string[] calldata proofCIDs
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256[] memory) {
        uint256 length = recipients.length;
        if (
            length != projectIds.length ||
            length != taskIds.length ||
            length != proofCIDs.length
        ) {
            revert Errors.InvalidMetadata();
        }

        uint256[] memory tokenIds = new uint256[](length);

        for (uint256 i = 0; i < length; ) {
            tokenIds[i] = this.mint(
                recipients[i],
                projectIds[i],
                taskIds[i],
                proofCIDs[i]
            );
            unchecked {
                ++i;
            }
        }

        return tokenIds;
    }

    // ============ View Functions ============

    /**
     * @notice 获取 Token 元数据
     * @param tokenId Token ID
     * @return 元数据结构
     */
    function getTokenMetadata(uint256 tokenId) 
        external 
        view 
        override 
        returns (DataTypes.TokenMetadata memory) 
    {
        if (!_exists(tokenId)) revert Errors.TokenNotExists();
        return _tokenMetadata[tokenId];
    }

    /**
     * @notice 根据任务 ID 查询 Token ID
     * @param taskId 任务 ID
     * @return tokenId Token ID（0 表示未铸造）
     */
    function getTokenByTask(uint256 taskId) external view returns (uint256) {
        return _taskToToken[taskId];
    }

    /**
     * @notice 检查是否为 Soulbound Token
     * @return 是否为 SBT
     */
    function isSoulbound() external view override returns (bool) {
        return IS_SOULBOUND;
    }

    /**
     * @notice 获取下一个 Token ID
     * @return 下一个将被铸造的 Token ID
     */
    function nextTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice 获取基础 URI
     * @return 基础 URI
     */
    function baseTokenURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice 检查 token 是否存在
     * @param tokenId Token ID
     * @return 是否存在
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    // ============ Internal Functions ============

    /**
     * @notice 覆写 _baseURI 函数
     * @return 基础 URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice 检查 token 是否存在（内部函数）
     * @param tokenId Token ID
     * @return 是否存在
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @notice 转账前钩子 - 实现 Soulbound 逻辑
     * @dev 如果是 Soulbound Token，只允许铸造和销毁，不允许转账
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // 如果是 Soulbound Token，禁止转账（铸造和销毁除外）
        if (IS_SOULBOUND && from != address(0) && to != address(0)) {
            revert Errors.SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }

    // ============ Admin Functions ============

    /**
     * @notice 设置基础 URI
     * @param baseURI 新的基础 URI
     */
    function setBaseURI(string calldata baseURI) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice 暂停合约
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice 恢复合约
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice 销毁 NFT（仅限管理员，用于错误铸造的情况）
     * @param tokenId Token ID
     */
    function burn(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        if (!_exists(tokenId)) revert Errors.TokenNotExists();
        
        // 清除任务映射
        uint256 taskId = _tokenMetadata[tokenId].taskId;
        delete _taskToToken[taskId];
        
        // 清除元数据
        delete _tokenMetadata[tokenId];
        
        // 销毁 NFT
        _burn(tokenId);
    }

    // ============ Overrides ============

    /**
     * @notice 支持的接口
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
