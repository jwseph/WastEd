"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SnapshotDetail from '@/components/SnapshotDetail';
import { getSnapshot } from '@/lib/api';
import { Snapshot } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function SnapshotDetailsPage() {
  const { id, snapshotId } = useParams();
  const binId = Number(id);
  const snapshotIdNum = Number(snapshotId);
  const router = useRouter();
  const { school } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!school) {
      router.push('/auth/login');
      return;
    }

    const fetchSnapshotData = async () => {
      try {
        const data = await getSnapshot(binId, snapshotIdNum);
        setSnapshot(data);
      } catch (err) {
        setError('Failed to load snapshot data');
        console.error('Error fetching snapshot data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshotData();
  }, [binId, snapshotIdNum, router, school]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-950 min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-700 border-r-transparent"></div>
              <p className="mt-2 text-gray-400">Loading snapshot data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !snapshot) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-950 min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
              {error || 'Snapshot not found'}
            </div>
            <Link 
              href={`/dashboard/bin/${binId}`}
              className="text-emerald-500 hover:underline"
            >
              &larr; Back to Bin
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-950 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href={`/dashboard/bin/${binId}`}
            className="text-emerald-500 hover:underline mb-6 block"
          >
            &larr; Back to Bin
          </Link>

          <SnapshotDetail snapshot={snapshot} />
        </div>
      </div>
    </>
  );
} 