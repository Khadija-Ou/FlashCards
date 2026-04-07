import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Deck, getDeckById } from '../../utils/storage';

const TEAL = '#1D9E75';
const TEAL_BG = '#E8F5F0';
const GRAY = '#888888';
const BORDER = '#E0E0E0';

export default function DeckDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (deckId) getDeckById(deckId).then(setDeck);
    }, [deckId])
  );

  if (!deck) return null;

  return (
    <View style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {deck.name}
        </Text>
        <View style={styles.cardCountBox}>
          <Text style={styles.cardCountNum}>{deck.cards.length}</Text>
          <Text style={styles.cardCountLabel}>cards</Text>
        </View>
      </View>

      {/* Card list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>ALL CARDS</Text>
        {deck.cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardRow}
            onPress={() => setSelectedCard(card)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardQuestion}>{card.question}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push({
              pathname: '/add-cards',
              params: { deckName: deck.name, deckId: deck.id },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ Add cards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.studyBtn}
          onPress={() => router.push(`/study/${deck.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.studyBtnText}>Study</Text>
        </TouchableOpacity>
      </View>

      {/* Card detail popup */}
      <Modal
        visible={!!selectedCard}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setSelectedCard(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelectedCard(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>CARD DETAIL</Text>

            <Text style={styles.popupSectionLabel}>QUESTION</Text>
            <Text style={styles.popupQuestion}>{selectedCard?.question}</Text>

            <View style={styles.divider} />

            <Text style={styles.popupSectionLabel}>ANSWER</Text>
            <View style={styles.answerBox}>
              <Text style={styles.popupAnswer}>{selectedCard?.answer}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedCard(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  backArrow: {
    fontSize: 22,
    color: TEAL,
    fontWeight: '600',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  cardCountBox: {
    alignItems: 'center',
    marginLeft: 12,
    minWidth: 36,
  },
  cardCountNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  cardCountLabel: {
    fontSize: 11,
    color: GRAY,
    fontWeight: '500',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  cardQuestion: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: GRAY,
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: '#fff',
  },
  addBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addBtnText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: '600',
  },
  studyBtn: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  studyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popup: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderCurve: 'continuous',
  } as any,
  popupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  popupSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  popupQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 16,
  },
  answerBox: {
    backgroundColor: TEAL_BG,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  popupAnswer: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    color: TEAL,
    fontWeight: '600',
  },
});
