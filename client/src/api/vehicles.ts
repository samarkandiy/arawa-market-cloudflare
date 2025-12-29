import apiClient from './client';
import { Vehicle, VehiclePage, VehicleFilters } from './types';

export const getVehicles = async (filters: Partial<VehicleFilters> = {}): Promise<VehiclePage> => {
  const params = {
    page: filters.page || 1,
    pageSize: filters.pageSize || 12,
    ...filters,
  };
  const response = await apiClient.get<any>('/vehicles', { params });
  
  // Transform API response to match VehiclePage interface
  return {
    vehicles: response.data.vehicles || [],
    totalCount: response.data.pagination?.total || 0,
    page: response.data.pagination?.page || 1,
    pageSize: response.data.pagination?.limit || 12,
  };
};

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
  return response.data;
};

export const searchVehicles = async (query: string): Promise<Vehicle[]> => {
  const response = await apiClient.get<Vehicle[]>('/vehicles/search', {
    params: { q: query },
  });
  return response.data;
};

export const getRelatedVehicles = async (vehicleId: number, limit: number = 4): Promise<Vehicle[]> => {
  const response = await apiClient.get<Vehicle[]>(`/vehicles/${vehicleId}/related`, {
    params: { limit },
  });
  return response.data;
};
