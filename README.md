# DateOnBase

Own your special dates as NFTs on Base. Mint birthdays, anniversaries, and memorable moments as unique digital collectibles on the blockchain.

## Features

- 🗓 Mint any special date for you as an NFT
- 💎 Each date is a unique 1/1 NFT on Base
- 🎨 Simple yet beautiful SVG-based NFT artwork
- 🔍 Easy date browsing and selection
- 💫 Seamless wallet integration
- 🌐 OpenSea integration for trading

## Contract Details

- **Network**: Base Mainnet
- **Contract Address**: `0xBBb811040c8D20aC5F30467BC10a4795d8292D05`
- **Token Standard**: ERC-721
- **Mint Price**: 0.01 ETH

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit
- **Smart Contract**: Solidity, OpenZeppelin
- **Development**: Hardhat
- **Deployment**: Vercel


## Smart Contract Functions

### User Functions

- `mint(uint256 dateId)`: Mint a specific date NFT
- `datesMinted(uint256 dateId)`: Check if a date is already minted
- `ownerOf(uint256 tokenId)`: Get the owner of a date NFT
- `isDateMintable(uint256 dateId)`: Check if a date can be minted

### Admin Functions

- `setMintDateRange(uint64 newStartDate, uint64 newEndDate)`: Update mintable date range
- `setMintPrice(uint256 newPrice)`: Update mint price
- `toggleEmergencyStop()`: Emergency stop for minting
- `withdraw()`: Withdraw contract balance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

If you discover any security issues, please leave any comments!
