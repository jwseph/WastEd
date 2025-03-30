import axios from 'axios';
import { School, SchoolCredentials, Bin, BinCreate, BinHistory, BinUpdate, Snapshot, SisterSchool, SisterSchoolRequest } from './types';

// Configure axios with base URL of your backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const registerSchool = async (credentials: SchoolCredentials): Promise<School> => {
  const response = await api.post<School>('/register-school', credentials);
  return response.data;
};

// Bin API calls
export const addBin = async (binData: BinCreate): Promise<Bin> => {
  const response = await api.post<Bin>('/bins', binData);
  return response.data;
};

export const listBins = async (schoolId: number): Promise<Bin[]> => {
  const response = await api.get<Bin[]>(`/schools/${schoolId}/bins`);
  return response.data;
};

export const getBinHistory = async (binId: number): Promise<BinHistory> => {
  const response = await api.get<BinHistory>(`/bins/${binId}/history`);
  return response.data;
};

export const updateBin = async (binId: number, updateData: BinUpdate): Promise<Bin> => {
  const response = await api.patch<Bin>(`/bins/${binId}`, updateData);
  return response.data;
};

export const getBinLatestImageUrl = (binId: number): string => {
  return `${API_URL}/bins/${binId}/latest-image`;
};

// Snapshot API calls
export const getBinSnapshots = async (binId: number, limit?: number): Promise<Snapshot[]> => {
  const url = limit !== undefined 
    ? `${API_URL}/bins/${binId}/snapshots?limit=${limit}` 
    : `${API_URL}/bins/${binId}/snapshots`;
  const response = await api.get<Snapshot[]>(url);
  return response.data;
};

export const getSnapshot = async (binId: number, snapshotId: number): Promise<Snapshot> => {
  const response = await api.get<Snapshot>(`/bins/${binId}/snapshots/${snapshotId}`);
  return response.data;
};

// AI Analysis API calls
export const getAIAnalysis = async (
  binId: number,
  timeframe: string = 'all_time',
  statsData?: any
): Promise<{ analysis: string }> => {
  const requestData = {
    time_range: timeframe,
    sister_school_data: statsData?.sisterSchool || null,
  };
  
  const response = await api.post<{ analysis: string }>(
    `/bins/${binId}/ai-analysis`,
    requestData
  );
  
  return response.data;
};

// Sister School API calls
export const addSisterSchool = async (schoolId: number, username: string): Promise<School> => {
  const response = await api.post<School>(
    `/schools/${schoolId}/sister-schools`, 
    { sister_school_username: username }
  );
  return response.data;
};

export const getSisterSchools = async (schoolId: number): Promise<SisterSchool[]> => {
  const response = await api.get<SisterSchool[]>(`/schools/${schoolId}/sister-schools`);
  return response.data;
};

export const removeSisterSchool = async (schoolId: number, sisterSchoolId: number): Promise<void> => {
  await api.delete(`/schools/${schoolId}/sister-schools/${sisterSchoolId}`);
}; 