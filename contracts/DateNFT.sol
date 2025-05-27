// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract DateNFT is ERC721, Ownable, IERC2981, ReentrancyGuard, Pausable {
    using Strings for uint256;

    uint256 public mintPrice = 0.01 ether;
    string private _contractURI;
    
    // Single date range for better gas efficiency
    uint64 public mintStartDate;
    uint64 public mintEndDate;
    bool public mintingEnabled;
    
    // Add minimum year validation
    uint64 public constant MIN_VALID_YEAR = 1;  // Year 0001
    uint64 public constant MAX_VALID_YEAR = 9999;  // Year 9999
    
    struct DateMetadata {
        string name;
        string description;
        uint32 lastUpdated;
    }
    
    // Compact storage layout
    mapping(uint256 => bool) public datesMinted;
    mapping(uint256 => DateMetadata) private dateMetadata;
    mapping(string => bool) private usedNames;
    mapping(address => uint32) public lastMintTime;
    
    // Pack related storage variables together
    struct RoyaltyInfo {
        address recipient;
        uint96 percentage;
    }
    RoyaltyInfo private _royaltyInfo;
    
    // Constants
    uint32 public constant MINT_COOLDOWN = 1 minutes;
    uint96 private constant MAX_ROYALTY = 1000; // 10%
    
    // Circuit breaker
    bool public isEmergencyStopped;
    
    // Events
    event Withdrawn(address indexed to, uint256 amount);
    event MintPriceReceived(address indexed from, uint256 dateId);
    event RefundIssued(address indexed to, uint256 amount);
    event DateRangeUpdated(uint64 startDate, uint64 endDate);
    event MetadataUpdated(uint256 indexed tokenId, string name, string description);
    event RoyaltyInfoUpdated(address recipient, uint96 percentage);
    event MintingStatusUpdated(bool enabled);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor() ERC721("DateOnBase", "DATE") Ownable(msg.sender) {
        _royaltyInfo = RoyaltyInfo(msg.sender, 500); // 5%
        emit RoyaltyInfoUpdated(msg.sender, 500);
        
        // Set initial date range: Jan 1, 1900 to Dec 31, 2025
        mintStartDate = 19000101;
        mintEndDate = 20251231;
        mintingEnabled = true;
        
        // Set the contract URI during deployment
        _contractURI = "https://dateonbase.vercel.app/api/contract-metadata";
        
        emit DateRangeUpdated(mintStartDate, mintEndDate);
    }

    // External functions
    function mint(uint256 dateId) external payable whenNotPaused nonReentrant {
        if (isEmergencyStopped) revert("Emergency stop active");
        if (!mintingEnabled) revert("Minting is disabled");
        if (block.timestamp < lastMintTime[msg.sender] + MINT_COOLDOWN) revert("Wait before minting again");
        if (msg.value < mintPrice) revert("Insufficient payment");
        if (datesMinted[dateId]) revert("Date already minted");
        if (!isDateMintable(dateId)) revert("Date not available");
        
        lastMintTime[msg.sender] = uint32(block.timestamp);
        datesMinted[dateId] = true;
        _safeMint(msg.sender, dateId);
        
        emit MintPriceReceived(msg.sender, dateId);
        
        uint256 excess = msg.value - mintPrice;
        if (excess > 0) {
            _sendRefund(msg.sender, excess);
        }
    }

    function batchMint(uint256[] calldata dateIds) external payable nonReentrant whenNotPaused {
        uint256 totalCost = mintPrice * dateIds.length;
        if (msg.value < totalCost) revert("Insufficient payment");
        
        for(uint256 i = 0; i < dateIds.length;) {
            if (!isDateMintable(dateIds[i])) revert("Date not mintable");
            datesMinted[dateIds[i]] = true;
            _safeMint(msg.sender, dateIds[i]);
            unchecked { ++i; }
        }
        
        if(msg.value > totalCost) {
            _sendRefund(msg.sender, msg.value - totalCost);
        }
    }

    function withdraw() external nonReentrant whenNotPaused onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert("No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert("Withdrawal failed");
        
        emit Withdrawn(owner(), balance);
    }

    // View functions
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view override returns (address, uint256) {
        if (!datesMinted[tokenId]) revert("Token does not exist");
        return (_royaltyInfo.recipient, (salePrice * _royaltyInfo.percentage) / 10000);
    }

    function isDateMintable(uint256 dateId) public view returns (bool) {
        if (datesMinted[dateId]) return false;
        if (!mintingEnabled) return false;
        
        return dateId >= mintStartDate && dateId <= mintEndDate && _isValidDate(uint64(dateId));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    // Admin functions
    function setRoyaltyInfo(address recipient, uint96 percentage) external onlyOwner {
        if (percentage > MAX_ROYALTY) revert("Royalty too high");
        _royaltyInfo = RoyaltyInfo(recipient, percentage);
        emit RoyaltyInfoUpdated(recipient, percentage);
    }

    function setMintDateRange(uint64 newStartDate, uint64 newEndDate) external onlyOwner {
        require(_isValidDate(newStartDate), "Invalid start date");
        require(_isValidDate(newEndDate), "Invalid end date");
        require(newStartDate <= newEndDate, "Start date must be before or equal to end date");
        
        // Check if any dates have been minted outside the new range
        if (newStartDate > mintStartDate || newEndDate < mintEndDate) {
            require(_noMintedDatesOutsideRange(newStartDate, newEndDate), 
                "Cannot exclude dates that have already been minted");
        }
        
        mintStartDate = newStartDate;
        mintEndDate = newEndDate;
        emit DateRangeUpdated(mintStartDate, mintEndDate);
    }

    function extendMintEndDate(uint64 newEndDate) external onlyOwner {
        require(newEndDate > mintEndDate, "New end date must be later");
        require(_isValidDate(newEndDate), "Invalid date format");
        
        mintEndDate = newEndDate;
        emit DateRangeUpdated(mintStartDate, mintEndDate);
    }

    function extendMintStartDate(uint64 newStartDate) external onlyOwner {
        require(newStartDate < mintStartDate, "New start date must be earlier");
        require(_isValidDate(newStartDate), "Invalid date format");
        
        mintStartDate = newStartDate;
        emit DateRangeUpdated(mintStartDate, mintEndDate);
    }

    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
        emit MintingStatusUpdated(enabled);
    }

    function toggleEmergencyStop() external onlyOwner {
        isEmergencyStopped = !isEmergencyStopped;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Internal functions
    function _isValidDate(uint64 date) internal pure returns (bool) {
        unchecked {
            uint64 year = date / 10000;
            uint64 month = (date % 10000) / 100;
            uint64 day = date % 100;
            
            // Extended year range validation
            if (year < MIN_VALID_YEAR || year > MAX_VALID_YEAR) return false;
            if (month == 0 || month > 12) return false;
            if (day == 0 || day > 31) return false;
            
            if (month == 4 || month == 6 || month == 9 || month == 11) {
                if (day > 30) return false;
            } else if (month == 2) {
                bool isLeapYear = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
                if (day > (isLeapYear ? 29 : 28)) return false;
            }
            
            return true;
        }
    }

    function _sendRefund(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount, gas: 2300}("");
        if (success) {
            emit RefundIssued(to, amount);
        }
    }

    receive() external payable {
        if (msg.sender != owner() && 
            !datesMinted[uint256(uint160(msg.sender))] &&
            address(this).balance > type(uint256).max - msg.value) {
            revert("Unauthorized ETH transfer");
        }
    }
    
    fallback() external payable {
        revert("Invalid transaction");
    }

    function setDateMetadata(
        uint256 tokenId,
        string memory name,
        string memory description
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(bytes(name).length <= 32, "Name too long");
        require(bytes(description).length <= 200, "Description too long");
        require(!usedNames[name] || keccak256(bytes(dateMetadata[tokenId].name)) == keccak256(bytes(name)), "Name already used");
        
        if(bytes(dateMetadata[tokenId].name).length > 0) {
            usedNames[dateMetadata[tokenId].name] = false;
        }
        
        dateMetadata[tokenId] = DateMetadata({
            name: name,
            description: description,
            lastUpdated: uint32(block.timestamp)
        });
        
        usedNames[name] = true;
        emit MetadataUpdated(tokenId, name, description);
    }

    function generateSVG(uint256 dateId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350">',
                '<style>.base { fill: black; font-family: serif; font-size: 14px; }</style>',
                '<rect width="100%" height="100%" fill="#f8f9fa"/>',
                '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">',
                _formatDate(dateId),
                '</text></svg>'
            )
        );
    }

    function _formatDate(uint256 dateId) internal pure returns (string memory) {
        uint256 year = dateId / 10000;
        uint256 month = (dateId % 10000) / 100;
        uint256 day = dateId % 100;
        
        string[12] memory months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        return string(
            abi.encodePacked(
                months[month - 1],
                " ",
                day.toString(),
                ", ",
                year.toString()
            )
        );
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        DateMetadata memory metadata = dateMetadata[tokenId];
        string memory formattedDate = _formatDate(tokenId);
        string memory name = bytes(metadata.name).length > 0 ? metadata.name : formattedDate;
        string memory description = bytes(metadata.description).length > 0 ? 
            metadata.description : 
            "A unique date NFT from the DateOnBase collection";

        string memory svg = Base64.encode(bytes(generateSVG(tokenId)));
        
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"', name,
                            '","description":"', description,
                            '","image":"data:image/svg+xml;base64,', svg,
                            '","attributes":[',
                            '{"trait_type":"Date","value":"', formattedDate, '"}',
                            ']}'
                        )
                    )
                )
            )
        );
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return datesMinted[tokenId];
    }

    // Add contractURI function
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // Add function to update contractURI
    function setContractURI(string memory newURI) external onlyOwner {
        _contractURI = newURI;
    }

    // Internal helper function to check if any dates outside new range are minted
    function _noMintedDatesOutsideRange(uint64 newStartDate, uint64 newEndDate) internal view returns (bool) {
        // Check a sample of dates that would be excluded
        // This is not exhaustive but provides a reasonable safety check
        uint64[] memory datesToCheck = new uint64[](4);
        datesToCheck[0] = mintStartDate;  // Current start
        datesToCheck[1] = uint64((uint256(mintStartDate) + uint256(newStartDate)) / 2);  // Midpoint before new start
        datesToCheck[2] = uint64((uint256(newEndDate) + uint256(mintEndDate)) / 2);  // Midpoint after new end
        datesToCheck[3] = mintEndDate;  // Current end
        
        for(uint i = 0; i < datesToCheck.length; i++) {
            uint64 dateToCheck = datesToCheck[i];
            if (dateToCheck < newStartDate || dateToCheck > newEndDate) {
                if (datesMinted[dateToCheck]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Add function to update mint price
    function setMintPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }
} 