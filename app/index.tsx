import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Deck, loadDecks, saveDecks } from '../utils/storage';

const TEAL = '#1D9E75';
const TEAL_BG = '#E8F5F0';
const ORANGE = '#E8924A';
const ORANGE_BG = '#FEF3EA';
const PURPLE = '#9B8FD4';
const PURPLE_BG = '#F0EEF9';
const GRAY = '#888888';
const BORDER = '#E0E0E0';

function getProgressColor(p: number) {
  if (p >= 75) return TEAL;
  if (p >= 40) return ORANGE;
  return PURPLE;
}

function getProgressBg(p: number) {
  if (p >= 75) return TEAL_BG;
  if (p >= 40) return ORANGE_BG;
  return PURPLE_BG;
}

function getLastStudiedLabel(lastStudied: string | null): string {
  if (!lastStudied) return 'Not started';
  const diff = Math.floor(
    (Date.now() - new Date(lastStudied).getTime()) / 86400000
  );
  if (diff === 0) return 'Studied today';
  if (diff === 1) return 'Studied yesterday';
  return `${diff} days ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [decks, setDecks] = useState<Deck[]>([]);

  // Deck action sheet
  const [deckAction, setDeckAction] = useState<string | null>(null);

  // Delete deck
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  // Edit deck name
  const [deckToEdit, setDeckToEdit] = useState<string | null>(null);
  const [editDeckName, setEditDeckName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadDecks().then(setDecks);
    }, [])
  );

  async function confirmDeleteDeck() {
    if (!deckToDelete) return;
    const updated = decks.filter((d) => d.id !== deckToDelete);
    await saveDecks(updated);
    setDecks(updated);
    setDeckToDelete(null);
  }

  function openEditDeckName(deckId: string) {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    setDeckToEdit(deckId);
    setEditDeckName(deck.name);
    setDeckAction(null);
  }

  async function saveEditDeckName() {
    if (!deckToEdit) return;
    const name = editDeckName.trim();
    if (!name) return;
    const updated = decks.map((d) => (d.id === deckToEdit ? { ...d, name } : d));
    await saveDecks(updated);
    setDecks(updated);
    setDeckToEdit(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Flashcards</Text>
          <Text style={styles.subtitle}>Study Wisely</Text>
        </View>

        {decks.length === 0 ? (
          <EmptyState />
        ) : (
          <DeckList
            decks={decks}
            onPress={(id) => router.push(`/deck/${id}`)}
            onLongPress={(id) => setDeckAction(id)}
          />
        )}
      </ScrollView>

      {/* Deck action sheet (Edit name / Delete) */}
      <Modal
        visible={!!deckAction}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setDeckAction(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setDeckAction(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.actionSheetLabel}>
              {decks.find((d) => d.id === deckAction)?.name ?? ''}
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                if (deckAction) openEditDeckName(deckAction);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnText}>Edit name</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setDeckToDelete(deckAction);
                setDeckAction(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionBtnText, { color: '#E85050' }]}>Delete deck</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 8 }]}
              onPress={() => setDeckAction(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionBtnText, { color: GRAY }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit deck name popup */}
      <Modal
        visible={!!deckToEdit}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setDeckToEdit(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setDeckToEdit(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.editPopupTitle}>RENAME DECK</Text>
            <Text style={styles.editFieldLabel}>DECK NAME</Text>
            <TextInput
              style={styles.editInput}
              value={editDeckName}
              onChangeText={setEditDeckName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveEditDeckName}
            />
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeckToEdit(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !editDeckName.trim() && { opacity: 0.45 }]}
                onPress={saveEditDeckName}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete deck confirmation */}
      <Modal
        visible={!!deckToDelete}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setDeckToDelete(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setDeckToDelete(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Delete this deck?</Text>
            <Text style={styles.popupSubtitle}>
              This will permanently remove the deck and all its cards.
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeckToDelete(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={confirmDeleteDeck}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/create-deck')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.cardBack} />
        <View style={styles.cardFront} />
      </View>

      <Text style={styles.emptyTitle}>No decks yet</Text>
      <Text style={styles.emptyDesc}>
        Tap the + button to create your first deck and start studying.
      </Text>

      {/* 3-step boxes */}
      <View style={styles.stepsRow}>
        {[
          { num: '01', label: 'Create a\ndeck' },
          { num: '02', label: 'Add your\ncards' },
          { num: '03', label: 'Study!' },
        ].map((step) => (
          <View key={step.num} style={styles.stepBox}>
            <Text style={styles.stepNum}>{step.num}</Text>
            <Text style={styles.stepLabel}>{step.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DeckList({
  decks,
  onPress,
  onLongPress,
}: {
  decks: Deck[];
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}) {
  return (
    <View style={styles.deckListContainer}>
      <Text style={styles.sectionLabel}>MY DECKS</Text>
      {decks.map((deck) => {
        const color = getProgressColor(deck.progress);
        const bgColor = getProgressBg(deck.progress);
        const label = getLastStudiedLabel(deck.lastStudied);

        return (
          <TouchableOpacity
            key={deck.id}
            style={styles.deckCard}
            onPress={() => onPress(deck.id)}
            onLongPress={() => onLongPress(deck.id)}
            activeOpacity={0.8}
          >
            <View style={styles.deckCardTop}>
              <Text style={styles.deckName}>{deck.name}</Text>
              <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color }]}>
                  {deck.progress}%
                </Text>
              </View>
            </View>
            <Text style={styles.deckMeta}>
              {deck.cards.length} cards · {label}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${deck.progress}%` as any, backgroundColor: color },
                ]}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: TEAL,
    fontWeight: '500',
    marginTop: 2,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: TEAL_BG,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardBack: {
    position: 'absolute',
    width: 44,
    height: 30,
    backgroundColor: TEAL,
    borderRadius: 6,
    opacity: 0.4,
    transform: [{ rotate: '-8deg' }, { translateY: -4 }],
  },
  cardFront: {
    width: 44,
    height: 30,
    backgroundColor: TEAL,
    borderRadius: 6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 260,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  stepBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  stepNum: {
    fontSize: 15,
    fontWeight: '700',
    color: TEAL,
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Deck list
  deckListContainer: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  deckCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F5F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  deckCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deckMeta: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '400',
  },

  // Action sheet
  actionSheetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY,
    marginBottom: 16,
  },
  actionBtn: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  actionDivider: {
    height: 1,
    backgroundColor: BORDER,
  },

  // Edit deck name
  editPopupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  editFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  editInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 48,
  },

  // Delete confirmation modal
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
  },
  popupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  popupSubtitle: {
    fontSize: 14,
    color: GRAY,
    lineHeight: 20,
    marginBottom: 24,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#E85050',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
