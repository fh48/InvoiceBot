const {
  Client,
  File,
  logger,
  Variables
} = require("camunda-external-task-client-js");

const absence = require("./absenceClient");

const Botkit = require("botkit");

const { sendPdf, getCreditorsInvoices } = require("./engineIntegration");

const holidayData = absence.returnHolidayData();

// console.log(holidayData);
const USERS = {
  me: "UC917TW2E",
  omran: "UC8PT88BE",
  fabian: "UC91BBCP4"
};

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
  baseUrl: "http://localhost:8080/engine-rest",
  use: logger,
  interval: 5000
};

const customOption = {
  lockDuration: 1000000,
  variables: ["creditor", "invoiceCategory", "amount", "invoiceNumber"]
};

controller.hears(
  ["hello", "hi"],
  "direct_message,direct_mention,mention",
  function(bot, message) {
    bot.reply(message, "hello");
  }
);

// const client = new Client(config);

// create a handler for the task
// const handler = async ({ task, taskService }) => {
//   // get task variable;
//   const {
//     creditor,
//     invoiceCategory,
//     amount,
//     invoiceNumber
//   } = task.variables.getAll();

//   const approveVariable = new Variables();

//   bot.startConversation(DEFUALT_USER, async function(err, convo) {
//     if (!err) {
//       convo.say("Hello, You have an Invoice to approve!");
//       convo.say("Here is the information of the Invoice: ");
//       convo.say(
//         `Creditor: ${creditor}\nInvoice category: ${invoiceCategory}\nAmount: ${amount}\nInvoice number: ${invoiceNumber}`
//       );
//       askAproval(convo, approveVariable, taskService, task);
//     }
//   });
// };

const { creditor, invoiceCategory, amount, invoiceNumber } = {
  creditor: "omran",
  invoiceCategory: "test",
  amount: 25,
  invoiceNumber: 33
};

const task = {
  processInstanceId: "88ea0b8c-a12d-11e8-a0f6-acde48001122",
  processDefinitionID: "invoice:5:c36cccfc-a0a7-11e8-ae17-acde48001122"
};

const taskService = {
  complete: () => {}
};

const approveVariable = new Variables();

bot.startConversation(DEFUALT_USER, async function(err, convo) {
  if (!err) {
    convo.say("Hello, You have an Invoice to approve!");
    convo.say("Here is the information of the Invoice: ");
    convo.say(
      `Creditor: ${creditor}\nInvoice category: ${invoiceCategory}\nAmount: ${amount}\nInvoice number: ${invoiceNumber}`
    );
    askAproval(convo, approveVariable, taskService, task);
  }
});

async function complete(taskService, task, approveVariable) {
  try {
    // await taskService.complete(task, approveVariable);
    console.log("I completed my task successfully!!");
  } catch (e) {
    console.error(`Failed completing my task, ${e}`);
  }
}

function askAproval(convo, approveVariable, taskService, task) {
  convo.ask("Do you approve the Invoice?", function(response, convo) {
    switch (response.text) {
      case "yes":
        convo.say("Great!");
        approveVariable.set("approved", true);
        complete(taskService, task, approveVariable);
        convo.next();
        break;
      case "no":
        convo.say("Done");
        approveVariable.set("approved", false);
        complete(taskService, task, approveVariable);
        convo.next();
        break;
      case "show invoice":
        sendPdf(task.processInstanceId, err => {
          if (err) console.log(err);
          convo.repeat();
          convo.next();
        });
        break;
      case "Previous invoices":
        let replyText = "Here you go \n";
        getCreditorsInvoices(
          creditor,
          task.processDefinitionID,
          (err, data) => {
            if (err) console.log(err);
            Object.keys(data).forEach(key => {
              const amount = data[key].find(
                variable => variable.name === "amount"
              );
              const invoiceCategory = data[key].find(
                variable => variable.name === "invoiceCategory"
              );
              const approved = data[key].find(
                variable => variable.name === "approved"
              );
              replyText += `Invoice Type: ${invoiceCategory.value}\n`;
              replyText += `amount: ${amount.value}\n`;
              replyText += `${approved.value ? "Approved" : "Not approved"}\n`;
              replyText += `--------------------------------------------\n`;
            });
            bot.reply(convo.source_message, replyText);
            convo.repeat();
            convo.next();
          }
        );
        break;
      case "Show absences":
        convo.say("Test");
        break;
      default:
        convo.repeat();
    }
  });
}

// function AsktoApprove(response, convo) {
//   convo.ask("Do you approve" + response.text + "`?", [
//     {
//       pattern: "yes",
//       callback: function(response, convo) {
//         try {
//           await taskService.complete(task);
//           console.log("I completed my task successfully!!");
//         } catch (e) {
//           console.error(`Failed completing my task, ${e}`);
//         }
//         // since no further messages are queued after this,
//         // the conversation will end naturally with status == 'completed'
//         convo.next();
//       }
//     },
//     {
//       pattern: "no",
//       callback: function(response, convo) {
//         try {
//           await taskService.complete(task);
//           console.log("I completed my task successfully!!");
//         } catch (e) {
//           console.error(`Failed completing my task, ${e}`);
//         }
//         // stop the conversation. this will cause it to end with status == 'stopped'
//         convo.stop();
//       }
//     },
//     {
//       default: true,
//       callback: function(response, convo) {
//         convo.say("welcome");
//         convo.repeat();
//         convo.next();
//       }
//     }
//   ]);

//   convo.next();
// }

// susbscribe to the topic 'creditScoreChecker' & provide the created handler
// client.subscribe("ApproveInvoice", customOption, handler);
