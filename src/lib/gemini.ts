import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables. Please set VITE_GEMINI_API_KEY.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzePlantImage(imageBase64: string, type: 'identification' | 'health') {
  try {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1];
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    let prompt = '';
    
    if (type === 'identification') {
      prompt = `Analyze this plant image and provide a detailed identification:

Please format your response with the following sections:
OVERVIEW:
- Brief description of the plant
- Common name and scientific name
- Growth habit and size

CHARACTERISTICS:
- Leaf shape, arrangement, and texture
- Flower or fruit characteristics (if visible)
- Stem or trunk features
- Distinctive visual traits

ECOLOGY:
- Native habitat and preferred growing conditions
- Climate adaptability
- Growth pattern and lifecycle

VALUE:
- Common uses (ornamental, medicinal, edible, etc.)
- Cultural significance (if applicable)
- Benefits to the environment or garden

Each section should have 2-3 bullet points with specific, accurate information. If you cannot determine certain information from the image, use "Information not available based on the image provided" for that bullet point.`;
    } else {
      prompt = `Analyze this plant image for health issues and provide an assessment:

Please format your response with the following sections:
HEALTH STATUS:
- Overall condition assessment (healthy, stressed, diseased, etc.)
- Visible symptoms summary
- Estimated severity level

DISEASES:
- Potential diseases based on visible symptoms
- Disease characteristics and progression
- Confidence level of diagnosis

PESTS:
- Signs of pest infestation (if any)
- Potential pest identification
- Impact on plant health

TREATMENT:
- Recommended interventions
- Specific products or solutions to consider
- Application method and frequency

PREVENTION:
- Future care recommendations
- Preventative measures
- Environmental adjustments

Each section should have 2-3 bullet points with specific, actionable information. If you cannot determine certain information from the image, use "Information not available" for that bullet point.`;
    }
    
    // Format request according to the API specification
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    };

    // Make the API call
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract the text from the response
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = response.data.candidates[0].content.parts[0].text;
      
      // Validate response format
      const expectedSections = type === 'identification' 
        ? ['OVERVIEW:', 'CHARACTERISTICS:', 'ECOLOGY:', 'VALUE:'] 
        : ['HEALTH STATUS:', 'DISEASES:', 'PESTS:', 'TREATMENT:', 'PREVENTION:'];
        
      const missingSections = [];
      for (const section of expectedSections) {
        if (!text.includes(section)) {
          missingSections.push(section);
        }
      }
      
      if (missingSections.length > 0) {
        console.error("API response missing sections:", missingSections);
        console.error("Full response:", text);
        throw new Error(`API response format invalid. Missing sections: ${missingSections.join(', ')}`);
      }
      
      return text;
    }

    throw new Error('Empty or invalid response from API');
  } catch (error: any) {
    console.error("Error in analyzePlantImage:", error);
    
    // Check for API key related errors
    if (error.message && error.message.includes("API key")) {
      throw new Error("Invalid API key. Please check your API key configuration.");
    }
    
    // Check for quota exceeded errors
    if (error.message && error.message.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    
    // Check for model errors
    if (error.message && (error.message.includes("model") || error.message.toLowerCase().includes("gemini"))) {
      throw new Error("Model error: The selected model may not be available. Please try a different model.");
    }
    
    // For other errors
    throw new Error(`Failed to analyze image: ${error.message || "Unknown error"}`);
  }
}

interface Message {
  role: string;
  content: string;
}

// Define a system prompt that will guide the model's responses
const SYSTEM_PROMPT = `You are Plantae, a friendly and conversational plant expert chatbot. Follow these guidelines for every response:

1. PERSONALITY:
- Be friendly, concise, and engaging
- Use a warm, conversational tone
- Keep responses focused and to the point
- End each response with a relevant follow-up question

2. RESPONSE STRUCTURE:
- Start with a direct answer to the user's question
- Use short, clear paragraphs
- Include only the most relevant information
- Maximum 2-3 paragraphs per response
- Always end with an engaging follow-up question

3. KNOWLEDGE FOCUS:
- Plants and gardening
- Plant care and maintenance
- Plant identification
- Garden planning and design
- Plant health and disease

4. CONVERSATION STYLE:
- Be concise but informative
- Use simple, clear language
- Break complex topics into digestible points
- Encourage further discussion with follow-up questions

Remember: You are Plantae, created by M.Saad. Keep responses brief, engaging, and always end with a question to maintain conversation flow.`;

export async function getChatResponse(userMessage: string, previousMessages: Message[] = []): Promise<string> {
  try {
    // API Key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found');
      return 'Sorry, I am unable to respond at the moment due to a configuration issue.';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // Format previous messages into the correct structure
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add system prompt as the first message
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        ...formattedMessages,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.8,  // Slightly increased for more engaging responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,  // Reduced for more concise responses
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Make the API call
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract and process the response
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      let text = response.data.candidates[0].content.parts[0].text;
      
      // Ensure the response ends with a question if it doesn't already
      if (!text.trim().endsWith('?')) {
        // Add a relevant follow-up question based on the context
        text += '\n\nWould you like to know more about this topic? Or do you have any other plant-related questions?';
      }
      
      return text;
    }
    
    throw new Error('Empty or invalid response from API');
  } catch (error: unknown) {
    console.error('Error fetching response from Gemini:', error);
    if (axios.isAxiosError(error)) {
      console.error('API error details:', error.response?.data);
      
      // Check for specific API errors
      const errorMessage = error.response?.data?.error?.message;
      if (errorMessage) {
        if (errorMessage.includes('API key')) {
          return 'Sorry, there seems to be an issue with the API key. Please contact support.';
        }
        if (errorMessage.includes('quota')) {
          return 'Sorry, the API quota has been exceeded. Please try again later.';
        }
        if (errorMessage.includes('model')) {
          return 'Sorry, there was an issue with the AI model. Please try again later.';
        }
      }
    }
    return 'Sorry, I encountered an error while processing your request. Please try again.';
  }
}