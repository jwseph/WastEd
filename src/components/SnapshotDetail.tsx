import Image from 'next/image';
import { useState } from 'react';
import { Snapshot } from '@/lib/types';

interface SnapshotDetailProps {
  snapshot: Snapshot;
}

export default function SnapshotDetail({ snapshot }: SnapshotDetailProps) {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  
  // Format timestamp - convert from UTC to local timezone
  const timestamp = new Date(snapshot.timestamp + 'Z');
  const formattedDate = timestamp.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = timestamp.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate percentage for the pie chart
  const percent = snapshot.percent_hundred_surface_area;
  const remainingPercent = 100 - percent;

  // Toggle image zoom
  const toggleImageZoom = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-emerald-500">Snapshot #{snapshot.id}</h2>
          <div className="text-right">
            <p className="text-gray-300 text-sm md:text-base">{formattedDate}</p>
            <p className="text-gray-400 text-xs md:text-sm">{formattedTime}</p>
          </div>
        </div>
        
        {/* Image with zoom functionality */}
        <div className={`relative mb-6 ${isImageZoomed ? 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4' : 'h-64 md:h-80 w-full'}`}>
          <div className={`relative ${isImageZoomed ? 'h-[90vh] w-full max-w-4xl' : 'h-full w-full'}`}>
            <Image 
              src={`data:image/png;base64,${snapshot.image_data}`}
              alt={`Snapshot #${snapshot.id}`}
              fill
              className={`${isImageZoomed ? 'object-contain' : 'object-contain rounded-lg border border-gray-600'} cursor-pointer`}
              unoptimized
              onClick={toggleImageZoom}
            />
          </div>
          {isImageZoomed && (
            <button 
              className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full"
              onClick={toggleImageZoom}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {!isImageZoomed && (
            <button 
              className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full text-xs"
              onClick={toggleImageZoom}
              title="Click to zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Food score with colored circle */}
        <div className="flex items-center justify-center mb-6">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center ${getFoodScoreColor(snapshot.food_score)} border-2 border-gray-700 shadow-lg`}>
            <div className="text-center">
              <div className="text-3xl font-bold">{snapshot.food_score}</div>
              <div className="text-xs font-semibold">FOOD SCORE</div>
            </div>
          </div>
        </div>
        
        {/* Statistics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 mb-6">
          <StatCard 
            label="Food Trays" 
            value={snapshot.food_trays}
            emoji="🍱"
          />
          <StatCard 
            label="Burgers" 
            value={snapshot.unfinished_burgers}
            emoji="🍔"
          />
          <StatCard 
            label="Milk Cartons" 
            value={snapshot.milk_cartons}
            emoji="🥛"
          />
          <StatCard 
            label="Vegetable Portions" 
            value={snapshot.vegetable_portions}
            emoji="🥦"
          />
          <StatCard 
            label="Fruit Portions" 
            value={snapshot.fruit_portions}
            emoji="🍎"
          />
          <StatCard 
            label="Bin Status" 
            value={snapshot.is_empty ? "Empty" : "Contains items"}
            emoji={snapshot.is_empty ? "🗑️" : "🗑️‍♻️"}
            isText
          />
        </div>
        
        {/* Pie chart for surface area percentage */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-emerald-500 mb-3">Surface Area Coverage</h3>
          <div className="flex items-center">
            <div className="relative w-20 h-20 mr-4">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {/* Background circle */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth="2"
                />
                
                {/* Foreground circle for percentage (using stroke-dasharray trick) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  strokeDasharray={`${percent} ${remainingPercent}`}
                  strokeDashoffset="25"
                  transform="rotate(-90 18 18)"
                />
                
                {/* Percentage text in center */}
                <text 
                  x="18" 
                  y="18" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fontSize="8"
                  className="fill-emerald-500 font-bold"
                >
                  {Math.round(percent)}%
                </text>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-500">Food Waste Coverage</h4>
              <p className="text-gray-400 text-sm">
                {percent.toFixed(1)}% of the bin surface is covered with food waste.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  emoji: string;
  isText?: boolean;
}

function StatCard({ label, value, emoji, isText = false }: StatCardProps) {
  return (
    <div className="bg-gray-700 p-3 rounded-lg flex flex-col items-center justify-center border border-gray-600 hover:border-emerald-700 transition-colors">
      <div className="text-3xl mb-1">{emoji}</div>
      <p className="text-gray-300 text-xs text-center">{label}</p>
      <p className="text-white font-semibold text-center text-sm">{value}</p>
    </div>
  );
}

function getFoodScoreColor(score: number): string {
  switch(score) {
    case 0: return "bg-green-600 text-white";
    case 1: return "bg-yellow-500 text-white";
    case 2: return "bg-orange-500 text-white";
    default: return "bg-red-600 text-white"; // 3 and above
  }
} 