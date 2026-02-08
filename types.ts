
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface MapChunk {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  sources?: { title: string; uri: string }[];
  mapChunks?: MapChunk[];
}

export interface AidCenter {
  name: string;
  location: string;
  type: string;
  contact: string;
}

export interface FloodRisk {
  location: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  recommendation: string;
}
