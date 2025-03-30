import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="bg-gray-950 text-gray-200">
      <Navbar />
      <div className="min-h-screen">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-500 mb-6">
              Track Food Waste in Your School
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              WastEd helps schools monitor and reduce food container waste by tracking takeout containers in trash bins.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/auth/register" 
                className="bg-emerald-700 text-white font-medium py-3 px-6 rounded-md hover:bg-emerald-600 transition-colors"
              >
                Register Your School
              </Link>
              <Link 
                href="/auth/login" 
                className="bg-gray-800 text-emerald-500 border-2 border-emerald-700 font-medium py-3 px-6 rounded-md hover:bg-gray-900 transition-colors"
              >
                School Login
              </Link>
            </div>
          </div>

          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Monitor Waste</h3>
              <p className="text-gray-400">
                Our system uses AI to count food containers in trash bins, helping you understand waste patterns.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Track Progress</h3>
              <p className="text-gray-400">
                See historical data to track your school's progress in reducing food container waste over time.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Reduce Impact</h3>
              <p className="text-gray-400">
                Use insights to implement targeted interventions and reduce your school's environmental footprint.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
