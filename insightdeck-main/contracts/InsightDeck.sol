// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract InsightDeck is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // 自增的 tokenId（0,1,2,...）
    uint256 public nextTokenId = 0;

    // metadata 基础地址（指向你在 Pinata 上传的 metadata 目录）
    string public baseMetadataURI;
    string public baseImageURI;

    // tokenId -> insightId（0 ~ 99）
    mapping(uint256 => uint256) public tokenInsightId;

    // --------------------
    // OZ v5 构造函数写法
    // --------------------
    constructor()
        ERC721("InsightDeck", "INSIGHT")
        Ownable(msg.sender)   // 部署者为 owner
    {}

    // --------------------
    // 设置 metadata 基础 URI（只允许 owner 调用）
    // 例如：
    // "https://green-elaborate-hyena-15.mypinata.cloud/ipfs/bafybeiesliwha3mvbngrideq7g3s45iyb3xjx4noyrrusrfvtqomuo5xhq/"
    // --------------------
    function setBaseMetadataURI(string memory uri) external onlyOwner {
        baseMetadataURI = uri;
    }

    function setBaseImageURI(string memory uri) external onlyOwner {
        baseImageURI = uri;
    }

    // --------------------
    // 演示用：不限次数 mint
    // 每次 mint：
    //  - tokenId = nextTokenId 递增
    //  - insightId = 随机 0~99
    // --------------------
    function mint() external {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        uint256 insightId = uint256(
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    block.timestamp,
                    tokenId
                )
            )
        ) % 100;

        _safeMint(msg.sender, tokenId);
        tokenInsightId[tokenId] = insightId;
    }

    // --------------------
    // 返回 metadata JSON 地址（而不是直接 PNG）
    // Rabby / NFTScan 会调用 tokenURI()，再读取 JSON 里的 image 字段显示图片
    // --------------------
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        // OZ v5: 用 _ownerOf 替代 _exists
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");

        uint256 insightId = tokenInsightId[tokenId];

        // 例如返回：
        // baseMetadataURI = "https://.../bafy...xhq/"
        // insightId = 3
        // tokenURI = "https://.../bafy...xhq/3.json"
        // return string(
        //     abi.encodePacked(
        //         baseMetadataURI,
        //         insightId.toString(),
        //         ".json"
        //     )
        // );
        return string(
            abi.encodePacked(
                baseImageURI,
                insightId.toString(),
                ".png"
            )
        );
    }
}
