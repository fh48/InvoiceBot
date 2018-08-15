const {
  Client,
  File,
  logger,
  Variables
} = require("camunda-external-task-client-js");

const absence = require("./absenceClient");

const sendPdf = require("./engineIntegration");

const holidayData = absence.returnHolidayData();
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

// // const Botkit = require("botkit");

// // const DEFUALT_USER = {
// //   type: "direct_message",
// //   user: "UC8PT88BE",
// //   channel: "DC8T86G1H"
// // };

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

// const customOption = {
//   lockDuration: 5000,
//   variables: [
//     "creditor",
//     "invoiceCategory",
//     "amount",
//     "invoiceNumber",
//     "invoiceDocumentUpload"
//   ]
// };

// create a handler for the task
const handler = async ({ task, taskService }) => {
  // get task variable;
  const {
    creditor,
    invoiceCategory,
    amount,
    invoiceNumber
  } = task.variables.getAll();

  const approveVariable = new Variables();

  bot.startConversation(DEFUALT_USER, async function(err, convo) {
    if (!err) {
      convo.say("Hello, You have an Invoice to approve!");
      convo.say("Here is the information of the Invoice: ");
      convo.say(
        `Creditor: ${creditor}\nInvoice category: ${invoiceCategory}\nAmount: ${amount}\nInvoice number: ${invoiceNumber}`
      );
      convo.ask("Do you approve the Invoice?", function(response, convo) {
        if (response.text === "yes") {
          convo.say("Great!");
          approveVariable.set("approved", true);
          complete(taskService, task, approveVariable);
        } else if (response.text === "show invoice") {
          sendPdf(task.processInstanceId, () => {
            convo.repeat();
            convo.next();
          });
        } else {
          convo.say("Done");
          approveVariable.set("approved", false);
          complete(taskService, task, approveVariable);
        }
        convo.next();
      }); // store the results in a field called nickname
    }
  });
};

async function complete(taskService, task, approveVariable) {
  try {
    await taskService.complete(task, approveVariable);
    console.log("I completed my task successfully!!");
  } catch (e) {
    console.error(`Failed completing my task, ${e}`);
  }
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
client.subscribe("ApproveInvoice", customOption, handler);
