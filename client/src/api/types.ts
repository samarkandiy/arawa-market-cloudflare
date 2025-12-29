export interface Vehicle {
  id: number;
  category: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  engineType: string;
  length?: number;
  width?: number;
  height?: number;
  condition: string;
  features?: string[];
  descriptionJa: string;
  registrationDocument?: string;
  images?: VehicleImage[];
  status: 'available' | 'reserved' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleImage {
  id: number;
  vehicleId: number;
  filename: string;
  url: string;
  thumbnailUrl: string;
  order: number;
  uploadedAt: string;
}

export interface Category {
  id: number;
  nameJa: string;
  nameEn: string;
  slug: string;
  icon?: string;
}

export interface VehicleFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  page: number;
  pageSize: number;
}

export interface VehiclePage {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface InquiryInput {
  vehicleId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  message: string;
  inquiryType: 'phone' | 'email' | 'line';
}

export interface Page {
  id: number;
  slug: string;
  titleJa: string;
  titleEn?: string;
  contentJa: string;
  contentEn?: string;
  metaDescriptionJa?: string;
  metaDescriptionEn?: string;
  featuredImage?: string;
  isPublished: boolean;
  showInNav: boolean;
  createdAt: string;
  updatedAt: string;
}
