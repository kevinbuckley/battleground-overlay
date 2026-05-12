export interface Card {
  dbfId: number;
  id: string;
  name: string;
  cardClass: string;
  cost: number;
  attack?: number;
  health?: number;
  race?: string;
  techLevel?: number;
  mechanics?: string[];
}
