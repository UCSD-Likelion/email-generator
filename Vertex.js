const PROJECT_ID = "email-generator-477702";

const VERTEX_AI_LOCATION = "us-central1";

const MODEL_ID = "gemini-2.5-flash";

/**
 * Sends the Email to the Vertex AI and generates a response
 *
 * @param {string} emailText - The text of the email to reply.
 * @returns {string} - The draft of the reply of the given email
 */
function processEmail(emailText) {
  const apiURL = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate a draft of the reply to the following email: ${emailText}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          reply: { type: "string" },
        },
        required: ["reply"],
      },
    },
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true, // Set to true to inspect the error response
    payload: JSON.stringify(payload),
  };

  // Make API Request
  const response = UrlFetchApp.fetch(apiURL, options);

  // Parse Response
  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error("Vertex AI API call failed: " + statusCode);
  }

  const parsed = JSON.parse(body);
  const inner = JSON.parse(parsed.candidates[0].content.parts[0].text);

  return inner.reply.trim();
}

/**
 * Summarizes the given email
 *
 * @param {string} emailText - The text of the email to summarize.
 * @returns {string} - The summary of the given email
 */
function summarizeEmail(emailText) {
  const apiURL = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate a summary for the given email: ${emailText}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
        },
        required: ["summary"],
      },
    },
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true, // Set to true to inspect the error response
    payload: JSON.stringify(payload),
  };

  // Make API Request
  const response = UrlFetchApp.fetch(apiURL, options);

  // Parse Response
  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error("Vertex AI API call failed: " + statusCode);
  }

  const parsed = JSON.parse(body);
  const inner = JSON.parse(parsed.candidates[0].content.parts[0].text);

  return inner.summary.trim();
}
