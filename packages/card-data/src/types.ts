export interface Card {
  dbfId: number;
  id: string;
  name: string;
  cardClass: string;
  cost: number;
  type?: string;
  attack?: number;
  health?: number;
  race?: string;
  techLevel?: number;
  mechanics?: string[];
}
