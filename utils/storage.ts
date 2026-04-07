import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Card {
  id: string;
  question: string;
  answer: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  progress: number;
  lastStudied: string | null;
}

const STORAGE_KEY = '@flashcards_decks';

export async function loadDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveDecks(decks: Deck[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export async function getDeckById(id: string): Promise<Deck | null> {
  const decks = await loadDecks();
  return decks.find((d) => d.id === id) ?? null;
}

export async function updateDeck(updated: Deck): Promise<void> {
  const decks = await loadDecks();
  const index = decks.findIndex((d) => d.id === updated.id);
  if (index !== -1) {
    decks[index] = updated;
    await saveDecks(decks);
  }
}
