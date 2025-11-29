// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChainGrowth is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _taskIds;
    Counters.Counter private _summaryIds;
    Counters.Counter private _badgeTokenIds;
    
    // Task category enum
    enum TaskCategory {
        LEARNING,
        WORK,
        HEALTH,
        LIFE
    }
    
    // Task structure
    struct Task {
        uint256 id;
        address owner;
        string title;
        TaskCategory category;
        uint256 timestamp;
        bool completed;
    }
    
    // Weekly summary structure
    struct WeeklySummary {
        uint256 id;
        address owner;
        uint256 weekStartTimestamp;
        string keyTakeaways;
        string growthConnections;
        string scenarioReview;
        string suggestions;
        string closingComment;
        uint256 createdAt;
    }
    
    // Badge structure
    struct Badge {
        uint256 id;
        string name;
        string description;
        string imageUrl;
        bool isKnowledge;
    }
    
    // User statistics
    struct UserStats {
        uint256 totalTasks;
        uint256 completedTasks;
        uint256 streakDays;
        mapping(TaskCategory => uint256) categoryCounts;
        uint256 summaryCount;
        uint256 lastActiveDay;
    }
    
    // Storage mappings
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => WeeklySummary) public summaries;
    mapping(uint256 => Badge) public badges;
    mapping(address => UserStats) private userStats;
    mapping(address => mapping(uint256 => bool)) public userBadges;
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed owner, TaskCategory category);
    event TaskCompleted(uint256 indexed taskId, address indexed owner);
    event SummarySaved(uint256 indexed summaryId, address indexed owner);
    event BadgeUnlocked(address indexed user, uint256 badgeId, uint256 tokenId);
    
    constructor() ERC721("ChainGrowth Badges", "CGB") {
        // Initialize badges
        _initializeBadges();
    }
    
    // Initialize default badges
    function _initializeBadges() private {
        // Knowledge Badges
        badges[1] = Badge(1, "求知星芒章", "完成 5 个学习类待办，点亮求知之路。", "https://picsum.photos/id/1010/200/200", true);
        badges[2] = Badge(2, "深耕笃行章", "完成 20 个工作/学习任务，展现深度执行力。", "https://picsum.photos/id/1015/200/200", true);
        badges[3] = Badge(3, "全能探索者", "在所有分类中至少完成 1 个任务。", "https://picsum.photos/id/1016/200/200", true);
        badges[4] = Badge(4, "智识灯塔", "累计生成 4 次 AI 周总结。", "https://picsum.photos/id/1018/200/200", true);
        
        // Mindset Badges
        badges[5] = Badge(5, "自律坚守章", "连续 3 天完成所有待办事项。", "https://picsum.photos/id/1025/200/200", false);
        badges[6] = Badge(6, "抗压小勇士", "单日完成超过 8 个任务。", "https://picsum.photos/id/1024/200/200", false);
        badges[7] = Badge(7, "平衡大师", "单周内健康与工作任务比例均衡。", "https://picsum.photos/id/1022/200/200", false);
        badges[8] = Badge(8, "初心理念", "获得第一次 AI 对心态的正面评价。", "https://picsum.photos/id/1021/200/200", false);
    }
    
    // Create a new task
    function createTask(string memory _title, TaskCategory _category) public returns (uint256) {
        _taskIds.increment();
        uint256 newTaskId = _taskIds.current();
        
        tasks[newTaskId] = Task({
            id: newTaskId,
            owner: msg.sender,
            title: _title,
            category: _category,
            timestamp: block.timestamp,
            completed: false
        });
        
        UserStats storage stats = userStats[msg.sender];
        stats.totalTasks++;
        
        // Update user's last active day
        _updateStreak(msg.sender);
        
        emit TaskCreated(newTaskId, msg.sender, _category);
        return newTaskId;
    }
    
    // Complete a task
    function completeTask(uint256 _taskId) public {
        Task storage task = tasks[_taskId];
        require(task.owner == msg.sender, "Not the task owner");
        require(!task.completed, "Task already completed");
        
        task.completed = true;
        
        UserStats storage stats = userStats[msg.sender];
        stats.completedTasks++;
        stats.categoryCounts[task.category]++;
        
        // Update user's last active day and check streak
        _updateStreak(msg.sender);
        
        // Check for badges to unlock
        _checkBadges(msg.sender);
        
        emit TaskCompleted(_taskId, msg.sender);
    }
    
    // Save weekly summary
    function saveSummary(
        uint256 _weekStartTimestamp,
        string memory _keyTakeaways,
        string memory _growthConnections,
        string memory _scenarioReview,
        string memory _suggestions,
        string memory _closingComment
    ) public returns (uint256) {
        _summaryIds.increment();
        uint256 newSummaryId = _summaryIds.current();
        
        summaries[newSummaryId] = WeeklySummary({
            id: newSummaryId,
            owner: msg.sender,
            weekStartTimestamp: _weekStartTimestamp,
            keyTakeaways: _keyTakeaways,
            growthConnections: _growthConnections,
            scenarioReview: _scenarioReview,
            suggestions: _suggestions,
            closingComment: _closingComment,
            createdAt: block.timestamp
        });
        
        UserStats storage stats = userStats[msg.sender];
        stats.summaryCount++;
        
        // Check for badges to unlock
        _checkBadges(msg.sender);
        
        emit SummarySaved(newSummaryId, msg.sender);
        return newSummaryId;
    }
    
    // Get user's tasks
    function getUserTasks(address _user) public view returns (Task[] memory) {
        uint256 totalTasks = userStats[_user].totalTasks;
        Task[] memory result = new Task[](totalTasks);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _taskIds.current(); i++) {
            if (tasks[i].owner == _user) {
                result[count] = tasks[i];
                count++;
            }
        }
        
        return result;
    }
    
    // Get user's summaries
    function getUserSummaries(address _user) public view returns (WeeklySummary[] memory) {
        uint256 totalSummaries = userStats[_user].summaryCount;
        WeeklySummary[] memory result = new WeeklySummary[](totalSummaries);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _summaryIds.current(); i++) {
            if (summaries[i].owner == _user) {
                result[count] = summaries[i];
                count++;
            }
        }
        
        return result;
    }
    
    // Update user's streak
    function _updateStreak(address _user) private {
        UserStats storage stats = userStats[_user];
        uint256 currentDay = block.timestamp / 86400; // Convert timestamp to day
        
        if (stats.lastActiveDay == 0) {
            // First activity
            stats.streakDays = 1;
        } else if (currentDay == stats.lastActiveDay + 1) {
            // Consecutive day
            stats.streakDays++;
        } else if (currentDay > stats.lastActiveDay + 1) {
            // Streak broken
            stats.streakDays = 1;
        }
        
        stats.lastActiveDay = currentDay;
    }
    
    // Check and unlock badges
    function _checkBadges(address _user) private {
        UserStats storage stats = userStats[_user];
        
        // K1: Seeker - 5 learning tasks completed
        if (stats.categoryCounts[TaskCategory.LEARNING] >= 5 && !userBadges[_user][1]) {
            _mintBadge(_user, 1);
        }
        
        // K2: Deep Diver - 20 work/learning tasks
        uint256 workLearningTasks = stats.categoryCounts[TaskCategory.WORK] + 
                                  stats.categoryCounts[TaskCategory.LEARNING];
        if (workLearningTasks >= 20 && !userBadges[_user][2]) {
            _mintBadge(_user, 2);
        }
        
        // K3: Explorer - at least 1 task in each category
        if (stats.categoryCounts[TaskCategory.LEARNING] >= 1 &&
            stats.categoryCounts[TaskCategory.WORK] >= 1 &&
            stats.categoryCounts[TaskCategory.HEALTH] >= 1 &&
            stats.categoryCounts[TaskCategory.LIFE] >= 1 &&
            !userBadges[_user][3]) {
            _mintBadge(_user, 3);
        }
        
        // K4: Lighthouse - 4 summaries
        if (stats.summaryCount >= 4 && !userBadges[_user][4]) {
            _mintBadge(_user, 4);
        }
        
        // M1: Self-discipline - 3 day streak
        if (stats.streakDays >= 3 && !userBadges[_user][5]) {
            _mintBadge(_user, 5);
        }
        
        // M2: Pressure Handler - 8 tasks in a day (simplified check)
        // This is a simplified version, would need more precise tracking in production
        if (stats.completedTasks >= 8 && !userBadges[_user][6]) {
            _mintBadge(_user, 6);
        }
        
        // M3: Balance Master - Balanced health and work tasks
        if (stats.categoryCounts[TaskCategory.HEALTH] >= 5 &&
            stats.categoryCounts[TaskCategory.WORK] >= 5 &&
            !userBadges[_user][7]) {
            _mintBadge(_user, 7);
        }
        
        // M4: Initial Mindset - First positive AI review
        // This would be triggered by an oracle or specific call in production
    }
    
    // Mint badge as NFT
    function _mintBadge(address _user, uint256 _badgeId) private {
        _badgeTokenIds.increment();
        uint256 tokenId = _badgeTokenIds.current();
        
        _safeMint(_user, tokenId);
        userBadges[_user][_badgeId] = true;
        
        emit BadgeUnlocked(_user, _badgeId, tokenId);
    }
    
    // Get user's badge count
    function getUserBadgeCount(address _user) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= 8; i++) {
            if (userBadges[_user][i]) {
                count++;
            }
        }
        return count;
    }
    
    // Get user statistics
    function getUserStats(address _user) public view returns (
        uint256 totalTasks,
        uint256 completedTasks,
        uint256 streakDays,
        uint256 learningTasks,
        uint256 workTasks,
        uint256 healthTasks,
        uint256 lifeTasks,
        uint256 summaryCount
    ) {
        UserStats storage stats = userStats[_user];
        return (
            stats.totalTasks,
            stats.completedTasks,
            stats.streakDays,
            stats.categoryCounts[TaskCategory.LEARNING],
            stats.categoryCounts[TaskCategory.WORK],
            stats.categoryCounts[TaskCategory.HEALTH],
            stats.categoryCounts[TaskCategory.LIFE],
            stats.summaryCount
        );
    }
    
    // Set badge image URL (only owner)
    function setBadgeImageUrl(uint256 _badgeId, string memory _imageUrl) public onlyOwner {
        badges[_badgeId].imageUrl = _imageUrl;
    }
    
    // Override tokenURI for NFT metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        // In production, this would return a proper IPFS URL with JSON metadata
        // For this implementation, we're returning a simplified response
        return badges[tokenId].imageUrl;
    }
}