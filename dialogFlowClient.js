const projectId = "banking-176ae"; //https://dialogflow.com/docs/agents#settings
// const projectId = "invoicebot-58ffb";
const sessionId = "quickstart-session-id";
const languageCode = "en-US";

// Instantiate a DialogFlow client.
const dialogflow = require("dialogflow");

exports.fetchIntent = async query => {
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: "./googleCredentials.json"
  });

  // Define session path
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode
      }
    }
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);

  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);

  if (result.action) return result.action;
  return result.intent ? result.intent.displayName : "noMatch";
};
