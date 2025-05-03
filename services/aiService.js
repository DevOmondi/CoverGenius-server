const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Initialize Gemini
// console.log("Gemini API Key:", process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const COVER_LETTER_SYSTEM_PROMPT = `
You are an expert career coach and professional cover letter writer.
Generate a compelling, professional cover letter tailored to the provided job description.
The cover letter should:
1. Be 3-4 paragraphs long
2. Highlight relevant skills and experiences
3. Show enthusiasm for the position
4. Be free of grammatical errors
5. Use a professional but approachable tone
`;

const generationConfig = {
  temperature: 0.7,
  maxOutputTokens: 1000,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const generateCoverLetter = async (jobDescription) => {
  try {
    // Simple length check
    if (jobDescription.length > 10000) {
      throw new Error(
        "Job description is too long. Please limit to 10,000 characters"
      );
    }

    // Combine system prompt and user input
    const prompt = `${COVER_LETTER_SYSTEM_PROMPT}\n\nJob Description:\n${jobDescription}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No content in AI response");
    }

    return text;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw new Error("Failed to generate cover letter: " + error.message);
  }
};

module.exports = {
  generateCoverLetter,
};
