import { BaseEntity, Coordinates, CreatureLocation, Ring } from './common';

export interface BookCreature extends BaseEntity {
  ownerEmail: string;
  ownerSub: string;
  name: string | null;
  coordinates: Coordinates;
  age: number | null;
  creatureType: CreatureType;
  creatureLocation: CreatureLocation;
  attackLevel: number;
  defenseLevel: number;
  ring: Ring | null;
  isYours: boolean;
}

export type CreatureType = 'HUMAN' | 'ELF' | 'HOBBIT';

export interface BookCreatureCreatePayload {
  name: string;
  coordinates: Coordinates;
  age?: number | null;
  creatureType: CreatureType;
  creatureLocation: Omit<CreatureLocation, 'establishmentDate'> & {
    establishmentDate?: string | null;
  };
  attackLevel: number;
  defenseLevel: number;
  ring?: Ring | null;
}

export interface BookCreatureUpdatePayload extends Partial<BookCreatureCreatePayload> {

}

export interface ObjectsPerUserStats {
  userEmail: string;
  objectCount: number;
}

export interface GroupedByCreatureTypeDto {
  creatureType: CreatureType;
  count: number;
}
