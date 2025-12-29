import apiClient from './client';
import { InquiryInput } from './types';

export const submitInquiry = async (inquiry: InquiryInput): Promise<void> => {
  await apiClient.post('/inquiries', inquiry);
};
