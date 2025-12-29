import apiClient from './client';
import { Category } from './types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
};
