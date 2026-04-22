import { supabase } from '../config/supabase';

/*
  Registers a new user with Supabase Auth.
*/
export const registerUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { user: data.user, error: error?.message };
};

/*
    Logs in an existing user.
*/
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { user: data.user, error: error?.message };
};

/*
  Logs the current user out.
*/
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
};
