// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ECommerceService is Ownable {
    using SafeERC20 for IERC20;

    struct Product {
        string name;
        uint256 price;
        bool exists;
    }

    struct Customer {
        string shippingAddress;
        bool hasDelivered;
        bool rewarded;
    }

    IERC20 public rewardToken;
    uint256 public rewardRate; // 0.5% = 5 (since rate is per 1000)

    mapping(uint256 => Product) public products;
    mapping(address => Customer) public customers;
    mapping(string => string) public autoReplies;
    uint256 public productCount;

    event ProductAdded(uint256 id, string name, uint256 price);
    event ReviewSubmitted(address customer, uint256 productId, string reviewCID);
    event RewardsFunded(address sender, uint256 amount);

    constructor(address _rewardToken, uint256 _rewardRate) Ownable(msg.sender) {
        require(_rewardToken != address(0), "Invalid token");
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
    }

    function addProduct(string memory _name, uint256 _price) external onlyOwner {
        productCount++;
        products[productCount] = Product(_name, _price, true);
        emit ProductAdded(productCount, _name, _price);
    }

    function setAutoReply(string memory keyword, string memory reply) external onlyOwner {
        require(bytes(keyword).length > 0, "Keyword empty");
        autoReplies[keyword] = reply;
    }

    function queryProduct(string memory keyword) external view returns (string memory, bool) {
        string memory reply = autoReplies[keyword];
        if (bytes(reply).length == 0) return ("", false);
        return (reply, true);
    }

    function confirmDelivery(string memory _shippingAddress, uint256 _productId) external {
        require(products[_productId].exists, "Product does not exist");
        customers[msg.sender] = Customer(_shippingAddress, true, false);
    }

    function submitReview(
        uint256 productId,
        string memory reviewCID,
        string[] memory imageCIDs
    ) external {
        require(bytes(reviewCID).length >= 100, "Invalid review CID");
        require(imageCIDs.length >= 5, "At least 5 images required");
        require(customers[msg.sender].hasDelivered, "Delivery not confirmed");

        Customer storage customer = customers[msg.sender];
        require(!customer.rewarded, "Already rewarded");

        uint256 productPrice = products[productId].price;
        require(productPrice > 0, "Product does not exist");
        uint256 rewardAmount = (productPrice * rewardRate) / 1000;

        rewardToken.safeTransfer(msg.sender, rewardAmount);
        customer.rewarded = true;

        emit ReviewSubmitted(msg.sender, productId, reviewCID);
    }

    function fundRewards(uint256 amount) external onlyOwner {
        require(msg.sender != address(0), "Invalid sender");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(msg.sender, amount);
    }
}