"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SnapshotCard from '@/components/SnapshotCard';
import InteractivePieChart from '@/components/InteractivePieChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getBinHistory, getBinLatestImageUrl, updateBin, getBinSnapshots, getAIAnalysis } from '@/lib/api';
import { BinHistory, Snapshot } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function BinDetailsPage() {
  const { id } = useParams();
  const binId = Number(id);
  const router = useRouter();
  const { school } = useAuth();
  const [binData, setBinData] = useState<BinHistory | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const imageUrl = `${getBinLatestImageUrl(binId)}?refresh=${refreshCounter}`;
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [binName, setBinName] = useState('');
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1_week');
  const [consolidatedStats, setConsolidatedStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const SNAPSHOTS_PER_PAGE = 12;

  const timeRangeOptions = [
    { value: '1_day', label: 'Last 24 Hours' },
    { value: '1_week', label: 'Last Week' },
    { value: '2_weeks', label: 'Last 2 Weeks' },
    { value: '1_month', label: 'Last Month' },
    { value: '1_year', label: 'Last Year' },
    { value: 'all_time', label: 'All Time' },
  ];

  // Filter snapshots based on time range
  const filterSnapshotsByTimeRange = (snapshotsToFilter: Snapshot[], timeRange: string): Snapshot[] => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '1_day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '1_week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '2_weeks':
        cutoffDate.setDate(now.getDate() - 14);
        break;
      case '1_month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '1_year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all_time':
        return snapshotsToFilter;
      default:
        cutoffDate.setDate(now.getDate() - 7); // Default to 1 week
    }
    
    return snapshotsToFilter.filter(snapshot => {
      const snapshotDate = new Date(snapshot.timestamp);
      return snapshotDate >= cutoffDate;
    });
  };
  
  // Generate AI summary using the API
  const generateAISummary = async (averages: any, timeRange: string): Promise<string> => {
    try {
      console.log('Generating AI summary for timeRange:', timeRange);
      // We need to calculate the waste percentages for the API call
      const totalWasteItems = 
        averages.food_trays + 
        averages.unfinished_burgers + 
        averages.milk_cartons + 
        averages.vegetable_portions + 
        averages.fruit_portions;
      
      // Prepare data for the API call
      const currentStats = {
        averages,
        wasteBreakdown: {
          food_trays: totalWasteItems > 0 ? (averages.food_trays / totalWasteItems) * 100 : 0,
          unfinished_burgers: totalWasteItems > 0 ? (averages.unfinished_burgers / totalWasteItems) * 100 : 0,
          milk_cartons: totalWasteItems > 0 ? (averages.milk_cartons / totalWasteItems) * 100 : 0,
          vegetable_portions: totalWasteItems > 0 ? (averages.vegetable_portions / totalWasteItems) * 100 : 0,
          fruit_portions: totalWasteItems > 0 ? (averages.fruit_portions / totalWasteItems) * 100 : 0,
        },
      };
      
      console.log('Calling AI analysis API with data:', { binId, timeRange, currentStats });
      // Get AI analysis from backend
      const response = await getAIAnalysis(binId, timeRange, currentStats);
      console.log('AI analysis response:', response);
      return response.analysis;
    } catch (err) {
      // Return a fallback message in case of error
      const timeRangeText = timeRangeOptions.find(option => option.value === timeRange)?.label.toLowerCase() || '';
      
      return `Over ${timeRangeText}, this bin has averaged a food score of ${averages.food_score.toFixed(1)}. 
              The most wasted items are fruits and vegetables.`;
    }
  };

  // Set up image refresh interval
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
      setImageError(false);
    }, 20000); // Refresh every 20 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!school) {
      router.push('/auth/login');
      return;
    }

    const fetchBinData = async () => {
      try {
        const data = await getBinHistory(binId);
        setBinData(data);
        // If we have IP and name from the data, set them
        if (data.ip_address) {
          setIpAddress(data.ip_address);
        }
        if (data.name) {
          setBinName(data.name);
        }
      } catch (err) {
        setError('Failed to load bin data');
        console.error('Error fetching bin data:', err);
      }
    };

    const fetchSnapshots = async () => {
      try {
        const data = await getBinSnapshots(binId); // Fetch all snapshots without limit
        setSnapshots(data);
      } catch (err) {
        console.error('Error fetching snapshots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBinData();
    fetchSnapshots();
  }, [binId, router, school]);

  // Function to generate consolidated statistics
  const generateConsolidatedStats = async () => {
    setLoadingStats(true);
    setStatsError('');
    
    try {
      // Filter snapshots based on selected time range
      const filteredSnapshots = filterSnapshotsByTimeRange(snapshots, selectedTimeRange);
      
      if (filteredSnapshots.length === 0) {
        setStatsError('No snapshots available for the selected time range');
        setConsolidatedStats(null);
        setLoadingStats(false);
        return;
      }
      
      // Calculate averages
      const totalItems = {
        food_trays: 0,
        unfinished_burgers: 0,
        milk_cartons: 0,
        vegetable_portions: 0,
        fruit_portions: 0,
        percent_hundred_surface_area: 0,
        food_score: 0,
      };
      
      filteredSnapshots.forEach(snapshot => {
        totalItems.food_trays += snapshot.food_trays;
        totalItems.unfinished_burgers += snapshot.unfinished_burgers;
        totalItems.milk_cartons += snapshot.milk_cartons;
        totalItems.vegetable_portions += snapshot.vegetable_portions;
        totalItems.fruit_portions += snapshot.fruit_portions;
        totalItems.percent_hundred_surface_area += snapshot.percent_hundred_surface_area;
        totalItems.food_score += snapshot.food_score;
      });
      
      const averages = {
        food_trays: totalItems.food_trays / filteredSnapshots.length,
        unfinished_burgers: totalItems.unfinished_burgers / filteredSnapshots.length,
        milk_cartons: totalItems.milk_cartons / filteredSnapshots.length,
        vegetable_portions: totalItems.vegetable_portions / filteredSnapshots.length,
        fruit_portions: totalItems.fruit_portions / filteredSnapshots.length,
        percent_hundred_surface_area: totalItems.percent_hundred_surface_area / filteredSnapshots.length,
        food_score: totalItems.food_score / filteredSnapshots.length,
      };
      
      // Calculate waste breakdown percentages for pie chart
      const totalWasteItems = 
        totalItems.food_trays + 
        totalItems.unfinished_burgers + 
        totalItems.milk_cartons + 
        totalItems.vegetable_portions + 
        totalItems.fruit_portions;
      
      const wasteBreakdown = {
        food_trays: totalWasteItems > 0 ? (totalItems.food_trays / totalWasteItems) * 100 : 0,
        unfinished_burgers: totalWasteItems > 0 ? (totalItems.unfinished_burgers / totalWasteItems) * 100 : 0,
        milk_cartons: totalWasteItems > 0 ? (totalItems.milk_cartons / totalWasteItems) * 100 : 0,
        vegetable_portions: totalWasteItems > 0 ? (totalItems.vegetable_portions / totalWasteItems) * 100 : 0,
        fruit_portions: totalWasteItems > 0 ? (totalItems.fruit_portions / totalWasteItems) * 100 : 0,
      };
      
      // For now, we'll use a mock AI summary since we don't have historical data to compare
      const aiSummary = await generateAISummary(averages, selectedTimeRange);
      
      setConsolidatedStats({
        averages,
        wasteBreakdown,
        aiSummary,
        filteredSnapshotCount: filteredSnapshots.length,
      });
      
    } catch (err) {
      console.error('Error generating consolidated stats:', err);
      setStatsError('Failed to generate statistics');
    } finally {
      setLoadingStats(false);
    }
  };
  
  // Effect to regenerate stats when time range changes
  useEffect(() => {
    if (snapshots.length > 0) {
      generateConsolidatedStats();
    }
  }, [selectedTimeRange, snapshots]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleManualRefresh = () => {
    setRefreshCounter(prev => prev + 1);
    setImageError(false);
  };
  
  const handleUpdateIp = async () => {
    if (!ipAddress.trim()) {
      return;
    }
    
    try {
      // Use the updateBin API function
      await updateBin(binId, { ip_address: ipAddress });
      setIsEditingIp(false);
      // Refetch bin data to reflect changes
      const data = await getBinHistory(binId);
      setBinData(data);
    } catch (err) {
      console.error('Error updating bin IP:', err);
      alert('Failed to update bin IP address');
    }
  };

  const handleUpdateName = async () => {
    try {
      await updateBin(binId, { name: binName });
      setIsEditingName(false);
      // Refetch bin data to reflect changes
      const data = await getBinHistory(binId);
      setBinData(data);
    } catch (err) {
      console.error('Error updating bin name:', err);
      alert('Failed to update bin name');
    }
  };

  // Calculate paginated snapshots
  const paginatedSnapshots = useMemo(() => {
    const startIndex = (currentPage - 1) * SNAPSHOTS_PER_PAGE;
    return snapshots.slice(startIndex, startIndex + SNAPSHOTS_PER_PAGE);
  }, [snapshots, currentPage]);

  const totalPages = Math.ceil(snapshots.length / SNAPSHOTS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto p-4 pt-16">
          <div className="flex items-center justify-center min-h-[80vh]">
            <LoadingSpinner size="lg" label="Loading bin data..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !binData) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-950 min-h-screen p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
              {error || 'Bin not found'}
            </div>
            <Link 
              href={`/dashboard/school/${school?.id}`}
              className="text-emerald-500 hover:underline"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  const displayName = binName || `Bin #${binId}`;
  
  // Format current timestamp in local timezone
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleString(undefined, { 
    dateStyle: 'medium', 
    timeStyle: 'medium',
    // timeZoneName: 'short', // Show timezone name causes Error: Invalid option : option error
  });

  // Helper function to get color based on food score
  const getFoodScoreColor = (score: number): string => {
    switch(Math.round(score)) {
      case 0: return "bg-green-600 text-white";
      case 1: return "bg-yellow-500 text-white";
      case 2: return "bg-orange-500 text-white";
      default: return "bg-red-600 text-white"; // 3 and above
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-950 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <Link 
            href={`/dashboard/school/${school?.id}`}
            className="text-emerald-500 hover:underline mb-6 block"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden mb-8 border border-gray-800">
            <div className="p-6 pb-4">
              <div className="flex items-center mb-2">
                {isEditingName ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={binName}
                      onChange={(e) => setBinName(e.target.value)}
                      className="border border-gray-700 bg-gray-800 rounded px-2 py-1 text-xl font-bold mr-2 text-emerald-500"
                      placeholder="Enter bin name"
                    />
                    <button 
                      onClick={handleUpdateName}
                      className="bg-emerald-700 text-white text-xs px-2 py-1 rounded mr-1"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-emerald-500">{displayName}</h1>
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="ml-2 text-emerald-500 text-xs hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="text-gray-400 mb-4">
                <div className="flex items-center mb-2">
                  <span className="mr-2">IP Address:</span>
                  {isEditingIp ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        className="border border-gray-700 bg-gray-800 rounded px-2 py-1 text-sm mr-2 text-gray-200"
                        placeholder="http://ip-address:port"
                      />
                      <button 
                        onClick={handleUpdateIp}
                        className="bg-emerald-700 text-white text-xs px-2 py-1 rounded mr-1"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingIp(false)}
                        className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-gray-300">{ipAddress}</span>
                      <button 
                        onClick={() => setIsEditingIp(true)}
                        className="ml-2 text-emerald-500 text-xs hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-4">
                  <span className="mr-2">Current Food Score:</span>
                  <span className={`${getFoodScoreColor(binData.current_score)} text-2xl font-bold px-4 py-2 rounded-lg shadow-lg inline-flex items-center justify-center transition-transform transform hover:scale-105`}>
                    {binData.current_score}
                    <span className="text-xs ml-2 opacity-80">/ 3</span>
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    Updated: {formattedTime}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 w-full bg-gray-800">
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="text-red-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-center text-gray-400 mb-4">Unable to connect to camera feed</p>
                  <button 
                    onClick={handleManualRefresh}
                    className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <Image 
                  src={imageUrl}
                  alt={`Bin ${binId} Current Image`}
                  fill
                  className="object-contain"
                  unoptimized
                  onError={handleImageError}
                />
              )}
              <button 
                onClick={handleManualRefresh}
                className="absolute bottom-4 right-4 bg-gray-900 text-emerald-500 p-2 rounded-full shadow hover:bg-gray-800"
                title="Refresh camera feed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Consolidated Statistics Section */}
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-emerald-500">Waste Statistics</h2>
              <div className="flex items-center space-x-2">
                <label htmlFor="timeRange" className="text-gray-400 text-sm">Time Range:</label>
                <select
                  id="timeRange"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {loadingStats ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner color="emerald" label="Generating statistics..." />
              </div>
            ) : statsError ? (
              <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-4">
                {statsError}
              </div>
            ) : consolidatedStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waste Breakdown Pie Chart */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-emerald-500 mb-4">Waste Breakdown</h3>
                  <InteractivePieChart data={consolidatedStats.wasteBreakdown} />
                </div>
                
                {/* Summary Report */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-emerald-500 mb-4">Summary Report</h3>
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-2">
                      Based on {consolidatedStats.filteredSnapshotCount} snapshots from the selected time period:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Food Score</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span className={`inline-block h-3 w-3 rounded-full ${getFoodScoreColor(consolidatedStats.averages.food_score)}`}></span>
                          {consolidatedStats.averages.food_score.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Surface Coverage</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span>🗑️</span>
                          {consolidatedStats.averages.percent_hundred_surface_area.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Food Trays</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span>🍱</span>
                          {consolidatedStats.averages.food_trays.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Unfinished Burgers</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span>🍔</span>
                          {consolidatedStats.averages.unfinished_burgers.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Milk Cartons</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span>🥛</span>
                          {consolidatedStats.averages.milk_cartons.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Vegetables</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span>🥦</span>
                          {consolidatedStats.averages.vegetable_portions.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-gray-700 p-2 rounded">
                        <p className="text-gray-400 text-xs">Avg. Fruits</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <span>🍎</span>
                          {consolidatedStats.averages.fruit_portions.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Generated Summary */}
                  <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                    <h4 className="text-emerald-400 text-sm font-semibold mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Analysis
                    </h4>
                    <p className="text-gray-300 text-sm">{consolidatedStats.aiSummary}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No statistics available.</p>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-emerald-500">Recent Snapshots</h2>
              <div className="text-gray-400 text-sm">
                Total: {snapshots.length} snapshots
              </div>
            </div>
            
            {snapshots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No snapshots available yet.</p>
                <p className="text-gray-500 text-sm mt-2">Snapshots are taken automatically every 10 minutes.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedSnapshots.map(snapshot => (
                    <SnapshotCard key={snapshot.id} snapshot={snapshot} binId={binId} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        &lt;
                      </button>
                      
                      {/* Page numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                          let pageNum;
                          
                          // Display appropriate page numbers based on current page
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                            if (idx === 4) pageNum = totalPages;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                            if (idx === 0) pageNum = 1;
                          } else {
                            pageNum = currentPage - 2 + idx;
                            if (idx === 0) pageNum = 1;
                            if (idx === 4) pageNum = totalPages;
                          }
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded ${
                                currentPage === pageNum
                                ? 'bg-emerald-700 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${
                          currentPage === totalPages
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        &gt;
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component for pie chart segments
function PieSegment({ name, percentage, color, startAngle, label }: { 
  name: string; 
  percentage: number; 
  color: string; 
  startAngle: number;
  label: string;
}) {
  if (percentage <= 0) return null;
  
  // SVG pie chart geometry calculations
  const endAngle = startAngle + percentage;
  const largeArcFlag = percentage > 50 ? 1 : 0;
  
  // Convert angles to radians and calculate x,y coordinates
  const startRad = (startAngle / 100 * 360 - 90) * Math.PI / 180;
  const endRad = (endAngle / 100 * 360 - 90) * Math.PI / 180;
  
  const x1 = 50 + 40 * Math.cos(startRad);
  const y1 = 50 + 40 * Math.sin(startRad);
  const x2 = 50 + 40 * Math.cos(endRad);
  const y2 = 50 + 40 * Math.sin(endRad);
  
  const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  
  return (
    <path
      d={path}
      fill={color}
      stroke="#374151"
      strokeWidth="1"
      className="transition-all hover:opacity-80 hover:stroke-white hover:stroke-2 cursor-pointer"
      data-testid={`pie-${name}`}
    />
  );
} 