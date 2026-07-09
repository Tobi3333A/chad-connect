import { Redirect } from 'expo-router';

// TODO: check auth session — redirect to /(auth)/welcome if not logged in
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
