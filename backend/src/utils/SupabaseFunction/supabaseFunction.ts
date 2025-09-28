import supabase from "../../config/supabase";

export async function getSignedUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}