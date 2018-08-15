const {
  Client,
  logger,
  Variables
} = require("camunda-external-task-client-js");

const Botkit = require("botkit");

const DEFUALT_USER = {
  type: "direct_message",
  user: "UC8PT88BE",
  channel: "DC8T86G1H"
};

var controller = Botkit.slackbot({
  clientId: "418375872038.417185195285",
  clientSecret: "3c040c065f1e59fce74be2ed3d899d5b",
  scopes: ["bot"]
});

var bot = controller
  .spawn({
    token: "xoxb-418375872038-416341547520-Sa9qPMwFs8R8ZyBBQISLu1dP"
  })
  .startRTM();

const config = {
  baseUrl: "http://localhost:8080/engine-rest"
  // use: logger
};

const customOption = {
  lockDuration: 5000,
  variables: [
    "creditor",
    "invoiceCategory",
    "amount",
    "invoiceNumber",
    "invoiceDocumentUpload"
  ]
};

controller.hears(
  ["hello", "hi"],
  "direct_message,direct_mention,mention",
  function(bot, message) {
    console.log(message);
    bot.reply(message, "hello");
  }
);

// create a Client instance with custom configuration
const client = new Client(config);

// create a handler for the task
const handler = async ({ task, taskService }) => {
  // get task variable;
  // const {
  //   creditor,
  //   invoiceCategory,
  //   amount,
  //   invoiceNumber,
  //   invoiceDocumentUpload
  // } = task.variables.getAll();

  bot.reply(DEFUALT_USER, "welcome");

  // complete the task
  try {
    await taskService.complete(task);
    console.log("I completed my task successfully!!");
  } catch (e) {
    console.error(`Failed completing my task, ${e}`);
  }
};

// susbscribe to the topic 'creditScoreChecker' & provide the created handler
client.subscribe("bottest", customOption, handler);
