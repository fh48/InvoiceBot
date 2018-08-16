const request = require("request");
var download = require("download-pdf");

const fs = require("fs");

const sendPrimaryPdf = (processInstanceId, cb) => {
  request.get(
    `http://localhost:8080/engine-rest/process-instance/${processInstanceId}/variables/`,
    (e, r, b) => {
      if (e) {
        cb(e);
        return;
      }
      const variables = JSON.parse(b);
      Object.keys(variables).forEach(variable => {
        if (variables[variable].type === "File") {
          const pdf = `http://localhost:8080/engine-rest/process-instance/${processInstanceId}/variables/${variable}/data`;
          let options = {
            directory: "./",
            filename: variable + ".pdf"
          };
          download(pdf, options, function(err) {
            if (err) {
              cb(err);
              return;
            }
            options = {
              method: "POST",
              url: "https://slack.com/api/files.upload",
              headers: {
                Authorization:
                  "Bearer xoxb-418375872038-416341547520-Sa9qPMwFs8R8ZyBBQISLu1dP"
              },
              formData: {
                channels: "DC8T86G1H",
                filetype: "pdf",
                file: fs.createReadStream(variable + ".pdf"),
                filename: "file.pdf"
              }
            };

            request(options, function(error, response, body) {
              if (error) {
                cb(error);
                return;
              } else {
                cb(null);
              }
            });
          });
        }
      });
    }
  );
};

module.exports = sendPrimaryPdf;
