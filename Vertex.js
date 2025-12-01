/**
 * Vertex AI API integration for email generation
 */

const PROJECT_ID = "email-generator-477702";
const VERTEX_AI_LOCATION = "us-central1";
const MODEL_ID = "gemini-2.5-flash";

/**
 * Sends the email to Vertex AI and generates a reply
 * 
 * @param {string} emailText - The text of the email to reply to
 * @returns {string} - The draft reply for the given email
 */
function processEmail(emailText) {
  const apiURL = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You must always answer in English. Generate a professional and concise draft reply to the following email:\n\n${emailText}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    systemInstruction: {
      parts: [
        {
          text: "You are a helpful email assistant. Respond directly without extended thinking."
        }
      ]
    }
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const startTime = new Date().getTime();
  const response = UrlFetchApp.fetch(apiURL, options);
  const endTime = new Date().getTime();
  
  console.log(`API call took ${endTime - startTime}ms`);

  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  console.log("Status:", statusCode);

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode} - ${body}`);
  }

  const parsed = JSON.parse(body);
  
  if (!parsed.candidates || parsed.candidates.length === 0) {
    throw new Error(`No candidates in response: ${body}`);
  }
  
  if (!parsed.candidates[0].content.parts || parsed.candidates[0].content.parts.length === 0) {
    throw new Error(`No content parts in response. Finish reason: ${parsed.candidates[0].finishReason}`);
  }
  
  const replyText = parsed.candidates[0].content.parts[0].text;
  
  return replyText.trim();
}

/**
 * Generates an email draft from user input
 * 
 * @param {string} userInput - What the user wants to convey
 * @param {string} recipient - Email recipient (optional)
 * @param {string} subject - Email subject (optional)
 * @returns {string} - The generated email draft
 */
function processComposeEmail(userInput, recipient, subject) {
  const apiURL =
    `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  let prompt = `You must always answer in English. Generate a professional and well-structured email based on the following request:\n\n${userInput}`;
  
  if (recipient) {
    prompt += `\n\nRecipient: ${recipient}`;
  }
  
  if (subject) {
    prompt += `\n\nSubject: ${subject}`;
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    systemInstruction: {
      parts: [
        {
          text: "You are a helpful email assistant. Respond directly without extended thinking."
        }
      ]
    }
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const startTime = new Date().getTime();
  const response = UrlFetchApp.fetch(apiURL, options);
  const endTime = new Date().getTime();
  
  console.log(`Compose API call took ${endTime - startTime}ms`);

  const statusCode = response.getResponseCode();
  const body = response.getContentText();
  
  console.log("Status:", statusCode);

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode} - ${body}`);
  }

  const parsed = JSON.parse(body);
  
  if (!parsed.candidates || parsed.candidates.length === 0) {
    throw new Error(`No candidates in response: ${body}`);
  }
  
  if (!parsed.candidates[0].content.parts || parsed.candidates[0].content.parts.length === 0) {
    throw new Error(`No content parts in response. Finish reason: ${parsed.candidates[0].finishReason}`);
  }
  
  const draftText = parsed.candidates[0].content.parts[0].text;
  
  return draftText.trim();
}

/**
 * Summarizes the given email
 *
 * @param {string} emailText - The text of the email to summarize
 * @returns {string} - The summary of the email
 */
function summarizeEmail(emailText) {
  const apiURL = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate a concise summary for the given email:\n\n${emailText}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
    systemInstruction: {
      parts: [
        {
          text: "You are a helpful email assistant. Respond directly without extended thinking."
        }
      ]
    }
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(apiURL, options);
  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode}`);
  }

  const parsed = JSON.parse(body);
  
  if (!parsed.candidates || parsed.candidates.length === 0) {
    throw new Error(`No candidates in response`);
  }
  
  if (!parsed.candidates[0].content.parts || parsed.candidates[0].content.parts.length === 0) {
    throw new Error(`No content parts in response. Finish reason: ${parsed.candidates[0].finishReason}`);
  }
  
  const summaryText = parsed.candidates[0].content.parts[0].text;
  
  return summaryText.trim();
}

/**
 * Extracts calendar event information from email text
 *
 * @param {string} emailText - The email text to extract events from
 * @returns {Object} - Calendar event object with hasCalendarEvent, title, start, end
 */
function extractCalendarEvents(emailText) {
  const apiURL = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are an assistant that extracts at most one calendar event from an email.",
              "",
              "Email:",
              emailText,
              "",
              "Return JSON of the form:",
              "{",
              '  "hasCalendarEvent": true/false,',
              '  "title": "<short event title>",',
              '  "start": "<ISO 8601 datetime>",',
              '  "end": "<ISO 8601 datetime>"',
              "}",
              "",
              "If there is no clear event, set hasCalendarEvent to false and omit title/start/end.",
            ].join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          hasCalendarEvent: { type: "boolean" },
          title: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
        },
        required: ["hasCalendarEvent"],
      },
    },
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(apiURL, options);
  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode}`);
  }

  const parsed = JSON.parse(body);
  const calendarEvent = JSON.parse(parsed.candidates[0].content.parts[0].text);

  console.log("Extracted calendar event:", calendarEvent);

  return calendarEvent;
}

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test function for processEmail
 */
function testProcessEmail() {
  const sampleEmail = `
Hi,

I'm following up about our meeting next week. Are you still available on Thursday at 3 PM?

Best,
Alex
`;
  const reply = processEmail(sampleEmail);
  Logger.log(reply);
}

/**
 * Test function for processComposeEmail
 */
function testComposeEmail() {
  const userInput = "Ask about project deadline";
  const recipient = "manager@company.com";
  const subject = "Project Deadline Inquiry";
  
  const draft = processComposeEmail(userInput, recipient, subject);
  Logger.log(draft);
}

/**
 * Test function for summarizeEmail
 */
function testSummarizeEmail() {
  const sampleEmail = `
Hi team,

Just a quick update on the Q4 project. We've completed the first phase and are moving into testing. 
The deadline is still December 15th, and we're on track to meet it.

Let me know if you have any questions.

Best,
Sarah
`;
  const summary = summarizeEmail(sampleEmail);
  Logger.log(summary);
}

/**
 * Test function for extractCalendarEvents
 */
function testExtractCalendar() {
  const sampleEmail = `
Hi,

Let's schedule a meeting for Thursday, January 15th at 2:00 PM to discuss the project updates. 
The meeting should last about an hour.

Thanks,
Mike
`;
  const event = extractCalendarEvents(sampleEmail);
  Logger.log(JSON.stringify(event, null, 2));
}