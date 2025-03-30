import Link from 'next/link';
import Image from 'next/image';
import { Bin } from '@/lib/types';
import { getBinLatestImageUrl } from '@/lib/api';
import MotionCard from './MotionCard';

interface BinCardProps {
  bin: Bin;
}

export default function BinCard({ bin }: BinCardProps) {
  const imageUrl = getBinLatestImageUrl(bin.id);
  const displayName = bin.name ? bin.name : `Bin #${bin.id}`;

  // Get color based on food score
  const getFoodScoreColor = (score: number): string => {
    switch(score) {
      case 0: return "bg-green-600 text-white";
      case 1: return "bg-yellow-500 text-white";
      case 2: return "bg-orange-500 text-white";
      default: return "bg-red-600 text-white"; // 3 and above
    }
  };

  return (
    <MotionCard 
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-emerald-600"
      tiltMaxAngleX={12}
      tiltMaxAngleY={12}
      scale={1.03}
      perspective={800}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#40f0c4"
      glarePosition="all"
    >
      <div className="relative h-48 w-full">
        <Image 
          src={imageUrl}
          alt={displayName}
          fill
          className="object-cover"
          unoptimized // Use unoptimized for external images
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-emerald-500 truncate">{displayName}</h3>
        <p className="text-gray-400 text-sm mb-2 truncate">{bin.ip_address}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className={`font-bold px-2 py-1 rounded inline-block ${getFoodScoreColor(bin.current_score)}`}>
              Food Score: {bin.current_score}
            </p>
          </div>
          <Link 
            href={`/dashboard/bin/${bin.id}`}
            className="bg-emerald-700 text-white px-3 py-1 rounded-md text-sm hover:bg-emerald-600 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </MotionCard>
  );
} 