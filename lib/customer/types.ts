export interface CustomerListing {
  id: string;
  title: string;
  description: string;
  price: number;
  area: string;
  size: number;
  roomType: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  address: string;
  buildingId: string;
  buildingName: string;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  yearBuilt: number | null;
  imageUrl: string;
  companyId: string;
}

export interface PublicCompany {
  id: string;
  name: string;
  domain: string | null;
  phone: string | null;
  address: string | null;
}
