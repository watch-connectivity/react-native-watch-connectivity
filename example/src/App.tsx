import { Text, View, StyleSheet } from 'react-native';
import {
  useReachability,
  usePaired,
  useInstalled,
} from 'react-native-watch-connectivity';

export default function App() {
  const reachable = useReachability();
  const paired = usePaired();
  const installed = useInstalled();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watch Connectivity</Text>
      <Text>Paired: {paired ? 'Yes' : 'No'}</Text>
      <Text>Installed: {installed ? 'Yes' : 'No'}</Text>
      <Text>Reachable: {reachable ? 'Yes' : 'No'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
