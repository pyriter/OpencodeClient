import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '@/theme';
import { listProviders } from '@/api/sessions';
import type { ModelRef } from '@/api/types';

type Props = {
  visible: boolean;
  current: ModelRef | null;
  onClose: () => void;
  onPick: (m: ModelRef) => void;
};

export function ModelPickerSheet({ visible, current, onClose, onPick }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['providers'],
    queryFn: listProviders,
    enabled: visible,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select model</Text>
          {isLoading && (
            <View style={styles.center}>
              <ActivityIndicator color={colors.accent} />
            </View>
          )}
          {!!error && (
            <Text style={styles.error}>
              {(error as Error).message ?? 'Failed to load providers'}
            </Text>
          )}
          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            {data?.providers?.map((p) => (
              <View key={p.id} style={styles.providerBlock}>
                <Text style={styles.providerLabel}>{p.name ?? p.id}</Text>
                {Object.values(p.models ?? {}).map((m) => {
                  const isCurrent =
                    current?.providerID === p.id && current?.modelID === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      style={[styles.model, isCurrent && styles.modelCurrent]}
                      onPress={() => {
                        onPick({ providerID: p.id, modelID: m.id });
                        onClose();
                      }}
                    >
                      <Text style={styles.modelId}>{m.id}</Text>
                      {!!m.name && m.name !== m.id && (
                        <Text style={styles.modelName}>{m.name}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '80%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  scroll: { flexGrow: 0 },
  center: { padding: spacing.lg, alignItems: 'center' },
  error: { color: colors.error, padding: spacing.sm },
  providerBlock: { marginBottom: spacing.md },
  providerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  model: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bgInput,
    marginBottom: 4,
  },
  modelCurrent: { borderWidth: 1, borderColor: colors.accent },
  modelId: { color: colors.text, fontFamily: font.mono, fontSize: 13 },
  modelName: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
