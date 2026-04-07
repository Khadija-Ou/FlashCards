import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const TEAL = '#1D9E75';
const GRAY = '#888888';

export default function CreateDeckScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  function handleCreate() {
    if (!name.trim()) return;
    router.replace(`/add-cards?deckName=${encodeURIComponent(name.trim())}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New deck</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Form */}
        <Text style={styles.fieldLabel}>DECK NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. English Vocabulary"
          placeholderTextColor="#BDBDBD"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />

        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim()}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Create deck</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 24,
  },
  button: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
