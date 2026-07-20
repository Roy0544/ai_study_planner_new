"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase-server";

// ─── Fetch All Shared Documents ─────────────────────────────────────────────
export async function fetchSharedDocuments({ category = "All", type = "all", search = "", sortBy = "recent" } = {}) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    // Select document and join uploader info from profiles
    let query = supabase
      .from("shared_documents")
      .select(`
        id,
        title,
        course,
        category,
        type,
        file_type,
        file_size,
        file_url,
        file_path,
        description,
        upvotes_count,
        downloads_count,
        created_at,
        user_id,
        uploader:profiles!shared_documents_user_id_fkey(id, full_name, email)
      `);

    // Apply Search Filter
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,course.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply Category Filter
    if (category !== "All") {
      query = query.eq("category", category);
    }

    // Apply Document Type Filter
    if (type !== "all" && type !== "my-uploads") {
      if (type === "notes") {
        query = query.eq("type", "Notes");
      } else if (type === "papers") {
        query = query.eq("type", "Exam Paper");
      }
    }

    // Apply My Uploads Filter
    if (type === "my-uploads") {
      query = query.eq("user_id", user.id);
    }

    // Apply Sorting
    if (sortBy === "recent") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "downloads") {
      query = query.order("downloads_count", { ascending: false });
    } else if (sortBy === "ratings") {
      query = query.order("upvotes_count", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    // Check which documents have been upvoted by the current user
    const { data: userUpvotes, error: upvoteError } = await supabase
      .from("document_upvotes")
      .select("document_id")
      .eq("user_id", user.id);

    if (upvoteError) throw upvoteError;

    const upvotedSet = new Set(userUpvotes.map(v => v.document_id));

    // Map profile data to match original frontend uploader structure
    const formattedData = data.map(doc => ({
      ...doc,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      upvotes: doc.upvotes_count,
      downloads: doc.downloads_count,
      upvoted: upvotedSet.has(doc.id),
      uploader: {
        name: doc.uploader?.full_name || doc.uploader?.email?.split("@")[0] || "Unknown",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.uploader?.full_name || "User"}`
      }
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Failed to get shared documents:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Fetch Document Requests Board ──────────────────────────────────────────
export async function fetchDocumentRequests() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("document_requests")
      .select(`
        *,
        requester:profiles!document_requests_user_id_fkey(id, full_name, email)
      `)
      .order("upvotes_count", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Check which requests have been upvoted by the current user
    const { data: userUpvotes, error: upvoteError } = await supabase
      .from("request_upvotes")
      .select("request_id")
      .eq("user_id", user.id);

    if (upvoteError) throw upvoteError;

    const upvotedSet = new Set(userUpvotes.map(v => v.request_id));

    const formattedData = data.map(req => ({
      ...req,
      upvotes: req.upvotes_count,
      upvoted: upvotedSet.has(req.id),
      requestedBy: req.requester?.full_name || req.requester?.email?.split("@")[0] || "Unknown"
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Failed to fetch document requests:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Share / Upload a Document ──────────────────────────────────────────────
export async function shareDocument(documentData) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("shared_documents")
      .insert({
        user_id: user.id,
        title: documentData.title,
        course: documentData.course,
        category: documentData.category,
        type: documentData.type,
        year: documentData.year,
        semester: documentData.semester,
        file_url: documentData.fileUrl,
        file_path: documentData.filePath,
        file_size: documentData.fileSize,
        file_type: documentData.fileType,
        description: documentData.description,
        downloads_count: 0,
        upvotes_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/share");
    return { success: true, data };
  } catch (error) {
    console.error("Failed to share document:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Create a Document Request ───────────────────────────────────────────────
export async function createDocumentRequest(requestData) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("document_requests")
      .insert({
        user_id: user.id,
        title: requestData.title,
        course: requestData.course,
        category: requestData.category,
        status: "Open"
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/share");
    return { success: true, data };
  } catch (error) {
    console.error("Failed to create request:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Toggle Document Upvote ──────────────────────────────────────────────────
export async function toggleUpvoteDocument(documentId) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    // 1. Check if vote already exists
    const { data: existing, error: fetchError } = await supabase
      .from("document_upvotes")
      .select("document_id")
      .eq("user_id", user.id)
      .eq("document_id", documentId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let upvoted = false;

    if (existing) {
      // Remove upvote
      const { error: deleteError } = await supabase
        .from("document_upvotes")
        .delete()
        .eq("user_id", user.id)
        .eq("document_id", documentId);

      if (deleteError) throw deleteError;
      upvoted = false;
    } else {
      // Add upvote
      const { error: insertError } = await supabase
        .from("document_upvotes")
        .insert({
          user_id: user.id,
          document_id: documentId
        });

      if (insertError) throw insertError;
      upvoted = true;
    }

    // Fetch the updated upvote count directly from the DB
    const { data: doc, error: docError } = await supabase
      .from("shared_documents")
      .select("upvotes_count")
      .eq("id", documentId)
      .single();

    if (docError) throw docError;

    revalidatePath("/dashboard/share");
    return { success: true, upvoted, upvotesCount: doc.upvotes_count };
  } catch (error) {
    console.error("Failed to toggle upvote on document:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Toggle Request Upvote ───────────────────────────────────────────────────
export async function toggleUpvoteRequest(requestId) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data: existing, error: fetchError } = await supabase
      .from("request_upvotes")
      .select("request_id")
      .eq("user_id", user.id)
      .eq("request_id", requestId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let upvoted = false;

    if (existing) {
      // Remove upvote
      const { error: deleteError } = await supabase
        .from("request_upvotes")
        .delete()
        .eq("user_id", user.id)
        .eq("request_id", requestId);

      if (deleteError) throw deleteError;
      upvoted = false;
    } else {
      // Add upvote
      const { error: insertError } = await supabase
        .from("request_upvotes")
        .insert({
          user_id: user.id,
          request_id: requestId
        });

      if (insertError) throw insertError;
      upvoted = true;
    }

    // Fetch updated upvote count
    const { data: req, error: reqError } = await supabase
      .from("document_requests")
      .select("upvotes_count")
      .eq("id", requestId)
      .single();

    if (reqError) throw reqError;

    revalidatePath("/dashboard/share");
    return { success: true, upvoted, upvotesCount: req.upvotes_count };
  } catch (error) {
    console.error("Failed to toggle upvote on request:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Record Document Download ───────────────────────────────────────────────
export async function incrementDownloadCount(documentId) {
  try {
    const supabase = getSupabaseAdminClient();
    
    // Fetch current download count
    const { data: doc, error: fetchError } = await supabase
      .from("shared_documents")
      .select("downloads_count")
      .eq("id", documentId)
      .single();

    if (fetchError) throw fetchError;

    const currentCount = doc?.downloads_count || 0;

    // Increment downloads count
    const { error: updateError } = await supabase
      .from("shared_documents")
      .update({ downloads_count: currentCount + 1 })
      .eq("id", documentId);

    if (updateError) throw updateError;

    revalidatePath("/dashboard/share");
    return { success: true, downloadsCount: currentCount + 1 };
  } catch (error) {
    console.error("Failed to increment download count:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Fulfill Document Request ────────────────────────────────────────────────
export async function fulfillDocumentRequest(requestId, documentData) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    // 1. Share the document
    const shareResult = await shareDocument(documentData);
    if (!shareResult.success) throw new Error(shareResult.error);

    // 2. Delete the request from the board now that it is fulfilled
    const { error: deleteError } = await supabase
      .from("document_requests")
      .delete()
      .eq("id", requestId);

    if (deleteError) throw deleteError;

    revalidatePath("/dashboard/share");
    return { success: true, document: shareResult.data };
  } catch (error) {
    console.error("Failed to fulfill request:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Fetch Shared Document by ID ─────────────────────────────────────────────
export async function fetchSharedDocumentById(documentId) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("shared_documents")
      .select(`
        id,
        title,
        course,
        category,
        type,
        file_type,
        file_size,
        description,
        file_url,
        file_path,
        upvotes_count,
        downloads_count,
        created_at,
        user_id,
        uploader:profiles!shared_documents_user_id_fkey(id, full_name, email)
      `)
      .eq("id", documentId)
      .single();

    if (error) throw error;

    // Check if upvoted by the current user
    const { data: hasUpvote } = await supabase
      .from("document_upvotes")
      .select("document_id")
      .eq("user_id", user.id)
      .eq("document_id", documentId)
      .maybeSingle();

    const formattedDoc = {
      ...data,
      fileType: data.file_type,
      fileSize: data.file_size,
      fileUrl: data.file_url,
      upvotes: data.upvotes_count,
      downloads: data.downloads_count,
      upvoted: !!hasUpvote,
      uploader: {
        name: data.uploader?.full_name || data.uploader?.email?.split("@")[0] || "Unknown",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.uploader?.full_name || "User"}`
      }
    };

    return { success: true, data: formattedDoc };
  } catch (error) {
    console.error("Failed to fetch document by ID:", error.message);
    return { success: false, error: error.message };
  }
}
