const {
  Client,
  logger,
  Variables
} = require("camunda-external-task-client-js");

const Botkit = require("botkit");

const config = {
  baseUrl: "http://localhost:8080/engine-rest",
  use: logger
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

// create a Client instance with custom configuration
const client = new Client(config);

// create a handler for the task
const handler = async ({ task, taskService }) => {
  // get task variable;
  //   const {
  //     creditor,
  //     invoiceCategory,
  //     amount,
  //     invoiceNumber,
  //     invoiceDocumentUpload
  //   } = task.variables.getAll();

  //   var controller = Botkit.anywhere(configuration);

  //   controller.hears("hello", "direct_message", function(bot, message) {
  //     bot.reply(message, "Hello yourself!");
  //   });
  // 3
  //   // TODO: set process variables
  //   // const creditor = 'foo';
  //   const processVariables = new Variables()
  //     .set("creditor", creditor)
  //     .set("bar", new Date());

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
