import { parseAbi } from 'viem';

export const DATE_NFT_ADDRESS = '0xBBb811040c8D20aC5F30467BC10a4795d8292D05';

export const DATE_NFT_ABI = parseAbi([
  // Events
  'event DateRangeUpdated(uint64 startDate, uint64 endDate)',
  'event MintPriceReceived(address indexed from, uint256 dateId)',
  'event MintingStatusUpdated(bool enabled)',
  'event RoyaltyInfoUpdated(address recipient, uint96 percentage)',
  'event MetadataUpdated(uint256 indexed tokenId, string name, string description)',
  'event RefundIssued(address indexed to, uint256 amount)',
  'event Withdrawn(address indexed to, uint256 amount)',
  'event MintPriceUpdated(uint256 oldPrice, uint256 newPrice)',

  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function mintStartDate() view returns (uint64)',
  'function mintEndDate() view returns (uint64)',
  'function mintingEnabled() view returns (bool)',
  'function isDateMinted(uint256 dateId) view returns (bool)',
  'function isDateMintable(uint256 dateId) view returns (bool)',
  'function mintPrice() view returns (uint256)',
  'function contractURI() view returns (string)',

  // Write functions
  'function mint(uint256 dateId) payable',
  'function batchMint(uint256[] calldata dateIds) payable',
  'function setDateMetadata(uint256 tokenId, string memory name, string memory description)',
  'function setMintPrice(uint256 newPrice)',
]); 