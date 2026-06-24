export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  area: string;
  size: number;
  roomType: string;
  status: 'available' | 'rented' | 'sold' | 'pending';
  amenities: string[];
  images: string[];
  address: string;
  buildingId: string;
  buildingName: string;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  yearBuilt: number;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  area: string;
  address: string;
  yearBuilt: number;
  totalFloors: number;
  totalRooms: number;
  description: string;
  image: string;
  landlordId?: string;
}

export interface Room {
  id: string;
  code: string;
  buildingId: string;
  buildingName: string;
  area: string;
  floor: number;
  roomType: string;
  size: number;
  price: number;
  status: 'available' | 'rented' | 'sold' | 'pending';
  bedrooms: number;
  bathrooms: number;
  description: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyId: string;
  propertyTitle: string;
  date: string;
  time: string;
  area: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  evidenceImages: string[];
}

export interface Landlord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  propertiesCount: number;
  notes: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Account {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'locked';
  lastLogin: string;
  createdAt: string;
}

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
}

export interface Area {
  id: string;
  name: string;
  description: string;
}
