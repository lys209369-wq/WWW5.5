// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CoTime is ERC721, ReentrancyGuard {
    uint256 private _tokenIdCounter = 1;

    enum NftType {
        None,                  // 0: 未铸造
        ProjectCreator,        // 1: 项目启航者（首次创建项目）
        FirstCheckIn,          // 2: 初次打卡达人（首次打卡）
        Streak3Days,           // 3: 三日连签先锋（连续3天打卡）
        WeekFullAttendance,    // 4: 一周全勤标兵（单周7天打卡）
        MilestoneBreaker,      // 5: 里程碑突破者（打卡总天数超过30）
        Streak15Days,          // 6: 半月坚守者（连续15天打卡）
        ProjectFinisher,       // 7: 项目收官者（参与项目圆满结束）
        Streak30Days          // 8: 满月收官（连续30天打卡）
    }

    // 项目信息结构体
    struct CoProject {
        string name;       // 项目名称
        string theme;      // 打卡主题
        address initiator; // 发起人
        uint16 allStreakDays;  // 总打卡天数
        uint8 maxMembers;       // 成员上限
        uint8 memberCount;          // 当前成员数量
        mapping(address => bool) isMember;
    }

    mapping(address => uint256[]) private userCreatedProjects;

    // 打卡记录：用户地址 → 项目ID → 打卡日期（时间戳）→ 是否已打卡
    mapping(address => mapping(uint256 => mapping(uint256 => bool))) public userCheckInRecord;
    // 用户连续打卡天数：地址 → 项目ID → 连续天数
    mapping(address => mapping(uint256 => uint256)) public checkInStreak;
    // 用户NFT等级：地址 → 项目ID → 等级（0=无，1=元气，2=闪耀，3=限定）
    mapping(address => mapping(uint256 => uint256)) public userNftLevel;
    
    mapping(address => mapping(uint256 => bool)) public globalUserCheckInRecord;  
    mapping(address => uint256) public userGlobalTotalCheckInDays;               
    
    mapping(uint256 => CoProject) public projects; // 项目ID→信息
    uint256 public projectCounter; // 项目计数器

    mapping(uint256 => bool) public isProjectFinished; // 项目ID → 是否已结束
    mapping(uint256 => uint256) public projectStartTime; // 项目ID → 创建时间戳

    // 用户已铸造的 NFT 类型（防止重复铸造）
    mapping(address => mapping(NftType => bool)) public userMintedNfts;

    mapping(uint256 => NftType) public tokenIdToNftType; // tokenId → NFT 类型

    string[] public nftUris = [
        "", // 0: None（占位）
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/ProjectCreator.json",      // 1: ProjectCreator
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/FirstCheckIn.json",        // 2: FirstCheckIn
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/Streak3Days.json",         // 3: Streak3Days
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/WeekFullAttendance.json",   // 4: WeekFullAttendance
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/MilestoneBreaker.json",    // 5: MilestoneBreaker
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/Streak15Days.json",        // 6: Streak15Days
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/ProjectFinisher.json",     // 7: ProjectFinisher
        "ipfs://bafybeidlpmlzywos34n3l4kczbhdkwrgktl6kjgn5ruicwnin7hfki2j7m/Streak30Days.json"        // 8: Streak30Days
    ];

    // 项目创建事件
    event ProjectCreated(uint256 indexed projectId,address indexed initiator,string name,string theme,uint16 allStreakDays,uint8 maxMembers);
    // 加入项目事件
    event ProjectJoined(uint256 indexed projectId,address indexed member);
    // 打卡成功事件
    event CheckInSuccess(uint256 indexed projectId,address indexed user,string proofHash,uint256 streakDays);
    // NFT铸造事件
    event NftMinted(address indexed user,uint256 indexed tokenId,uint256 level);
    // 项目结束事件
    event ProjectFinished(uint256 indexed projectId,uint256 finishTime);

    constructor() ERC721("CoTime", "CT") {
        projectCounter = 1;
    }

    // 发布项目
    function publishProject(
        string memory  _name, 
        string memory  _theme, 
        uint16 _allStreakDays,
        uint8 _maxMembers
    ) external {
        require(_maxMembers >= 1, "Min 1 member"); // 至少1人（发起人自己）
        require(_maxMembers <= 255, "Max 255 members"); 
         // 逐字段赋值，避免直接赋值整个结构体
        CoProject storage newProject = projects[projectCounter];
        newProject.name = _name;
        newProject.theme = _theme;
        newProject.initiator = msg.sender;
        newProject.allStreakDays = _allStreakDays;
        newProject.maxMembers = _maxMembers;
        newProject.memberCount = 1;  // 发起人自动加入

        // 标记发起人为成员（mapping 不能在构造中初始化，需单独赋值）
        newProject.isMember[msg.sender] = true;

        emit ProjectCreated(projectCounter, msg.sender, _name, _theme, _allStreakDays, _maxMembers);
        userCreatedProjects[msg.sender].push(projectCounter);
        projectStartTime[projectCounter] = block.timestamp; // 记录创建时间
        projectCounter++;
        if (!userMintedNfts[msg.sender][NftType.ProjectCreator]) {
            mintNft(msg.sender, NftType.ProjectCreator);
        }
    }

    // 加入项目
    function joinProject(uint256 _projectId) external {
        require(_projectId < projectCounter, "Project not exist");
        CoProject storage project = projects[_projectId];
        require(project.memberCount < project.maxMembers, "Team is full");
        require(project.isMember[msg.sender] != true,"Already in");
        
    
        project.isMember[msg.sender] = true;
        project.memberCount++;

        emit ProjectJoined(_projectId, msg.sender);
    }

    // 打卡（带签名验证）
    function checkIn(
        uint256 _projectId,
        string calldata _proofHash, // 打卡凭证IPFS哈希
        uint256 _timestamp,         // 打卡时间戳（前端生成）
        bytes calldata _signature    // 钱包签名
    ) external nonReentrant {
        require(!isProjectFinished[_projectId], "Project already finished");
        // 1. 验证项目存在且用户是成员
        require(_projectId < projectCounter, "Project not exist");
        
        require(projects[_projectId].isMember[msg.sender] == true, "Not project member");

        // 2. 验证签名（防止伪造打卡）
        bytes32 messageHash = getMessageHash(_projectId, _proofHash, _timestamp, msg.sender);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        require(recoverSigner(ethSignedMessageHash, _signature) == msg.sender, "Invalid signature");

        // 3. 验证时间戳（防止跨天/过期打卡，±1小时容错）
        require(block.timestamp - _timestamp < 3600, "Timestamp expired");

        // 4. 验证今日未打卡（按日期戳判断，取当天0点时间戳）
        uint256 today = block.timestamp - (block.timestamp % 86400);
        if(!globalUserCheckInRecord[msg.sender][today]){
            globalUserCheckInRecord[msg.sender][today] = true;
            userGlobalTotalCheckInDays[msg.sender]++;
            if (userGlobalTotalCheckInDays[msg.sender] == 1 && !userMintedNfts[msg.sender][NftType.FirstCheckIn]) {
                mintNft(msg.sender, NftType.FirstCheckIn);
            }
            if (userGlobalTotalCheckInDays[msg.sender] >= 30 && !userMintedNfts[msg.sender][NftType.MilestoneBreaker]) {
                mintNft(msg.sender, NftType.MilestoneBreaker);
            }
        }
        require(!userCheckInRecord[msg.sender][_projectId][today], "Already checked in today");

        // 5. 更新打卡记录和连续天数
        userCheckInRecord[msg.sender][_projectId][today] = true;
        // 检查昨天是否打卡（判断连续）
        uint256 yesterday = today - 86400;
        if (userCheckInRecord[msg.sender][_projectId][yesterday]) {
            checkInStreak[msg.sender][_projectId]++;
        } else {
            checkInStreak[msg.sender][_projectId] = 1; // 断签重置
        }

        uint256 currentStreak = checkInStreak[msg.sender][_projectId];
        // 更新打卡记录后触发事件
        emit CheckInSuccess(_projectId, msg.sender, _proofHash, currentStreak);

        // 6. 发放NFT
        issueNftByStreak(msg.sender, _projectId);
    }

    // 生成消息哈希（用于签名）
    function getMessageHash(
        uint256 _projectId,
        string calldata _proofHash,
        uint256 _timestamp,
        address _user
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_projectId, _proofHash, _timestamp, _user));
    }

    // 生成以太坊签名消息哈希（EIP-191标准）
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    // 恢复签名者地址
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    // 拆分签名（r/s/v）
    function splitSignature(bytes memory _signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_signature.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
    }

    function finishProject(uint256 _projectId) external {
        CoProject storage project = projects[_projectId];
        require(project.initiator == msg.sender, "Not initiator");
        require(!isProjectFinished[_projectId], "Already finished");
        require(
            block.timestamp >= projectStartTime[_projectId] + project.allStreakDays * 86400,
            "Project duration not reached"
        );

        isProjectFinished[_projectId] = true;
        emit ProjectFinished(_projectId, block.timestamp);

        if (!userMintedNfts[msg.sender][NftType.ProjectFinisher]) {
            uint256 tokenId = _tokenIdCounter++;
            _safeMint(msg.sender, tokenId);
            userMintedNfts[msg.sender][NftType.ProjectFinisher] = true;
            emit NftMinted( msg.sender, tokenId, 8); // 8 = ProjectFinisher
        }
    }

    function issueNftByStreak(address _user, uint256 _projectId) internal {
        uint256 streak = checkInStreak[_user][_projectId];
        if (streak >= 3 && !userMintedNfts[_user][NftType.Streak3Days]) {
            mintNft(_user, NftType.Streak3Days);
        }
        if (streak >= 7 && !userMintedNfts[_user][NftType.WeekFullAttendance]) {
            mintNft(_user, NftType.WeekFullAttendance);
        }
        if (streak >= 15 && !userMintedNfts[_user][NftType.Streak15Days]) {
            mintNft(_user, NftType.Streak15Days);
        }
        if (streak >= 30 && !userMintedNfts[_user][NftType.Streak30Days]) {
            mintNft(_user, NftType.Streak30Days);
        }
    }


    // 铸造NFT
    function mintNft(address _to, uint256 _projectId, uint256 _level) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(_to, tokenId);
        userNftLevel[_to][_projectId] = _level;

        emit NftMinted(_to, tokenId, _level);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        NftType nftType = tokenIdToNftType[_tokenId];
        return nftUris[uint256(nftType)];
    }

    function mintNft(address _to, NftType _nftType) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(_to, tokenId);
        tokenIdToNftType[tokenId] = _nftType; // 记录 tokenId 对应的 NFT 类型
        userMintedNfts[_to][_nftType] = true; // 标记为已铸造
        emit NftMinted(_to, tokenId, uint256(_nftType));
    }

    function getProject(uint256 _projectId) external view returns (
        string memory name,
        string memory theme,
        address initiator,
        uint16 allStreakDays,
        uint8 maxMembers,
        uint8 memberCount
    ) {
        CoProject storage project = projects[_projectId];
        return (
            project.name,
            project.theme,
            project.initiator,
            project.allStreakDays,
            project.maxMembers,
            project.memberCount
        );
    }

    // 分页获取用户创建的项目 ID 列表
    function getMyProjects(uint256 _startIndex, uint256 _limit) external view returns (uint256[] memory) {
        require(_limit <= 50, "Max 50 projects per query");  // 防止 Gas 超限
        uint256[] memory projectIds = userCreatedProjects[msg.sender];
        uint256 endIndex = _startIndex + _limit;
        if (endIndex > projectIds.length) endIndex = projectIds.length;

        uint256[] memory result = new uint256[](endIndex - _startIndex);
        for (uint256 i = _startIndex; i < endIndex; i++) {
            result[i - _startIndex] = projectIds[i];
        }
        return result;
    }

    function isMemberOfProject(uint256 _projectId, address _user) public view returns (bool) {
        return projects[_projectId].isMember[_user];
    }

    function getTotalCheckInDays() external view returns (uint256) {
        return userGlobalTotalCheckInDays[msg.sender];
    }

    function getUserStreak(address _user, uint256 _projectId) external view returns (uint256) {
        return checkInStreak[_user][_projectId];
    }

}