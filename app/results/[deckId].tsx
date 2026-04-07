import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getDeckById } from '../../utils/storage';

const TEAL = '#1D9E75';
const TEAL_BG = '#E8F5F0';
const ORANGE = '#E8924A';
const ORANGE_BG = '#FEF3EA';
const RED = '#E85050';
const RED_BG = '#FDEEEE';
const GRAY = '#888888';

export default function ResultsScreen() {
  const router = useRouter();
  const { deckId, gotIt, hazy, forgotten } =
    useLocalSearchParams<{ deckId: string; gotIt: string; hazy: string; forgotten: string }>();

  const [deckName, setDeckName] = useState('');

  useEffect(() => {
    getDeckById(deckId).then((d) => {
      if (d) setDeckName(d.name);
    });
  }, [deckId]);

  const g = parseInt(gotIt ?? '0', 10);
  const h = parseInt(hazy ?? '0', 10);
  const f = parseInt(forgotten ?? '0', 10);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Checkmark icon */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.completeTitle}>Deck complete!</Text>
        <Text style={styles.completeSubtitle}>
          Great job studying {deckName}
        </Text>

        {/* Score row */}
        <View style={styles.scoreRow}>
          <View style={[styles.scoreBox, { backgroundColor: TEAL_BG }]}>
            <Text style={[styles.scoreNum, { color: TEAL }]}>{g}</Text>
            <Text style={[styles.scoreLabel, { color: TEAL }]}>Got it</Text>
          </View>
          <View style={[styles.scoreBox, { backgroundColor: ORANGE_BG }]}>
            <Text style={[styles.scoreNum, { color: ORANGE }]}>{h}</Text>
            <Text style={[styles.scoreLabel, { color: ORANGE }]}>Hazy</Text>
          </View>
          <View style={[styles.scoreBox, { backgroundColor: RED_BG }]}>
            <Text style={[styles.scoreNum, { color: RED }]}>{f}</Text>
            <Text style={[styles.scoreLabel, { color: RED }]}>Forgotten</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace(`/study/${deckId}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Study again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
        >
          <Text style={styles.outlineBtnText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEAL_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkMark: {
    fontSize: 36,
    color: TEAL,
    fontWeight: '700',
    lineHeight: 42,
  },
  completeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 32,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    width: '100%',
  },
  scoreBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  outlineBtnText: {
    color: TEAL,
    fontSize: 16,
    fontWeight: '700',
  },
});
