import Link from 'next/link';
import Image from 'next/image';
import { Snapshot } from '@/lib/types';
import MotionCard from './MotionCard';

interface SnapshotCardProps {
  snapshot: Snapshot;
  binId: number;
}

export default function SnapshotCard({ snapshot, binId }: SnapshotCardProps) {
  // Format timestamp - convert from UTC to local timezone
  // The timestamp from the backend is already in UTC, so we need to specify that
  const timestamp = new Date(snapshot.timestamp + 'Z');
  const formattedDate = timestamp.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = timestamp.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  // Full formatted datetime for tooltip
  const fullFormattedDateTime = timestamp.toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'long',
    // timeZoneName: 'short', causes Error: Invalid option : option error
  });

  // Get color based on food score
  const getFoodScoreColor = (score: number): string => {
    switch(score) {
      case 0: return "bg-green-600 text-white";
      case 1: return "bg-yellow-500 text-white";
      case 2: return "bg-orange-500 text-white";
      default: return "bg-red-600 text-white"; // 3 and above
    }
  };

  // Emojis for waste items
  const wasteTypeEmojis = {
    foodTrays: '🍱',
    burgers: '🍔',
    milk: '🥛',
    vegetables: '🥦',
    fruits: '🍎',
  };

  return (
    <MotionCard 
      className="bg-gray-800 rounded-md overflow-hidden border border-gray-700 hover:border-emerald-700 hover:shadow-md hover:shadow-emerald-900/20"
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      scale={1.02}
      perspective={800}
      transitionSpeed={300}
      glareEnable={true}
      glareMaxOpacity={0.1}
      glareColor="#40f0c4"
      glarePosition="bottom"
    >
      <div className="flex h-20">
        <div className="relative h-full w-20 flex-shrink-0">
          <Image 
            src={`data:image/png;base64,${snapshot.image_data}`}
            alt={`Snapshot #${snapshot.id}`}
            fill
            className="object-cover"
            unoptimized
          />
          <div className={`absolute bottom-0 right-0 ${getFoodScoreColor(snapshot.food_score)} w-6 h-6 flex items-center justify-center text-xs font-bold`}>
            {snapshot.food_score}
          </div>
        </div>
        <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-semibold text-emerald-500">#{snapshot.id}</span>
            <span className="text-xs text-gray-400" title={fullFormattedDateTime}>{formattedDate} {formattedTime}</span>
          </div>
          <div className="flex gap-2 text-xs text-gray-300 flex-wrap mb-1">
            {snapshot.food_trays > 0 && <span title="Food Trays">{wasteTypeEmojis.foodTrays}{snapshot.food_trays}</span>}
            {snapshot.unfinished_burgers > 0 && <span title="Unfinished Burgers">{wasteTypeEmojis.burgers}{snapshot.unfinished_burgers}</span>}
            {snapshot.milk_cartons > 0 && <span title="Milk Cartons">{wasteTypeEmojis.milk}{snapshot.milk_cartons}</span>}
            {snapshot.vegetable_portions > 0 && <span title="Vegetables">{wasteTypeEmojis.vegetables}{snapshot.vegetable_portions}</span>}
            {snapshot.fruit_portions > 0 && <span title="Fruits">{wasteTypeEmojis.fruits}{snapshot.fruit_portions}</span>}
          </div>
          <Link 
            href={`/dashboard/bin/${binId}/snapshot/${snapshot.id}`}
            className="bg-emerald-900 text-emerald-300 w-full py-1 text-center rounded text-xs hover:bg-emerald-800 hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </MotionCard>
  );
} 