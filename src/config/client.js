"use client"
import { createBrowserClient } from "@supabase/ssr";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (typeof window !== 'undefined') {
  console.log('Supabase Connection Status:', !!supabaseUrl && !!supabaseAnonKey ? 'Ready' : 'Configuration Missing');
}

const client = createBrowserClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);


export const handleGoogleLogin =async()=>{
    try {
        const { error } = await client.auth.signInWithOAuth({
            provider:'google',
            options:{
                redirectTo:`${window.location.origin}/dashboard`
            }
        })
        if(error) throw error;
     } catch (error) {
        console.error('Error during Google login:', error.message);
    }
}

export const handleEmailLogin = async (email, password) => {
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error during email login:', error.message);
        return { data: null, error };
    }
}

export const handleEmailSignUp = async (email, password) => {
    try {
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error during email signup:', error.message);
        return { data: null, error };
    }
}

export const handleLogout = async () => {
    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        window.location.href = "/";
    } catch (error) {
        console.error('Error during logout:', error.message);
    }
}
export const uploadHandler = async (file) => {
    try {
        const { data: { user }, error: authError } = await client.auth.getUser();
        if (authError || !user) throw new Error("Authentication required");

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error: uploadError } = await client.storage
            .from('study-materials')
            .upload(filePath, file);
            
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = client.storage
          .from('study-materials')
          .getPublicUrl(filePath);
    
        return { success: true, url: publicUrl, path: filePath };
    } catch (error) {
        console.error("Upload failed:", error.message);
        return { success: false, error: error.message };
    }
}


  export default client