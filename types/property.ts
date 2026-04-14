export interface ZoneOption {
  id: string;
  name: string;
  city?: string;
  description?: string;
}

export interface PropertyItem {
  id: string;
  flat_number: string;
  size: number;
  price: number;
  type: "Rent" | "Sale" | string;
  status: string;
  floor: number;
  bedrooms?: number;
  bathrooms?: number;
  image?: string;
  availability_date?: string;
  buildingName?: string;
  buildingAddress?: string;
  plotNumber?: string;
  blockName?: string;
  zoneName?: string;
  zoneId?: string;
}
