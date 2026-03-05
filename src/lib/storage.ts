import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a task completion photo to Supabase Storage.
 * Path: {family_id}/{kid_id}/{task_id}.jpg
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

  const { data: urlData } = supabase.storage
    .from("task-photos")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload an avatar photo to Supabase Storage.
 * Path: {user_id}/avatar.jpg
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

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
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
