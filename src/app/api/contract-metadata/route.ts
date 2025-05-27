import { NextResponse } from 'next/server';
import { DATE_NFT_ADDRESS } from '@/config/contracts';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return NextResponse.json({
    name: "DateOnBase",
    description: "Mint the moment. Trade the time. Flex your dates. The 1/1 collection for every date on Base. Own your special day on the blockchain.",
    image: `${baseUrl}/api/collection-image`,
    external_link: baseUrl,
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: DATE_NFT_ADDRESS,
    social_media: {
      twitter: "your_twitter_handle", // Optional: Add your Twitter handle
      discord: "your_discord_link",   // Optional: Add your Discord link
    }
  });
} 