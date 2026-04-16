export interface Location {
  main: string;
  place: string;
}

export interface Backpack {
  money: number;
  medals: string[];
  pokeballs: string[];
}

export interface Pokemon {
  tag: number;
  pokemon: string;
  state: string;
  level: number;
  atk: number;
  currentHp: number;
  maxHp: number;
  exp: number;
  moves: string[];
}

export interface FoePokemon {
  pokemon: string;
  state: string;
  level: number;
  atk: number;
  currentHp: number;
  maxHp: number;
  moves: string[];
}

export interface Egg {
  tag: number;
  pokemon: string;
  distanceLeft: number;
}

export interface Pokeball {
  name: string;
  cost: number;
}

export interface Gym {
  city: string;
  leader: Trainer;
  fights: number;
  badge: string;
}

export interface Trainer {
  route: number;
  name: string;
  gender: string;
  money: number;
  pokemon: string;
  defeated: string;
}
