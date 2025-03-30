"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BinCard from '@/components/BinCard';
import { useAuth } from '@/lib/auth-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import MotionCard from '@/components/MotionCard';
import { listBins, addBin, getSisterSchools, addSisterSchool, removeSisterSchool, getAIAnalysis } from '@/lib/api';
import { Bin, SisterSchool } from '@/lib/types';

export default function SchoolDashboard() {
  const { id } = useParams();
  const schoolId = Number(id);
  const { school } = useAuth();
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBin, setShowAddBin] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [binName, setBinName] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [schoolName, setSchoolName] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Sister school state
  const [sisterSchools, setSisterSchools] = useState<SisterSchool[]>([]);
  const [loadingSisterSchools, setLoadingSisterSchools] = useState(false);
  const [sisterSchoolUsername, setSisterSchoolUsername] = useState('');
  const [sisterSchoolError, setSisterSchoolError] = useState('');
  const [showAddSisterSchool, setShowAddSisterSchool] = useState(false);
  const [sisterSchoolComparison, setSisterSchoolComparison] = useState<{
    analysis: string;
    selectedSchool: SisterSchool | null;
  }>({
    analysis: '',
    selectedSchool: null,
  });

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const data = await listBins(schoolId);
        setBins(data);
        
        // Get the school name from the current authenticated user or the first bin
        if (school && school.id === schoolId) {
          setSchoolName(school.username);
          setIsOwner(true);
        } else if (data.length > 0 && data[0].name) {
          // Try to extract school name from bin name if possible
          setSchoolName(`School #${schoolId}`);
          setIsOwner(false);
        } else {
          setSchoolName(`School #${schoolId}`);
          setIsOwner(false);
        }
      } catch (err) {
        console.error('Error fetching bins:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSisterSchools = async () => {
      if (!schoolId) return;
      
      setLoadingSisterSchools(true);
      try {
        const data = await getSisterSchools(schoolId);
        setSisterSchools(data);
      } catch (err) {
        console.error('Error fetching sister schools:', err);
      } finally {
        setLoadingSisterSchools(false);
      }
    };

    fetchBins();
    fetchSisterSchools();
  }, [schoolId, school]);

  // Helper function to get color based on food score
  const getFoodScoreColor = (score: number): string => {
    switch(Math.round(score)) {
      case 0: return "bg-green-600 text-white";
      case 1: return "bg-yellow-500 text-white";
      case 2: return "bg-orange-500 text-white";
      default: return "bg-red-600 text-white"; // 3 and above
    }
  };
  
  // Calculate average food score for the school
  const calculateAverageScore = (bins: Bin[]): number => {
    if (bins.length === 0) return 0;
    const totalScore = bins.reduce((sum, bin) => sum + bin.current_score, 0);
    return totalScore / bins.length;
  };
  
  // Function to handle adding a sister school
  const handleAddSisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !sisterSchoolUsername.trim()) return;
    
    setSisterSchoolError('');
    try {
      await addSisterSchool(schoolId, sisterSchoolUsername);
      // Refresh the sister schools list
      const data = await getSisterSchools(schoolId);
      setSisterSchools(data);
      setSisterSchoolUsername('');
      setShowAddSisterSchool(false);
    } catch (err: any) {
      console.error('Error adding sister school:', err);
      setSisterSchoolError(err.response?.data?.detail || 'Failed to add sister school');
    }
  };

  // Function to handle removing a sister school
  const handleRemoveSisterSchool = async (sisterSchoolId: number) => {
    if (!schoolId) return;
    
    try {
      await removeSisterSchool(schoolId, sisterSchoolId);
      // Refresh the sister schools list
      const data = await getSisterSchools(schoolId);
      setSisterSchools(data);
      // Reset comparison if the removed school was selected
      if (sisterSchoolComparison.selectedSchool?.id === sisterSchoolId) {
        setSisterSchoolComparison({
          analysis: '',
          selectedSchool: null,
        });
      }
    } catch (err) {
      console.error('Error removing sister school:', err);
    }
  };
  
  // Generate AI comparison with a sister school
  const generateSisterSchoolComparison = async (sisterSchool: SisterSchool) => {
    // Get school-level metrics from sister school data
    const schoolAverages = {
      food_score: calculateAverageScore(bins),
      surface_area: sisterSchool.waste_metrics?.surface_area || 0,
      food_trays: sisterSchool.waste_metrics?.food_trays || 0,
      unfinished_burgers: sisterSchool.waste_metrics?.unfinished_burgers || 0,
      milk_cartons: sisterSchool.waste_metrics?.milk_cartons || 0,
      vegetable_portions: sisterSchool.waste_metrics?.vegetable_portions || 0,
      fruit_portions: sisterSchool.waste_metrics?.fruit_portions || 0,
    };
    
    console.log('Using school and sister school metrics:', {
      schoolAvgScore: schoolAverages.food_score,
      sisterSchoolScore: sisterSchool.current_food_score,
      sisterSchoolMetrics: sisterSchool.waste_metrics,
    });
    
    // Data for the AI analysis
    const statsData = {
      schoolId,
      schoolName,
      averages: schoolAverages,
      sisterSchool: {
        id: sisterSchool.id,
        name: sisterSchool.username,
        foodScore: sisterSchool.current_food_score || 0,
        wasteMetrics: sisterSchool.waste_metrics || {
          surface_area: 0,
          food_trays: 0,
          unfinished_burgers: 0,
          milk_cartons: 0,
          vegetable_portions: 0,
          fruit_portions: 0,
        },
      },
      bins_count: bins.length,
    };
    
    try {
      // Use API with an actual bin ID if available, otherwise handle the comparison locally
      if (bins.length > 0) {
        const response = await getAIAnalysis(
          bins[0].id,
          'all_time',
          statsData,
        );
        
        setSisterSchoolComparison({
          analysis: response.analysis,
          selectedSchool: sisterSchool,
        });
      } else {
        // Fallback if no bins are available
        setSisterSchoolComparison({
          analysis: `Comparing ${schoolName} (average score: ${schoolAverages.food_score.toFixed(1)}) with ${sisterSchool.username} (score: ${sisterSchool.current_food_score || 'unknown'}). Each school's score indicates how well they're managing food waste; lower is better.`,
          selectedSchool: sisterSchool,
        });
      }
    } catch (err) {
      console.error('Error generating sister school comparison:', err);
      // Fallback message if AI generation fails
      setSisterSchoolComparison({
        analysis: `Comparing ${schoolName} (average score: ${schoolAverages.food_score.toFixed(1)}) with ${sisterSchool.username} (score: ${sisterSchool.current_food_score || 'unknown'}). Each school's score indicates how well they're managing food waste; lower is better.`,
        selectedSchool: sisterSchool,
      });
    }
  };

  // Sister school comparison UI component
  const renderSisterSchoolComparison = () => {
    // Calculate average score across all bins
    const schoolAvgScore = calculateAverageScore(bins);
    
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-md lg:col-span-1 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-emerald-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            Sister School Comparison
          </h3>
          {isOwner && (
            <button 
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
              onClick={() => setShowAddSisterSchool(!showAddSisterSchool)}
            >
              {showAddSisterSchool ? 'Cancel' : '+ Add School'}
            </button>
          )}
        </div>
        
        {showAddSisterSchool && isOwner && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
            <form onSubmit={handleAddSisterSchool} className="flex flex-col gap-3">
              <div>
                <label htmlFor="sisterSchoolUsername" className="block text-sm font-medium text-gray-300 mb-1">
                  Sister School Username
                </label>
                <input
                  type="text"
                  id="sisterSchoolUsername"
                  value={sisterSchoolUsername}
                  onChange={(e) => {
                    setSisterSchoolUsername(e.target.value);
                  }}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter school username"
                  required
                />
              </div>
              {sisterSchoolError && (
                <div className="text-red-400 text-xs bg-red-900/50 p-2 rounded border border-red-800">
                  {sisterSchoolError}
                </div>
              )}
              <button 
                type="submit" 
                className="bg-emerald-700 text-white py-2 px-3 rounded hover:bg-emerald-600 transition-colors"
              >
                Add School
              </button>
            </form>
          </div>
        )}
        
        {loadingSisterSchools ? (
          <div className="text-center py-4">
            <LoadingSpinner color="blue" label="Loading sister schools..." />
          </div>
        ) : sisterSchools.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-400 font-medium">No sister schools have been added yet.</p>
            <p className="text-gray-500 text-sm mt-2">Add a sister school to compare waste statistics.</p>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <h4 className="text-emerald-500 text-sm font-semibold mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                School Network
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sisterSchools.map(sisterSchool => (
                  <MotionCard
                    key={sisterSchool.id}
                    className={`${
                      sisterSchoolComparison.selectedSchool?.id === sisterSchool.id
                        ? 'border-emerald-500'
                        : 'border-gray-700'
                    } cursor-pointer hover:border-emerald-400 transition-colors hover:bg-gray-700/80`}
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                    scale={1.03}
                    glareEnable={true}
                    glareMaxOpacity={0.15}
                    glareColor="#4ade80"
                    glarePosition="all"
                  >
                    <div 
                      className="bg-gray-800 p-3 rounded-lg border-0"
                      onClick={() => generateSisterSchoolComparison(sisterSchool)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{sisterSchool.username}</span>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSisterSchool(sisterSchool.id);
                            }}
                            className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700"
                            title="Remove sister school"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-3 w-3 rounded-full ${getFoodScoreColor(sisterSchool.current_food_score || 0)}`}></div>
                        <span className="text-xs text-gray-300">
                          Score: {sisterSchool.current_food_score === null ? 'N/A' : sisterSchool.current_food_score}
                        </span>
                      </div>
                    </div>
                  </MotionCard>
                ))}
              </div>
            </div>
            
            {sisterSchoolComparison.selectedSchool && (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-emerald-500 text-sm font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Comparison with {sisterSchoolComparison.selectedSchool.username}
                </h4>
                
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex-1">
                    <div className="bg-gray-700 p-3 rounded-lg text-center shadow-sm border border-gray-600">
                      <p className="text-xs text-gray-300 mb-1">Your School</p>
                      <div className={`text-xl font-bold ${getFoodScoreColor(schoolAvgScore)}`}>
                        {schoolAvgScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">vs</div>
                  <div className="flex-1">
                    <div className="bg-gray-700 p-3 rounded-lg text-center shadow-sm border border-gray-600">
                      <p className="text-xs text-gray-300 mb-1">{sisterSchoolComparison.selectedSchool.username}</p>
                      <div className={`text-xl font-bold ${getFoodScoreColor(sisterSchoolComparison.selectedSchool.current_food_score || 0)}`}>
                        {sisterSchoolComparison.selectedSchool.current_food_score === null ? 'N/A' : sisterSchoolComparison.selectedSchool.current_food_score}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 whitespace-pre-line shadow-sm">
                  <p className="text-gray-300 text-sm">{sisterSchoolComparison.analysis}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleAddBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return; // Only owner can add bins
    
    setError('');

    if (!ipAddress.trim()) {
      setError('IP address is required');
      return;
    }

    try {
      setAdding(true);
      
      // Normalize IP address input to ensure it has the correct format
      let formattedIpAddress = ipAddress.trim();
      if (!formattedIpAddress.startsWith('http://')) {
        formattedIpAddress = `http://${formattedIpAddress}`;
      }
      
      const newBin = await addBin({
        ip_address: formattedIpAddress,
        school_id: schoolId,
        name: binName.trim(),
      });
      
      setBins(prevBins => [...prevBins, newBin]);
      setIpAddress('');
      setBinName('');
      setShowAddBin(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add bin. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-950 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-600">
              {schoolName}'s Dashboard
            </h1>
            {isOwner && (
              <button
                onClick={() => setShowAddBin(!showAddBin)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {showAddBin ? 'Cancel' : 'Add Bin'}
              </button>
            )}
          </div>

          {/* Sister school comparison */}
          {renderSisterSchoolComparison()}

          {showAddBin && isOwner && (
            <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-8 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-emerald-500">Add New Bin</h2>
              
              {error && (
                <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleAddBin} className="space-y-4">
                <div>
                  <label htmlFor="binName" className="block text-gray-300 font-medium mb-1">
                    Bin Name
                  </label>
                  <input
                    id="binName"
                    type="text"
                    value={binName}
                    onChange={(e) => setBinName(e.target.value)}
                    placeholder="e.g., Cafeteria Bin, Library Bin"
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Give your bin a memorable name (optional)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="ipAddress" className="block text-gray-300 font-medium mb-1">
                    Raspberry Pi IP Address
                  </label>
                  <input
                    id="ipAddress"
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="e.g., 192.168.1.10:8000 or http://192.168.1.10:8000"
                    required
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Enter the IP address of the Raspberry Pi monitoring the bin
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={adding}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {adding ? 'Adding...' : 'Add Bin'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" label="Loading bins..." />
            </div>
          ) : bins.length === 0 ? (
            <div className="bg-gray-900 p-8 rounded-lg shadow-md text-center border border-gray-800">
              <h2 className="text-xl font-semibold mb-2 text-emerald-500">No Bins Available</h2>
              <p className="text-gray-400 mb-4">
                {isOwner 
                  ? "Add your first bin to start monitoring food waste."
                  : "This school hasn't added any bins yet."
                }
              </p>
              {isOwner && !showAddBin && (
                <button
                  onClick={() => setShowAddBin(true)}
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  Add Your First Bin
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bins.map((bin) => (
                <BinCard key={bin.id} bin={bin} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 