// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title Errors
 * @notice 定义所有自定义错误（Gas 优化）
 * @dev 使用 custom errors 比 require 字符串节省 gas
 */
library Errors {
    // ============ ProjectFactory Errors ============
    error InvalidStakeAmount();
    error InvalidProjectName();
    error ProjectNotFound();
    error ProjectNotActive();
    error ProjectAlreadyFinalized();
    error OnlyProjectOwner();
    error AlreadyMember();
    error NotMember();
    error IncorrectStakeAmount();
    error MemberLimitReached();

    // ============ StakeVault Errors ============
    error OnlyFactory();
    error InsufficientBalance();
    error TransferFailed();
    error NoFundsToWithdraw();
    error StakeNotFound();

    // ============ TaskManager Errors ============
    error TaskNotFound();
    error InvalidTaskStatus();
    error OnlyAssignee();
    error InvalidProofCID();
    error TaskAlreadyReviewed();
    error EmptyTitle();
    
    // ============ ContributionNFT Errors ============
    error OnlyMinter();
    error TokenNotExists();
    error SoulboundToken();
    error InvalidMetadata();
}
