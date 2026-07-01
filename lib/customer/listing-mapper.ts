import { PLACEHOLDER_LISTING_IMAGE } from './constants';
import type { CustomerListing } from './types';

type RoomRow = {
  id: string;
  company_id: string | null;
  building_id: string | null;
  code: string;
  floor: number;
  room_type: string | null;
  size: number | null;
  price: number;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  bedrooms: number;
  bathrooms: number;
  description: string | null;
  buildings: {
    id: string;
    name: string;
    area: string;
    address: string | null;
    year_built: number | null;
    image_url: string | null;
    description: string | null;
  } | null;
};

export function mapRoomToListing(room: RoomRow): CustomerListing | null {
  if (!room.company_id) return null;

  const building = room.buildings;
  const buildingName = building?.name ?? 'Tòa nhà';
  const roomType = room.room_type ?? 'Phòng';

  return {
    id: room.id,
    title: `${buildingName} — ${room.code}`,
    description: room.description || building?.description || `${roomType} tại ${building?.area ?? ''}`.trim(),
    price: room.price,
    area: building?.area ?? '',
    size: room.size ?? 0,
    roomType,
    status: room.status,
    address: building?.address ?? building?.area ?? '',
    buildingId: building?.id ?? room.building_id ?? '',
    buildingName,
    bedrooms: room.bedrooms,
    bathrooms: room.bathrooms,
    floor: room.floor,
    yearBuilt: building?.year_built ?? null,
    imageUrl: building?.image_url || PLACEHOLDER_LISTING_IMAGE,
    companyId: room.company_id,
  };
}
