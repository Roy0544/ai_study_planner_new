"use server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

async function getGeminiFilePart(fileUrl) {
  if (!fileUrl) return null;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch file");
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'application/pdf'; // fallback
    return {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType
      }
    };
  } catch (error) {
    console.error("Error fetching file for AI:", error);
    return null;
  }
}

export async function generateStudySets(content) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables");
    return { success: false, error: "API Key missing" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log("Starting AI generation. Content length:", content?.length);
   const NOTES_SYSTEM_PROMPT = `You are an elite academic synthesizer and UI content designer. Your task is to transform the provided source text or document into highly engaging, modern, and ultra-scannable summary or notes. 

The target audience consists of students who suffer from cognitive fatigue, so the formatting must be dynamic, visually interesting, and structured to maximize retention while eliminating boredom.

Strictly adhere to the following layout and formatting rules:

1. High-Level Summary Card:
   - Start immediately with a short, 2-3 sentence high-level overview of the entire topic. Wrap this in a Markdown blockquote (>) to make it look like a highlighted summary banner.

2. Structural Hierarchy:
   - Break the content down into clear, logical subsections using \`##\` and \`###\` headers.
   - Every major section must begin with a relevant emoji in the title to break visual monotony (e.g., "## 🧬 The Krebs Cycle").

3. The "Chunking" Rule:
   - Never write a paragraph longer than 3 sentences. 
   - Use bold text (\`**key phrase**\`) strategically on critical concepts so a user can skim the page and still understand the core message.

4. Multi-Format Elements (Mix and Match these per section):
   - Key Takeaways: Use bullet points (\`*\`) for quick facts, but ensure the first 2-4 words of the bullet point are bolded.
   - Chronological/Process Steps: Use numbered lists (\`1.\`, \`2.\`) if explaining a sequential process or timeline.
   - Dynamic Callouts: Use blockquotes for crucial "Pro-Tips", "Common Pitfalls", or "Exam Alerts" to pull the reader's eye down the page.

5. Technical Vocabulary:
   - If a complex or industry-specific term is introduced, write it as: \`**Term** — *Simple definition or analogy.*\`

6. Scope:
   - Ensure 100% of the core educational concepts from the source material are captured. Do not drop important data for brevity, but compress the explanation down to its absolute essence.

Output your response using standard, clean GitHub-Flavored Markdown text. Do not wrap the response in markdown code blocks (\`\`\`markdown). Begin directly with the main title.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: NOTES_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert educational content creator.
      Analyze the following study material and return a JSON object.
      The JSON object must have exactly these keys:
      - title: A concise and engaging title for the study set
      - description: A brief 1-2 sentence overview of the topic
      - category: The academic subject or category (e.g., Biology, History, Chemistry, Physics, Literature, Mathematics, etc.)
      - summary: A clear, comprehensive summary of the key concepts in Markdown format

      Material: ${content}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleanedData = JSON.parse(jsonMatch[0]);
        return { success: true, data: cleanedData };
      }
      throw new Error("Invalid response format from AI");
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
  const text = formData.get('text');
  const file = formData.get('file'); // File object

  console.log("Starting complete study set creation process...");

  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Supabase Auth Error:", authError.message);
    }

    if (!user) {
      console.log("No user found in session. Checking cookies...");
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll().map(c => c.name);
      console.log("Available cookies:", allCookies);
      throw new Error("Authentication required");
    }

    console.log("Authenticated as user:", user.id);
    
    // ... rest of logic

    // 1. Upload File if exists
    let fileUrl = null;
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, file);

      if (uploadError) {
        console.error("File upload failed:", uploadError);
        throw new Error("Failed to upload study material file");
      }

      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      fileUrl = publicUrl;
    }

    // 2. Create Material Record FIRST
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

    // 3. Generate AI Content using the provided text
    const aiResult = await generateStudySets(text);
    if (!aiResult.success) {
      // Cleanup: Optionally delete the material if AI fails
      await supabase.from('materials').delete().eq('id', material.id);
      return aiResult;
    }

    const { title, description, category, summary } = aiResult.data;

    // 4. Create Study Set with reference to material_id
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

    if (studySetError) throw studySetError;

    console.log("Successfully created study set and linked to material.");
    return { success: true, id: studySet.id, data: studySet };

    } catch (error) {
    console.error("Creation failed:", error.message);
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
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch study sets:", error.message);
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

    // Fetch flashcards for this study set
    const { data: flashcardsData } = await supabase
      .from('flashcards')
      .select('cards')
      .eq('study_set_id', id)
      .single();

    if (flashcardsData) {
      data.flashcards = flashcardsData.cards;
    }

    // Fetch flowcharts for this study set
    const { data: flowchartsData } = await supabase
      .from('flowcharts')
      .select('mermaid_code')
      .eq('study_set_id', id)
      .single();

    if (flowchartsData) {
      data.mindmaps = flowchartsData.mermaid_code;
    }

    // Fetch quiz for this study set
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    const prompt = `
      Create a detailed and colorful Mermaid.js mindmap diagram for the following study material.

      Requirements:
      1. Root Node: The central topic.
      2. Branches: Each major section should be a primary branch.
      3. Sub-branches: Break down major sections into detailed sub-points.
      4. Diversity: Use different node shapes if appropriate (e.g., ((Round)), [Square], )Leaf( ).

      Return ONLY the valid Mermaid.js code. Do NOT wrap it in markdown block quotes (e.g. \`\`\`mermaid) and do NOT include any other text.
      The code MUST start with \`mindmap\`.

      Material: ${content}
    `;

    const promptParts = [prompt];
    const filePart = await getGeminiFilePart(fileUrl);
    if (filePart) promptParts.push(filePart);

    const result = await model.generateContent(promptParts);
    let mermaidCode = result.response.text().trim();

    // Clean up potential markdown formatting if the model still includes it
    if (mermaidCode.startsWith('```mermaid')) {
        mermaidCode = mermaidCode.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (mermaidCode.startsWith('```')) {
        mermaidCode = mermaidCode.replace(/```\n?/g, '').trim();
    }

    const supabase = await getSupabaseServerClient();

    const { data: existingData } = await supabase
      .from('flowcharts')
      .select('id')
      .eq('study_set_id', setId)
      .single();

    let dbResult;
    if (existingData) {
      dbResult = await supabase
        .from('flowcharts')
        .update({ mermaid_code: mermaidCode })
        .eq('id', existingData.id);
    } else {
      dbResult = await supabase
        .from('flowcharts')
        .insert({ study_set_id: setId, mermaid_code: mermaidCode });
    }

    if (dbResult.error) throw dbResult.error;

    return { success: true, data: mermaidCode };
  } catch (error) {
    console.error("Mindmap generation failed:", error);
    return { success: false, error: error.message };
  }
}

export async function generateFlashcards(setId, content, fileUrl) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Create 10-15 flashcards for the following study material.
      Return a JSON array of objects, where each object has:
      - question: The front of the card
      - answer: The back of the card
      
      Material: ${content}
    `;

    const promptParts = [prompt];
    const filePart = await getGeminiFilePart(fileUrl);
    if (filePart) promptParts.push(filePart);

    const result = await model.generateContent(promptParts);
    const text = result.response.text();
    
    let flashcards;
    try {
      flashcards = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse flashcards JSON");
      }
    }

    const supabase = await getSupabaseServerClient();
    
    // Check if flashcards already exist for this set
    const { data: existingData } = await supabase
      .from('flashcards')
      .select('id')
      .eq('study_set_id', setId)
      .single();

    let dbResult;
    if (existingData) {
      dbResult = await supabase
        .from('flashcards')
        .update({ cards: flashcards })
        .eq('id', existingData.id);
    } else {
      dbResult = await supabase
        .from('flashcards')
        .insert({ study_set_id: setId, cards: flashcards });
    }

    if (dbResult.error) throw dbResult.error;
    
    return { success: true, data: flashcards };
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    return { success: false, error: error.message };
  }
}

export async function generateQuiz(setId, content, fileUrl) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Create a 10-question multiple choice quiz for the following material.
      Return a JSON array of objects, where each object has:
      - question: The question text
      - options: Array of 4 strings
      - correctAnswer: The correct string from the options
      - explanation: A brief explanation why it's correct
      
      Material: ${content}
    `;

    const promptParts = [prompt];
    const filePart = await getGeminiFilePart(fileUrl);
    if (filePart) promptParts.push(filePart);

    const result = await model.generateContent(promptParts);
    const text = result.response.text();

    let quiz;
    try {
      quiz = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse quiz JSON");
      }
    }

    const supabase = await getSupabaseServerClient();
    
    // Check if quiz already exists for this set
    const { data: existingData } = await supabase
      .from('quizzes')
      .select('id')
      .eq('study_set_id', setId)
      .single();

    let dbResult;
    if (existingData) {
      dbResult = await supabase
        .from('quizzes')
        .update({ payload: quiz })
        .eq('id', existingData.id);
    } else {
      dbResult = await supabase
        .from('quizzes')
        .insert({ study_set_id: setId, payload: quiz });
    }

    if (dbResult.error) throw dbResult.error;
    
    return { success: true, data: quiz };
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStudySet(id) {
    try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required");
    }

    const { error } = await supabase
      .from('study_sets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
    } catch (error) {
    console.error("Failed to delete study set:", error.message);
    return { success: false, error: error.message };
    }
}

export async function generateQuickNote(question, correctAnswer, content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not defined" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert tutor. A student incorrectly answered the following question.
      
      Question: "${question}"
      Correct Answer: "${correctAnswer}"
      
      Based on the following source material, provide a short, highly-focused, and easy-to-understand study note explaining the concept behind this question. Use markdown formatting to make it readable.
      Keep it brief and encouraging.

      Source Material:
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { success: true, data: text };
  } catch (error) {
    console.error("Quick note generation failed:", error);
    return { success: false, error: error.message };
  }
}
