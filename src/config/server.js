"use server"
import { getSupabaseServerClient } from "@/lib/supabase-server";

// export async function createStudySet(formData) {
//   const supabase = await getSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) {
//     throw new Error("User not authenticated");
//   }

//   const { data, error } = await supabase
//     .from('study_sets')
//     .insert({
//       title: formData.get('title'),
//       description: formData.get('description'),
//       user_id: user.id
//     })
//     .select()
//     .single();

//   if (error) {
//     console.error('Error creating study set:', error.message);
//     throw new Error('Failed to create study set');
//   }
//   return { success: true, data };
// }

export async function uploadFile(fileData, fileName) {
  const supabase = await getSupabaseServerClient();
  
  // Expecting fileData as a Buffer or Uint8Array (serializable)
  const { data, error } = await supabase.storage
    .from('study-materials')
    .upload(`public/${fileName}`, fileData, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading file:', error.message);
    throw new Error('Failed to upload file');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('study-materials')
    .getPublicUrl(`public/${fileName}`);
    
  return { success: true, url: publicUrl };
}
