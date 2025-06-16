import { Photo } from './photo';

export interface User {
    id: number;
    username: string;
    knownAs?: string;
    age?: number;
    gender?: string;
    city?: string;
    country?: string;
    photoUrl?: string;
    introduction?: string;
    interests?: string;
    lookingFor?: string;
    token: string;
} 