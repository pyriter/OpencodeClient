import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSettings } from '@/state/settings';
import { colors } from '@/theme';

export default function Index() {
  const { hydrated, serverUrl } = useSettings();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <Redirect href={serverUrl ? '/sessions' : '/settings'} />;
}
