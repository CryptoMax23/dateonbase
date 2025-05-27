'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Calendar from '@/components/Calendar';
import DateDetails from '@/components/DateDetails';
import { useState } from 'react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">DateOnBase</h1>
        <ConnectButton />
      </nav>

      <h2 className="text-3xl font-bold mb-4 text-black">Date NFT Collection</h2>
      <p className="text-gray-600 mb-2">
        Do you have an important date you want to remember forever?
      </p>
      <p className="text-gray-600 mb-8">
        The 1/1 collection for every date. Own your special day on the blockchain.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Calendar onDateSelect={setSelectedDate} selectedDate={selectedDate} />
        <DateDetails selectedDate={selectedDate} />
      </div>
    </main>
  );
} 