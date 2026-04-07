import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, loadDecks, saveDecks } from '../utils/storage';

const TEAL = '#1D9E75';
const TEAL_BG = '#E8F5F0';
const RED = '#E85050';
const GRAY = '#888888';
const BORDER = '#E0E0E0';

function Toast({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Text style={styles.toastText}>Voice input coming soon!</Text>
    </Animated.View>
  );
}

export default function AddCardsScreen() {
  const router = useRouter();
  const { deckName, deckId } = useLocalSearchParams<{ deckName: string; deckId?: string }>();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showMicToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setShowToast(false);
    // Defer to next tick so Animated re-triggers if already shown
    setTimeout(() => setShowToast(true), 10);
    toastTimer.current = setTimeout(() => setShowToast(false), 2000);
  }

  function addCard() {
    if (!question.trim() || !answer.trim()) return;
    setCards((prev) => [
      ...prev,
      { id: Date.now().toString(), question: question.trim(), answer: answer.trim() },
    ]);
    setQuestion('');
    setAnswer('');
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function saveDeck() {
    if (cards.length === 0) return;
    const existing = await loadDecks();
    if (deckId) {
      // Adding cards to an existing deck
      const updated = existing.map((d) =>
        d.id === deckId ? { ...d, cards: [...d.cards, ...cards] } : d
      );
      await saveDecks(updated);
      router.back();
    } else {
      // Creating a brand new deck
      const newDeck = {
        id: Date.now().toString(),
        name: deckName ?? 'Untitled',
        cards,
        progress: 0,
        lastStudied: null,
      };
      await saveDecks([...existing, newDeck]);
      router.replace('/');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {deckName}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Question field */}
        <Text style={styles.fieldLabel}>QUESTION</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="What is a verb?"
            placeholderTextColor="#BDBDBD"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity
            style={styles.micBtn}
            onPress={showMicToast}
            activeOpacity={0.7}
          >
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>

        {/* Answer field */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>ANSWER</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Tap mic or type..."
            placeholderTextColor="#BDBDBD"
            value={answer}
            onChangeText={setAnswer}
            multiline
          />
          <TouchableOpacity
            style={styles.micBtn}
            onPress={showMicToast}
            activeOpacity={0.7}
          >
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>

        {/* Cards preview */}
        {cards.length > 0 && (
          <Text style={styles.cardsAdded}>{cards.length} card{cards.length > 1 ? 's' : ''} added</Text>
        )}
        {cards.map((card) => (
          <View key={card.id} style={styles.cardPreview}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardQuestion}>{card.question}</Text>
              <Text style={styles.cardAnswer}>{card.answer}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteCard(card.id)} hitSlop={8}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add another card */}
        <TouchableOpacity
          style={styles.addMoreBtn}
          onPress={addCard}
          activeOpacity={0.7}
        >
          <Text style={styles.addMoreText}>+ Add another card</Text>
        </TouchableOpacity>

        {/* Save deck */}
        <TouchableOpacity
          style={[styles.saveBtn, cards.length === 0 && question.trim() === '' && styles.saveBtnDisabled]}
          onPress={cards.length > 0 ? saveDeck : addCard}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {cards.length > 0 ? 'Save deck' : 'Add card & save'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast visible={showToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backArrow: {
    fontSize: 22,
    color: TEAL,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginHorizontal: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 48,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  micIcon: {
    fontSize: 18,
  },
  cardsAdded: {
    fontSize: 13,
    color: GRAY,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '500',
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL_BG,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardAnswer: {
    fontSize: 13,
    color: GRAY,
    marginTop: 2,
  },
  deleteBtn: {
    fontSize: 14,
    color: RED,
    fontWeight: '600',
    paddingLeft: 8,
  },
  addMoreBtn: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  addMoreText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
