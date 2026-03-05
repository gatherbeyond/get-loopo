import { supabase } from "@/integrations/supabase/client";

/** Default signed URL expiry in seconds (1 hour) */
const SIGNED_URL_EXPIRY = 3600;

/**
 * Upload a task completion photo to Supabase Storage.
 * Path: {family_id}/{kid_id}/{task_id}.jpg
 * Returns a signed URL (expires in 1 hour).
 */
export async function uploadTaskPhoto(
  file: File,
  familyId: string,
  kidId: string,
  taskId: string
): Promise<string> {
  const filePath = `${familyId}/${kidId}/${taskId}.jpg`;

  const { error } = await supabase.storage
    .from("task-photos")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from("task-photos")
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

  if (signError || !data?.signedUrl) throw signError ?? new Error("Failed to create signed URL");

  return data.signedUrl;
}

/**
 * Upload an avatar photo to Supabase Storage.
 * Path: {user_id}/avatar.jpg
 * Returns a signed URL (expires in 1 hour).
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  const filePath = `${userId}/avatar.jpg`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from("avatars")
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

  if (signError || !data?.signedUrl) throw signError ?? new Error("Failed to create signed URL");

  return data.signedUrl;
}

/**
 * Get a fresh signed URL for a task photo.
 * Use this to refresh expired URLs when displaying photos.
 */
export async function getTaskPhotoUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("task-photos")
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) throw error ?? new Error("Failed to create signed URL");
  return data.signedUrl;
}

/**
 * Get a fresh signed URL for an avatar.
 * Use this to refresh expired URLs when displaying avatars.
 */
export async function getAvatarUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) throw error ?? new Error("Failed to create signed URL");
  return data.signedUrl;
}

/**
 * Save the task photo URL to the tasks table.
 */
export async function saveTaskPhotoUrl(taskId: string, photoUrl: string) {
  const { error } = await supabase
    .from("tasks")
    .update({ photo_url: photoUrl })
    .eq("id", taskId);

  if (error) throw error;
}

/**
 * Save the avatar URL to the profiles table.
 */
export async function saveAvatarUrl(userId: string, avatarUrl: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) throw error;
}
