import { useReadContracts, useWatchContractEvent } from 'wagmi';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { DATE_NFT_ADDRESS, DATE_NFT_ABI } from '@/config/contracts';
import { useEffect, useCallback } from 'react';

export function useMonthMintedDates(currentMonth: Date) {
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const dateIds = days.map(date => parseInt(format(date, 'yyyyMMdd')));

  const { data: mintedResults, refetch } = useReadContracts({
    contracts: dateIds.map(dateId => ({
      address: DATE_NFT_ADDRESS as `0x${string}`,
      abi: DATE_NFT_ABI,
      functionName: 'isDateMintable',
      args: [BigInt(dateId)],
    })),
  });

  // Memoize the minted dates calculation
  const calculateMintedDates = useCallback(() => {
    return dateIds.reduce((acc, dateId, index) => {
      const result = mintedResults?.[index];
      // If a date is NOT mintable, it means it's already minted
      acc[dateId] = Boolean(result?.status === 'success' && !result.result);
      return acc;
    }, {} as Record<number, boolean>);
  }, [mintedResults, dateIds]);

  // Listen for the custom dateMinted event
  useEffect(() => {
    const handleDateMinted = (event: CustomEvent<{ dateId: number }>) => {
      const mintedDateId = event.detail.dateId;
      if (dateIds.includes(mintedDateId)) {
        refetch();
      }
    };

    window.addEventListener('dateMinted', handleDateMinted as EventListener);
    return () => {
      window.removeEventListener('dateMinted', handleDateMinted as EventListener);
    };
  }, [dateIds, refetch]);

  // Watch for MintPriceReceived events as backup
  useWatchContractEvent({
    address: DATE_NFT_ADDRESS as `0x${string}`,
    abi: DATE_NFT_ABI,
    eventName: 'MintPriceReceived',
    onLogs: (logs) => {
      const mintedDateId = logs[0]?.args?.dateId;
      if (mintedDateId && dateIds.includes(Number(mintedDateId))) {
        refetch();
      }
    },
  });

  return calculateMintedDates();
} 