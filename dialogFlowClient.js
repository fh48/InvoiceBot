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
  sessionClient
    .detectIntent(request)
    .then(responses => {
      const result = responses[0].queryResult;
      console.log(`  Query: ${result.queryText}`);

      if (result.intent) {
        console.log("Intent:", result.intent.displayName);
        return result.intent.displayName;
      } else {
        return "noMatch";
      }
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
};
