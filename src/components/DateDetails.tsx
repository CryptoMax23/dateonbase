import { format } from 'date-fns';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { DATE_NFT_ADDRESS, DATE_NFT_ABI } from '@/config/contracts';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

interface DateDetailsProps {
  selectedDate: Date | null;
}

// Create a custom event for date minting
const emitDateMinted = (dateId: number) => {
  const event = new CustomEvent('dateMinted', { detail: { dateId } });
  window.dispatchEvent(event);
};

export default function DateDetails({ selectedDate }: DateDetailsProps) {
  // All hooks must be called before any conditional returns
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Use useMemo to compute dateId and formattedDate only when selectedDate changes
  const { dateId, formattedDate } = useMemo(() => {
    if (!selectedDate) {
      return { dateId: 0, formattedDate: '' };
    }
    const id = parseInt(format(selectedDate, 'yyyyMMdd'));
    console.log('Selected date:', selectedDate, 'as ID:', id, 'as BigInt:', BigInt(id));
    return {
      dateId: id,
      formattedDate: format(selectedDate, 'EEEE, MMMM d, yyyy')
    };
  }, [selectedDate]);

  // Contract reads with error logging
  const { 
    data: isMinted, 
    isError: isMintedError,
    error: mintedError,
    isLoading: isMintedLoading,
    refetch: refetchMinted
  } = useReadContract({
    address: DATE_NFT_ADDRESS,
    abi: DATE_NFT_ABI,
    functionName: 'datesMinted',
    args: [BigInt(dateId)],
    query: {
      enabled: dateId !== 0,
    }
  });

  const { 
    data: owner, 
    isError: ownerError,
    error: ownerFetchError,
    isLoading: isOwnerLoading,
    refetch: refetchOwner
  } = useReadContract({
    address: DATE_NFT_ADDRESS,
    abi: DATE_NFT_ABI,
    functionName: 'ownerOf',
    args: [BigInt(dateId)],
    query: {
      enabled: dateId !== 0 && isMinted === true,
      retry: 2,
    }
  });

  // Get OpenSea URL from environment variable
  const openSeaBaseUrl = process.env.NEXT_PUBLIC_OPENSEA_URL || 'https://testnets.opensea.io/assets/base-sepolia';
  const openSeaUrl = `${openSeaBaseUrl}/${DATE_NFT_ADDRESS}/${dateId}`;

  // Debug logging
  useEffect(() => {
    if (mintedError) {
      console.error('Error checking if date is minted:', mintedError);
    }
    if (ownerFetchError) {
      console.error('Error fetching owner:', ownerFetchError);
    }
  }, [mintedError, ownerFetchError]);

  const handleMint = async () => {
    if (!dateId) return;
    
    const toastId = toast.loading('Preparing to mint your date...');
    
    try {
      setIsLoading(true);
      
      // Send the transaction
      const hash = await writeContractAsync({
        address: DATE_NFT_ADDRESS,
        abi: DATE_NFT_ABI,
        functionName: 'mint',
        args: [BigInt(dateId)],
        value: parseEther('0.01'),
      });

      if (!hash) {
        throw new Error('Transaction failed');
      }

      toast.loading('Transaction submitted! Waiting for confirmation...', {
        id: toastId,
      });

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        toast.success('Successfully minted your date!', {
          id: toastId,
          description: `You now own ${formattedDate}`,
        });

        // Emit the custom event
        emitDateMinted(dateId);

        // Refetch the data
        await Promise.all([
          refetchMinted(),
          refetchOwner()
        ]);
      } else {
        toast.error('Transaction failed', {
          id: toastId,
          description: 'The transaction was reverted by the network',
        });
      }
    } catch (error: unknown) {
      console.error('Error minting:', error);
      toast.error('Failed to mint', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = owner === address;

  // Early return if no date selected
  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Date Details</h2>
        <p className="text-gray-600">Select a date to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Date Details</h2>
      
      <h3 className="text-2xl font-bold mb-2 text-gray-900">{formattedDate}</h3>
      <p className="text-gray-600 mb-4">Date ID: {dateId}</p>

      <div className="mb-4">
        <span className="font-semibold text-gray-800">Status: </span>
        {isMintedLoading ? (
          <span className="text-gray-500">Checking status...</span>
        ) : (
          <span className={`inline-block px-2 py-1 rounded ${
            isMinted 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {isMinted ? 'Minted' : 'Available'}
          </span>
        )}
      </div>

      {isMinted ? (
        <div className="space-y-2">
          <p className="text-gray-700">
            This date has been minted as an NFT.
          </p>
          <div className="text-gray-600">
            <span className="font-semibold text-gray-800">Owner: </span>
            {isOwnerLoading ? (
              <span className="text-gray-500">Loading owner...</span>
            ) : ownerError ? (
              <span className="text-red-600">Error loading owner information</span>
            ) : isOwner ? (
              <span className="text-green-600 font-medium">You own this date!</span>
            ) : owner ? (
              <span className="font-mono break-all">{owner as string}</span>
            ) : (
              <span className="text-gray-500">No owner found</span>
            )}
          </div>
          <div className="mt-4">
            <a
              href={openSeaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
            >
              View on OpenSea
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <span className="font-semibold text-gray-800">Price: </span>
            <span className="text-gray-700">0.01 ETH</span>
          </div>

          <button
            onClick={handleMint}
            disabled={!isConnected || isLoading}
            className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
              !isConnected
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isLoading
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }`}
          >
            {!isConnected 
              ? 'Connect Wallet to Purchase'
              : isLoading
              ? 'Minting...'
              : 'Purchase Date'}
          </button>
        </>
      )}

      {(isMintedError || ownerError) && (
        <div className="mt-2 text-red-600">
          <p>Error fetching date information. Please try again.</p>
          <p className="text-sm mt-1">
            {mintedError?.message || ownerFetchError?.message}
          </p>
        </div>
      )}
    </div>
  );
} 