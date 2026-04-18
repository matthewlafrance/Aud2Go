import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://xwfhbipcqtlkmwsmunzy.supabase.co';
const supabaseAnonKey = 'sb_publishable_v8V7Clg5-M_S2mlW1xZtsg_rxjF0zoK';

// 1. Create a dummy wrapper that protects against SSR crashes
const expoStorageAdapter = {
  getItem: (key) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: expoStorageAdapter, // 2. Plug the wrapper in here
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
