"use server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { parseOffice } from "officeparser";
import { deductCredits, refundCredits } from "./billing";
import { checkRateLimit } from "../lib/rate-limiter";

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing.');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name, options) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}

async function getGeminiFilePart( fileUrl  ) {
  if (!fileUrl) return null;
  console.log("Attempting to fetch file for AI from URL:", fileUrl);
  
  try {
    let buffer;
    let mimeType;
    
    const response = await fetch(fileUrl);
    
    if (response.ok) {
      buffer = await response.arrayBuffer();
      mimeType = response.headers.get('content-type');
      console.log("Fetch successful. Initial MIME type:", mimeType);
    } else {
      console.error(`Fetch failed with status: ${response.status} ${response.statusText}`);
      console.log("Attempting fallback download via Supabase SDK...");
      const supabase = await getSupabaseServerClient();
      
      const urlParts = fileUrl.split('/study-materials/');
      if (urlParts.length < 2) throw new Error("Could not parse storage path from URL");
      
      const filePath = urlParts[1];
      const { data, error } = await supabase.storage
        .from('study-materials')
        .download(filePath);
        
      if (error) throw error;
      
      buffer = await data.arrayBuffer();
      mimeType = data.type;
      console.log("Fallback download successful. Initial MIME type:", mimeType);
    }

    // Fix generic or missing mime types
    if (!mimeType || mimeType === 'application/octet-stream') {
      const urlLower = fileUrl.toLowerCase();
      if (urlLower.includes('.pdf')) mimeType = 'application/pdf';
      else if (urlLower.includes('.png')) mimeType = 'image/png';
      else if (urlLower.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
      else if (urlLower.includes('.webp')) mimeType = 'image/webp';
      else if (urlLower.includes('.txt')) mimeType = 'text/plain';
      else mimeType = 'application/pdf'; // fallback
    }

    const base64Data = Buffer.from(buffer).toString("base64");
    console.log("File converted to base64 successfully, final MIME type:", mimeType, "length:", base64Data.length);
    
    return {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };
  } catch (error) {
    console.error("Error fetching file for AI:", error.message);
    return null;
  }
}

async function extractTextFromOfficeFile(fileUrl) {
  if (!fileUrl) return "";
  console.log("Attempting to extract text from Office file:", fileUrl);
  
  try {
    let buffer;
    const response = await fetch(fileUrl);
    
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log("Fetch successful for Office file. Buffer size:", buffer.length);
    } else {
      console.log("Direct fetch failed for Office file, trying Supabase storage download fallback...");
      const supabase = await getSupabaseServerClient();
      
      const urlParts = fileUrl.split('/study-materials/');
      if (urlParts.length < 2) throw new Error("Could not parse storage path from URL");
      
      const filePath = urlParts[1];
      const { data, error } = await supabase.storage
        .from('study-materials')
        .download(filePath);
        
      if (error) throw error;
      
      const arrayBuffer = await data.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log("Fallback download successful for Office file. Buffer size:", buffer.length);
    }

    const urlLower = fileUrl.toLowerCase();
    let fileType = undefined;
    if (urlLower.includes('.docx')) fileType = 'docx';
    else if (urlLower.includes('.pptx')) fileType = 'pptx';
    else if (urlLower.includes('.xlsx')) fileType = 'xlsx';

    console.log("Parsing Office file using officeparser with fileType hint:", fileType);
    const ast = await parseOffice(buffer, fileType ? { fileType } : undefined);
    const text = typeof ast.toText === 'function' ? ast.toText() : (ast.text || ast.content || "");
    console.log("Office text extraction successful. Extracted text length:", text?.length);
    return text;
  } catch (error) {
    console.error("Error extracting text from Office file:", error.message);
    throw new Error(`Failed to extract text from Office file: ${error.message}`);
  }
}

export async function generateStudySets(content, fileUrl) {
  const rateLimit = await checkRateLimit();
  if (rateLimit.limited) {
    return { success: false, error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.` };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables");
    return { success: false, error: "API Key missing" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log("Starting AI generation. Content length:", content?.length);
  
  const SYSTEM_PROMPT = `You are an elite academic synthesizer. Your task is to transform source material into a HIGHLY DETAILED, comprehensive, and ultra-structured study guide. 

  CORE GOAL: Cover 100% of the topics, concepts, and sub-points mentioned in the source. Do not skip details for the sake of brevity. If the source is long, your output should be appropriately long and thorough.

  For the 'summary' field, follow these structural rules:
  1. High-Level Summary Card: Start with a clear 3-4 sentence overview of the entire subject wrapped in a Markdown blockquote (>).
  2. Structural Hierarchy: Break the content into many logical sections using ## and ### headers. Every major section MUST start with a relevant emoji.
  3. Depth: For every concept, provide a thorough explanation. Use bold text (**key phrases**) for easier scanning, but ensure the surrounding context is complete.
  4. Multi-Format Elements: Use bullet points for lists, numbered steps for processes, and blockquotes for "Exam Tips" or "Deep Dives".
  5. Technical Vocabulary: Always define complex terms as **Term** — *Comprehensive definition, context, or analogy.*
  6. Completeness: Ensure that every single subheading or distinct idea from the source material is represented as a section in your notes.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title:       { type: "string" },
            description: { type: "string" },
            category:    { type: "string" },
            summary:     { type: "string" },
          },
          required: ["title", "description", "category", "summary"]
        },
        temperature: 0.3 
      }
    });

    const promptParts = [];
    let extractedText = "";

    if (fileUrl) {
      const urlLower = fileUrl.toLowerCase();
      const isOfficeFile = urlLower.includes('.pptx') || urlLower.includes('.docx') || urlLower.includes('.xlsx');
      
      if (isOfficeFile) {
        extractedText = await extractTextFromOfficeFile(fileUrl);
        if (!extractedText) {
          throw new Error("Failed to extract content from the uploaded Office file.");
        }
      } else {
        const filePart = await getGeminiFilePart(fileUrl);
        if (!filePart) {
          throw new Error("Failed to process the uploaded file for AI analysis.");
        }
        promptParts.push(filePart);
      }
    }

    const prompt = `
      Analyze the attached study material and/or the text provided below.
      ${extractedText ? `Extracted material from uploaded document:\n---\n${extractedText}\n---\n` : ""}
      Material: ${content || (extractedText ? "[See extracted material above]" : "[Extract entirely from the attached file.]")}
    `;

    promptParts.push(prompt);

    const result = await model.generateContent(promptParts);
    
    try {
      const data = JSON.parse(result.response.text());
      return { success: true, data };
    } catch (parseError) {
      console.error("JSON parse failed:", parseError);
      return { success: false, error: "Failed to parse AI response" };
    }
  } catch (error) {
    console.error("AI Generation failed:", error);
    return { 
      success: false, 
      error: error.message || "Failed to generate study materials" 
    };
  }
}

export async function createFullStudySet(formData) {
  const text = (formData.get('text') || '').toString();
  const fileUrl = formData.get('fileUrl'); // Received from client upload

  console.log("Starting complete study set creation process...");
   const creditCheck = await deductCredits("study_set");                                                                                            
      if (!creditCheck.success) {                                                                                                                    
        return {                                                                                                                                     
          success: false,                                                                                                                            
          insufficientCredits: true,                                                                                                                 
          error: creditCheck.error // e.g., "You need 2 credits for this action, but you only have X."                                               
        };                                                                                                                                           
      }  

  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required");
    }

    console.log("Authenticated as user:", user.id);

    // 1. Create Material Record FIRST
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .insert({
        input_prompt: text,
        file_url: fileUrl,
        user_id: user.id
      })
      .select()
      .single();

    if (materialError) {
      console.error("Material creation failed:", materialError.message);
      throw materialError;
    }

    console.log("Material saved with ID:", material.id);


    // 2. Generate AI Content using the provided text AND the fileUrl
    const aiResult = await generateStudySets(text, fileUrl);
    if (!aiResult.success) {
      // Cleanup: Optionally delete the material if AI fails
      await supabase.from('materials').delete().eq('id', material.id);
      // Refund credits
      await refundCredits("study_set");
      return aiResult;
    }

    const { title, description, category, summary } = aiResult.data;

    // 3. Create Study Set with reference to material_id
    const { data: studySet, error: studySetError } = await supabase
      .from('study_sets')
      .insert({
        title,
        description,
        category,
        summary,
        material_id: material.id, // Linking back to materials
        user_id: user.id
      })
      .select()
      .single();

    if (studySetError) {
      // Refund credits
      await refundCredits("study_set");
      throw studySetError;
    }

    console.log("Successfully created study set and linked to material.");

    // Limit Check: Automatically clean up oldest study sets if total count > 10
    let setWasDeleted = false;
    try {
      const { data: userSets, error: countError } = await supabase
        .from('study_sets')
        .select('id, material_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!countError && userSets && userSets.length > 10) {
        console.log(`User has ${userSets.length} study sets. Cleaning up oldest to stay under 10 limit...`);
        const setsToDelete = userSets.slice(0, userSets.length - 10);
        setWasDeleted = true;
        for (const setToDelete of setsToDelete) {
          await deleteStudySetInternal(supabase, setToDelete.id, user.id);
        }
      }
    } catch (cleanupError) {
      console.error("Cleanup of oldest sets failed:", cleanupError);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sets");
    return { success: true, id: studySet.id, data: studySet, setWasDeleted };

  } catch (error) {
    console.error("Creation failed:", error.message);
    // Refund credits
    await refundCredits("study_set");
    return { success: false, error: error.message };
    }
}

export async function fetchStudySets() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required");
    }

    const { data, error } = await supabase
      .from('study_sets')
      .select('*, flashcards(cards), quizzes(payload), flowcharts(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch study sets:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to fetch user profile:", error.message);
    return { success: false, error: error.message };
  }
}

export async function fetchStudySetById(id) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required");
    }

    const { data, error } = await supabase
      .from('study_sets')
      .select('*, materials(input_prompt, file_url)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    // Fetch flashcards
    const { data: flashcardsData } = await supabase
      .from('flashcards')
      .select('cards')
      .eq('study_set_id', id)
      .single();

    if (flashcardsData) {
      data.flashcards = flashcardsData.cards;
    }

    // Fetch flowcharts
    const { data: flowchartsData } = await supabase
      .from('flowcharts')
      .select('mermaid_code')
      .eq('study_set_id', id)
      .single();

    if (flowchartsData) {
      data.mindmaps = flowchartsData.mermaid_code;
    }

    // Fetch quiz
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('payload')
      .eq('study_set_id', id)
      .single();

    if (quizData) {
      data.quiz = quizData.payload;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch study set:", error.message);
    return { success: false, error: error.message };
  }
}

export async function generateMindMap(setId, content, fileUrl) {
  const rateLimit = await checkRateLimit();
  if (rateLimit.limited) {
    return { success: false, error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.` };
  }

   const creditCheck = await deductCredits("mindmap");                                                                                            
      if (!creditCheck.success) {                                                                                                                    
        return {                                                                                                                                     
          success: false,                                                                                                                            
          insufficientCredits: true,                                                                                                                 
          error: creditCheck.error // e.g., "You need 2 credits for this action, but you only have X."                                               
        };                                                                                                                                           
      }  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "apiKey is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            mermaid: { type: "string" },
          },
          required: ["mermaid"]
        }
      }
    });

    const promptParts = [];
    let extractedText = "";

    if (fileUrl) {
      const urlLower = fileUrl.toLowerCase();
      const isOfficeFile = urlLower.includes('.pptx') || urlLower.includes('.docx') || urlLower.includes('.xlsx');
      
      if (isOfficeFile) {
        extractedText = await extractTextFromOfficeFile(fileUrl);
        if (!extractedText) {
          throw new Error("Failed to extract content from the uploaded Office file.");
        }
      } else {
        const filePart = await getGeminiFilePart(fileUrl);
        if (filePart) promptParts.push(filePart);
      }
    }

    const prompt = `
      Create a detailed Mermaid.js mindmap diagram for the following study material.
      
      CRITICAL SYNTAX REQUIREMENTS - YOU MUST OBEY THESE EXACTLY:
      1. MUST start with the exact word "mindmap"
      2. The root node must be indented with exactly 2 spaces.
      3. All subsequent child nodes MUST be indented with exactly 2 more spaces than their parent (e.g., 4 spaces, 6 spaces, 8 spaces).
      4. DO NOT use markdown code blocks (\`\`\`). Return ONLY the raw Mermaid syntax.
      5. ALL nodes MUST use the exact format: NodeID["Text Label"]
      6. Do NOT use parentheses (), circle shapes (()), or any other shapes. ALWAYS use square brackets with quotes ["..."].
      
      Example of CORRECT bulletproof formatting:
      mindmap
        root["Central Topic"]
          branch1["Main Idea (1905)"]
            leaf1["Detail A & B"]
            leaf2["Detail, with commas"]
          branch2["Another Idea"]
            leaf3["Final Detail"]
      
      ${extractedText ? `Extracted material from uploaded document:\n---\n${extractedText}\n---\n` : ""}
      Material: ${content || (extractedText ? "[See extracted material above]" : "[Extract entirely from the attached file.]")}
    `;

    promptParts.push(prompt);

    const result = await model.generateContent(promptParts);
    
    let mermaidCode;
    try {
      const data = JSON.parse(result.response.text());
      mermaidCode = data.mermaid;
    } catch (err) {
      console.error("JSON parse failed for mindmap:", err);
      await refundCredits("mindmap");
      return { success: false, error: "Failed to parse mindmap response" };
    }

    const supabase = await getSupabaseServerClient();
    const { data: existingData } = await supabase
      .from('flowcharts')
      .select('id')
      .eq('study_set_id', setId)
      .single();

    let dbResult;
    if (existingData) {
      dbResult = await supabase.from('flowcharts').update({ mermaid_code: mermaidCode }).eq('id', existingData.id);
    } else {
      dbResult = await supabase.from('flowcharts').insert({ study_set_id: setId, mermaid_code: mermaidCode });
    }

    if (dbResult.error) {
      await refundCredits("mindmap");
      throw dbResult.error;
    }
    revalidatePath("/dashboard/sets");
    revalidatePath("/dashboard/workspace");
    return { success: true, data: mermaidCode };
  } catch (error) {
    console.error("Mindmap generation failed:", error);
    await refundCredits("mindmap");
    return { success: false, error: error.message };
  }
}

export async function generateFlashcards(setId, content, fileUrl) {
  const rateLimit = await checkRateLimit();
  if (rateLimit.limited) {
    return { success: false, error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.` };
  }

   const creditCheck = await deductCredits("flashcards");                                                                                            
      if (!creditCheck.success) {                                                                                                                    
        return {                                                                                                                                     
          success: false,                                                                                                                            
          insufficientCredits: true,                                                                                                                 
          error: creditCheck.error // e.g., "You need 2 credits for this action, but you only have X."                                               
        };                                                                                                                                           
      }  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer:   { type: "string" },
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    });

    const promptParts = [];
    let extractedText = "";

    if (fileUrl) {
      const urlLower = fileUrl.toLowerCase();
      const isOfficeFile = urlLower.includes('.pptx') || urlLower.includes('.docx') || urlLower.includes('.xlsx');
      
      if (isOfficeFile) {
        extractedText = await extractTextFromOfficeFile(fileUrl);
        if (!extractedText) {
          throw new Error("Failed to extract content from the uploaded Office file.");
        }
      } else {
        const filePart = await getGeminiFilePart(fileUrl);
        if (filePart) promptParts.push(filePart);
      }
    }

    const prompt = `
      Create 10-15 detailed flashcards for the following material.
      ${extractedText ? `Extracted material from uploaded document:\n---\n${extractedText}\n---\n` : ""}
      Material: ${content || (extractedText ? "[See extracted material above]" : "[Extract from attached file.]")}
    `;

    promptParts.push(prompt);

    const result = await model.generateContent(promptParts);
    
    let flashcards;
    try {
      const data = JSON.parse(result.response.text());
      flashcards = data.flashcards;
    } catch (err) {
      console.error("JSON parse failed for flashcards:", err);
      await refundCredits("flashcards");
      return { success: false, error: "Failed to parse flashcards response" };
    }

    const supabase = await getSupabaseServerClient();
    const { data: existingData } = await supabase.from('flashcards').select('id').eq('study_set_id', setId).single();

    if (existingData) {
      await supabase.from('flashcards').update({ cards: flashcards }).eq('id', existingData.id);
    } else {
      await supabase.from('flashcards').insert({ study_set_id: setId, cards: flashcards });
    }

    revalidatePath("/dashboard/sets");
    revalidatePath("/dashboard/workspace");
    return { success: true, data: flashcards };
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    await refundCredits("flashcards");
    return { success: false, error: error.message };
  }
}

export async function generateQuiz(setId, content, fileUrl) {
  const rateLimit = await checkRateLimit();
  if (rateLimit.limited) {
    return { success: false, error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.` };
  }

   const creditCheck = await deductCredits("quiz");                                                                                            
      if (!creditCheck.success) {                                                                                                                    
        return {                                                                                                                                     
          success: false,                                                                                                                            
          insufficientCredits: true,                                                                                                                 
          error: creditCheck.error // e.g., "You need 2 credits for this action, but you only have X."                                               
        };                                                                                                                                           
      }  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            quiz: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options:  { type: "array", items: { type: "string" } },
                  answer:   { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["question", "options", "answer", "explanation"]
              }
            }
          },
          required: ["quiz"]
        }
      }
    });

    const promptParts = [];
    let extractedText = "";

    if (fileUrl) {
      const urlLower = fileUrl.toLowerCase();
      const isOfficeFile = urlLower.includes('.pptx') || urlLower.includes('.docx') || urlLower.includes('.xlsx');
      
      if (isOfficeFile) {
        extractedText = await extractTextFromOfficeFile(fileUrl);
        if (!extractedText) {
          throw new Error("Failed to extract content from the uploaded Office file.");
        }
      } else {
        const filePart = await getGeminiFilePart(fileUrl);
        if (filePart) promptParts.push(filePart);
      }
    }

    const prompt = `
      Create a 10-question multiple choice quiz.
      ${extractedText ? `Extracted material from uploaded document:\n---\n${extractedText}\n---\n` : ""}
      Material: ${content || (extractedText ? "[See extracted material above]" : "[Extract from attached file.]")}
    `;

    promptParts.push(prompt);

    const result = await model.generateContent(promptParts);
    
    let quiz;
    try {
      const data = JSON.parse(result.response.text());
      quiz = data.quiz;
    } catch (err) {
      console.error("JSON parse failed for quiz:", err);
      await refundCredits("quiz");
      return { success: false, error: "Failed to parse quiz response" };
    }

    const supabase = await getSupabaseServerClient();
    const { data: existingData } = await supabase.from('quizzes').select('id').eq('study_set_id', setId).single();

    if (existingData) {
      await supabase.from('quizzes').update({ payload: quiz }).eq('id', existingData.id);
    } else {
      await supabase.from('quizzes').insert({ study_set_id: setId, payload: quiz });
    }

    revalidatePath("/dashboard/sets");
    revalidatePath("/dashboard/workspace");
    return { success: true, data: quiz };
  } catch (error) {
    console.error("Quiz generation failed:", error);
    await refundCredits("quiz");
    return { success: false, error: error.message };
  }
}

function getStoragePathFromUrl(url, bucketName = 'study-materials') {
  if (!url) return null;
  const matchStr = `/storage/v1/object/public/${bucketName}/`;
  const index = url.indexOf(matchStr);
  if (index !== -1) {
    return url.substring(index + matchStr.length);
  }
  return null;
}

async function deleteStudySetInternal(supabase, id, userId) {
  try {
    // 1. Fetch study set details
    const { data: set, error: fetchError } = await supabase
      .from('study_sets')
      .select('id, material_id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !set) {
      console.log("Study set not found or already deleted:", id);
      return;
    }

    // 2. Fetch material file_url separately to be 100% safe
    let fileUrl = null;
    if (set.material_id) {
      const { data: material } = await supabase
        .from('materials')
        .select('file_url')
        .eq('id', set.material_id)
        .eq('user_id', userId)
        .maybeSingle();
      if (material) {
        fileUrl = material.file_url;
      }
    }

    // 3. Delete study set row (this will cascade delete associated items)
    await supabase
      .from('study_sets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    // 4. Delete file from storage and materials table
    if (set.material_id) {
      if (fileUrl) {
        const storagePath = getStoragePathFromUrl(fileUrl, 'study-materials');
        if (storagePath) {
          console.log("Removing file from storage bucket:", storagePath);
          await supabase.storage.from('study-materials').remove([storagePath]);
        }
      }
      
      // Delete material record
      await supabase
        .from('materials')
        .delete()
        .eq('id', set.material_id)
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error in deleteStudySetInternal:", error);
  }
}

export async function deleteStudySet(id) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) throw new Error("Authentication required");

    await deleteStudySetInternal(supabase, id, user.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sets");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generateQuickNote(question, correctAnswer, content) {
  const rateLimit = await checkRateLimit();
  if (rateLimit.limited) {
    return { success: false, error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.` };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: "API Key missing" };

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Provide a short study note for: Question: "${question}", Correct Answer: "${correctAnswer}". Material: ${content}`;
    const result = await model.generateContent(prompt);
    return { success: true, data: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
