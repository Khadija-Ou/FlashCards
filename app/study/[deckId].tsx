import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Deck, getDeckById, updateDeck } from '../../utils/storage';

const TEAL = '#1D9E75';
const TEAL_BG = '#E8F5F0';
const ORANGE = '#E8924A';
const ORANGE_BG = '#FEF3EA';
const RED = '#E85050';
const RED_BG = '#FDEEEE';
const GRAY = '#888888';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudyScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [shuffled, setShuffled] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Use refs to track counts so handleVerdict always has latest values
  const gotItRef = useRef(0);
  const hazyRef = useRef(0);
  const forgottenRef = useRef(0);

  useEffect(() => {
    getDeckById(deckId).then((d) => {
      if (d) {
        setDeck(d);
        setShuffled(shuffle(d.cards));
      }
    });
  }, [deckId]);

  async function handleVerdict(v: 'gotIt' | 'hazy' | 'forgotten') {
    if (v === 'gotIt') gotItRef.current += 1;
    else if (v === 'hazy') hazyRef.current += 1;
    else forgottenRef.current += 1;

    const isLast = index + 1 >= shuffled.length;

    if (isLast && deck) {
      const g = gotItRef.current;
      const h = hazyRef.current;
      const f = forgottenRef.current;
      const newProgress = Math.round((g / shuffled.length) * 100);
      await updateDeck({
        ...deck,
        progress: newProgress,
        lastStudied: new Date().toISOString(),
      });
      router.replace(`/results/${deckId}?gotIt=${g}&hazy=${h}&forgotten=${f}`);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  if (!deck || shuffled.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const current = shuffled[index];
  const progressPct = (index / shuffled.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {deck.name}
        </Text>
        <Text style={styles.counter}>
          {index + 1} / {shuffled.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
      </View>

      <View style={styles.body}>
        {/* Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => !revealed && setRevealed(true)}
          activeOpacity={revealed ? 1 : 0.85}
        >
          <Text style={styles.cardLabel}>QUESTION</Text>
          <Text style={styles.questionText}>{current.question}</Text>
          {!revealed && (
            <Text style={styles.tapHint}>tap to reveal answer</Text>
          )}
        </TouchableOpacity>

        {/* Answer */}
        {revealed && (
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>Answer</Text>
            <Text style={styles.answerText}>{current.answer}</Text>
          </View>
        )}

        {/* Verdict buttons */}
        {revealed && (
          <View style={styles.verdictRow}>
            <TouchableOpacity
              style={[styles.verdictBtn, styles.forgottenBtn]}
              onPress={() => handleVerdict('forgotten')}
              activeOpacity={0.8}
            >
              <Text style={[styles.verdictText, { color: RED }]}>Forgotten</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.verdictBtn, styles.hazyBtn]}
              onPress={() => handleVerdict('hazy')}
              activeOpacity={0.8}
            >
              <Text style={[styles.verdictText, { color: ORANGE }]}>Hazy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.verdictBtn, styles.gotItBtn]}
              onPress={() => handleVerdict('gotIt')}
              activeOpacity={0.8}
            >
              <Text style={[styles.verdictText, { color: '#fff' }]}>Got it</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: GRAY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backArrow: {
    fontSize: 22,
    color: TEAL,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginHorizontal: 8,
  },
  counter: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: 3,
    backgroundColor: TEAL,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
    minHeight: 160,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 12,
    alignSelf: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 26,
  },
  tapHint: {
    fontSize: 13,
    color: '#BDBDBD',
    fontStyle: 'italic',
    marginTop: 16,
  },
  answerBox: {
    backgroundColor: TEAL_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAL,
    letterSpacing: 1,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
  },
  verdictRow: {
    flexDirection: 'row',
    gap: 10,
  },
  verdictBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  forgottenBtn: {
    borderColor: RED,
    backgroundColor: RED_BG,
  },
  hazyBtn: {
    borderColor: ORANGE,
    backgroundColor: ORANGE_BG,
  },
  gotItBtn: {
    borderColor: TEAL,
    backgroundColor: TEAL,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
