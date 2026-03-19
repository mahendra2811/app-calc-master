import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Ionicons name="help-circle-outline" size={80} color="#9CA3AF" />
      <Text className="mt-6 text-center text-2xl font-bold text-text">
        Page Not Found
      </Text>
      <Text className="mt-3 text-center text-base text-text-secondary">
        The page you are looking for does not exist.
      </Text>
      <Pressable
        onPress={() => router.replace('/')}
        className="mt-8 rounded-btn bg-primary px-8 py-3 active:opacity-80"
      >
        <Text className="text-base font-semibold text-white">Go Home</Text>
      </Pressable>
    </View>
  );
}
