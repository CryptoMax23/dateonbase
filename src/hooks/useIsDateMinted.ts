import { useReadContract, useWatchContractEvent } from 'wagmi';
import { format } from 'date-fns';
import { DATE_NFT_ADDRESS, DATE_NFT_ABI } from '@/config/contracts';

export function useIsDateMinted(date: Date | null) {
  const dateId = date ? parseInt(format(date, 'yyyyMMdd')) : 0;

  const { data: isMintable, refetch } = useReadContract({
    address: DATE_NFT_ADDRESS,
    abi: DATE_NFT_ABI,
    functionName: 'isDateMintable',
    args: [BigInt(dateId)],
    query: {
      enabled: dateId !== 0,
    }
  });

  // Watch for MintPriceReceived events
  useWatchContractEvent({
    address: DATE_NFT_ADDRESS as `0x${string}`,
    abi: DATE_NFT_ABI,
    eventName: 'MintPriceReceived',
    onLogs: (logs) => {
      // Check if the minted date matches our current dateId
      const mintedDateId = logs[0]?.args?.dateId;
      if (mintedDateId && mintedDateId === BigInt(dateId)) {
        refetch();
      }
    },
  });

  // If a date is NOT mintable, it means it's already minted
  return isMintable === false;
} 