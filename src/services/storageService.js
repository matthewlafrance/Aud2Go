// src/services/storageService.js
import { supabase } from '../config/supabase';

/**
 * Uploads an audio file to Supabase Storage and saves metadata to Postgres.
 */
export const uploadAudioFile = async (userId, fileUri, fileName) => {
  try {
    console.log("1. Converting local file to ArrayBuffer...");
    const response = await fetch(fileUri);
    const arrayBuffer = await response.arrayBuffer();

    console.log("2. Uploading to Supabase Storage...");
    // We add Date.now() to ensure every file has a unique path, even if names match
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, arrayBuffer, {
        contentType: 'audio/mpeg', // Generic audio MIME type
      });

    if (uploadError) throw uploadError;

    console.log("3. Retrieving public URL...");
    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath);
    
    const downloadUrl = publicUrlData.publicUrl;

    console.log("4. Saving metadata to Postgres...");
    const { error: dbError } = await supabase
      .from('audio_files')
      .insert([
        {
          user_id: userId,
          file_name: fileName,
          download_url: downloadUrl,
        }
      ]);

    if (dbError) throw dbError;

    console.log("Upload Pipeline Complete!");
    return { success: true, downloadUrl, error: null };

  } catch (error) {
    console.error("UPLOAD ERROR CAUGHT:", error);
    return { success: false, downloadUrl: null, error: error.message };
  }
};

/**
 * Fetches all audio files uploaded by a specific user from Postgres.
 */
export const getUserAudioFiles = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, files: data, error: null };
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return { success: false, files: [], error: error.message };
  }
};
