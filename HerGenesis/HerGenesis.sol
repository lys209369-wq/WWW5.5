// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract HerGenesis is ERC721, Ownable {
    using Strings for uint256;

    // --- 1. 配置与常量 (已修改费用与冷却) ---
    uint256 public constant INITIAL_SPECIES_COUNT = 4;
    
    // 修改后的费用
    uint256 public serviceFee = 0.0001 ether; 
    uint256 public spacePrice = 0.001 ether;
    
    // 修改后的独立冷却时间
    uint256 public constant COOLDOWN_FEED = 30 minutes; // 喂食 30分钟
    uint256 public constant COOLDOWN_PET = 10 minutes;  // 摸摸 10分钟
    uint256 public constant COOLDOWN_CLEAN = 1 days;    // 清洁 24小时

    uint8 public constant INTERACTION_ADD = 10; // 每次互动增加10点

    // --- 2. 数据结构 (Gas 极限优化版) ---
    // 阶段定义：幼年, 成年, 繁育, 再繁育
    enum LifeStage { Juvenile, Adult, Breeding, ReBreeding }

    struct Animal {
        // 时间戳拆分：独立记录上次操作时间
        uint64 lastFeedTime;    // 上次喂食时间
        uint64 lastPetTime;     // 上次摸摸时间
        uint64 lastCleanTime;   // 上次清洁时间
        
        uint16 speciesId;       // 物种ID
        uint8 stage;            // 当前阶段 (对应 LifeStage 0-3)
        
        // 属性 (0-200) - uint8 最大支持255，足够涵盖需求
        uint8 fullness;         // 饱食度
        uint8 affinity;         // 亲密度
        uint8 health;           // 健康度
        
        // Slot 计算: 
        // 64*3(192 bits) + 16 + 8 + 8*3(24) = 240 bits 
        // 结果：所有数据完美塞入 1 个 256位的 Slot，Gas 消耗极低
    }

    // --- 状态存储 ---
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // TokenID => 动物数据
    mapping(uint256 => Animal) public animals;
    
    // 玩家地址 => 拥有的槽位上限
    mapping(address => uint256) public userSlotLimit;
    
    // 玩家地址 => 是否已领取首个
    mapping(address => bool) public hasClaimedFirst;

    // 物种ID => 当前该物种的繁衍累计数量 (用于展示曲线图)
    mapping(uint16 => uint256) public speciesPopulation;

    // --- 事件 ---
    event AnimalBorn(address indexed owner, uint256 tokenId, uint16 speciesId);
    event SpacePurchased(address indexed owner, uint256 newLimit);
    event InteractionOccurred(uint256 indexed tokenId, string interactionType, uint8 newVal);
    // 阶段变更事件，方便前端做弹窗动画
    event StageUp(uint256 indexed tokenId, uint8 newStage, string stageName);

    constructor(string memory baseURI) ERC721("HerGenesis", "HER") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _nextTokenId = 1; 
    }

    // --- 核心功能 1: 认养/铸造 ---

    // 免费领取首个 (仅需 Gas)
    function claimFirstGenesis() external payable {
        require(!hasClaimedFirst[msg.sender], "Already claimed first.");
        // 首个免费，不需要支付 serviceFee，但需要发交易

        // 简单的伪随机生成物种
        uint16 randomSpeciesId = uint16(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % INITIAL_SPECIES_COUNT) + 1;

        userSlotLimit[msg.sender] = 1;
        hasClaimedFirst[msg.sender] = true;

        _mintNewAnimal(msg.sender, randomSpeciesId);
    }

    // 购买更多槽位 (0.001 ETH)
    function buySpace() external payable {
        require(hasClaimedFirst[msg.sender], "Claim first animal first.");
        require(msg.value >= spacePrice, "Insufficient funds.");

        userSlotLimit[msg.sender] += 1;
        emit SpacePurchased(msg.sender, userSlotLimit[msg.sender]);
    }

    // 认养特定物种 (0.0001 ETH)
    function adoptChosenSpecies(uint16 _speciesId) external payable {
        require(_speciesId > 0 && _speciesId <= INITIAL_SPECIES_COUNT, "Invalid species ID.");
        require(balanceOf(msg.sender) < userSlotLimit[msg.sender], "No space available.");
        require(msg.value >= serviceFee, "Insufficient fee."); 

        _mintNewAnimal(msg.sender, _speciesId);
    }

    // 内部铸造逻辑
    function _mintNewAnimal(address to, uint16 speciesId) internal {
        uint256 tokenId = _nextTokenId++;
        
        // 初始化属性：全部为 0 (满足幼年初始状态要求)
        animals[tokenId] = Animal({
            lastFeedTime: 0,
            lastPetTime: 0,
            lastCleanTime: 0,
            speciesId: speciesId,
            stage: uint8(LifeStage.Juvenile), // 初始为幼年
            fullness: 0,
            affinity: 0,
            health: 0
        });

        // 初始认领，物种数 +1 (繁衍时再 +2)
        speciesPopulation[speciesId]++;
        _safeMint(to, tokenId);
        emit AnimalBorn(to, tokenId, speciesId);
    }

    // --- 核心功能 2: 互动系统 (独立冷却) ---

    modifier onlyOwnerOf(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _;
    }

    // 1. 喂食 (+10 饱食度, 30分钟冷却)
    function feed(uint256 tokenId) external onlyOwnerOf(tokenId) {
        Animal storage pet = animals[tokenId];
        require(block.timestamp >= pet.lastFeedTime + COOLDOWN_FEED, "Feeding cooldown (30m)");

        pet.fullness = _capAt200(pet.fullness + INTERACTION_ADD);
        pet.lastFeedTime = uint64(block.timestamp);
        
        emit InteractionOccurred(tokenId, "FEED", pet.fullness);
        _checkStageUp(tokenId); // 检查是否升级
    }

    // 2. 摸摸 (+10 亲密度, 10分钟冷却)
    function petInteraction(uint256 tokenId) external onlyOwnerOf(tokenId) {
        Animal storage pet = animals[tokenId];
        require(block.timestamp >= pet.lastPetTime + COOLDOWN_PET, "Petting cooldown (10m)");

        pet.affinity = _capAt200(pet.affinity + INTERACTION_ADD);
        pet.lastPetTime = uint64(block.timestamp);
        
        emit InteractionOccurred(tokenId, "PET", pet.affinity);
        _checkStageUp(tokenId);
    }

    // 3. 清洁 (+10 健康度, 24小时冷却)
    function clean(uint256 tokenId) external onlyOwnerOf(tokenId) {
        Animal storage pet = animals[tokenId];
        require(block.timestamp >= pet.lastCleanTime + COOLDOWN_CLEAN, "Cleaning cooldown (24h)");

        pet.health = _capAt200(pet.health + INTERACTION_ADD);
        pet.lastCleanTime = uint64(block.timestamp);

        emit InteractionOccurred(tokenId, "CLEAN", pet.health);
        _checkStageUp(tokenId);
    }

    // --- 核心功能 3: 生长与繁衍系统 ---
    
    function _checkStageUp(uint256 tokenId) internal {
        Animal storage pet = animals[tokenId];
        uint8 f = pet.fullness;
        uint8 a = pet.affinity;
        uint8 h = pet.health;
        uint8 currentStage = pet.stage;

        // 阶段 1: 幼年 -> 成年
        // 条件: 饱食/亲密/健康 >= 30
        if (currentStage == uint8(LifeStage.Juvenile)) {
            if (f >= 30 && a >= 30 && h >= 30) {
                pet.stage = uint8(LifeStage.Adult);
                emit StageUp(tokenId, pet.stage, "Adult");
            }
        }
        // 阶段 2: 成年 -> 繁育
        // 条件: 全属性 >= 100
        // 效果: 物种数 +2
        else if (currentStage == uint8(LifeStage.Adult)) {
            if (f >= 100 && a >= 100 && h >= 100) {
                pet.stage = uint8(LifeStage.Breeding);
                speciesPopulation[pet.speciesId] += 2; // 繁衍系统核心逻辑
                emit StageUp(tokenId, pet.stage, "Breeding");
            }
        }
        // 阶段 3: 繁育 -> 再繁育
        // 条件: 全属性 >= 200
        // 效果: 物种数 +2
        else if (currentStage == uint8(LifeStage.Breeding)) {
            // 注意：因为我们 cap 在 200，所以这里必须是达到满值
            if (f >= 200 && a >= 200 && h >= 200) {
                pet.stage = uint8(LifeStage.ReBreeding);
                speciesPopulation[pet.speciesId] += 2; // 再次繁衍
                emit StageUp(tokenId, pet.stage, "ReBreeding");
            }
        }
    }

    // --- 辅助与视图 ---

    // 限制数值最大为 200
    function _capAt200(uint256 value) internal pure returns (uint8) {
        return value > 200 ? 200 : uint8(value);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return bytes(_baseTokenURI).length > 0 ? string(abi.encodePacked(_baseTokenURI, tokenId.toString())) : "";
    }

    // 前端调用此函数获取该动物的所有状态
    function getAnimalStats(uint256 tokenId) external view returns (Animal memory) {
        require(_ownerOf(tokenId) != address(0), "Not exists");
        return animals[tokenId];
    }
    
    // 获取某物种的总繁衍数量 (用于前端画曲线图)
    function getSpeciesPopulation(uint16 speciesId) external view returns (uint256) {
        return speciesPopulation[speciesId];
    }

    // --- 管理员功能 (提现等) ---

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    // 提现合约里的 ETH
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
