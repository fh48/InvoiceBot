const request = require("request");
const download = require('download-pdf');
const fs = require("fs");

exports.sendPdf = (processInstanceId, cb) => {
  request.get(`http://localhost:8080/engine-rest/process-instance/${processInstanceId}/variables/`, (e, r, b) => {
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
        }
        download(pdf, options, function(err){
          if (err) {
            cb(err);
            return;
          }
          options = {
            method: 'POST',
            url: 'https://slack.com/api/files.upload',
            headers: { Authorization: 'Bearer xoxb-418375872038-416341547520-Sa9qPMwFs8R8ZyBBQISLu1dP' },
            formData: {
              channels: 'DC8T86G1H', filetype: 'pdf', file: fs.createReadStream(variable + ".pdf"), 'filename': variable + ".pdf"
            }
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
                channels: "UC917TW2E",
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
                fs.unlink(variable + ".pdf", (err2) => {
                  if (err2) {
                    cb(err2);
                    return;
                  }
                });
                cb(null);
              }
            });
          });
        });
      }
    })
  })
}

exports.getCreditorsInvoices = (creditor, procDefId, cb) => {
  request.get(`http://localhost:8080/engine-rest/history/variable-instance?processDefinitionId=${procDefId}`, (e, r, b) => {
    if (e) {
      cb(e, null);
      return;
    }
    const procInstIds = [];
    c = JSON.parse(b);
    c.forEach(variable => {
      if (variable.name === "creditor" && variable.value === creditor) {
        procInstIds.push(variable.processInstanceId);
      }
    });
    const final = {};
    procInstIds.forEach((id, i) => {
      request.get(`http://localhost:8080/engine-rest/history/variable-instance?processInstanceId=${id}`, (e2, r2, b2) => {
        if (e2) {
          cb(e2, null);
          return;
        }
        const instanceInstance = JSON.parse(b2);
        request.get(`http://localhost:8080/engine-rest/history/process-instance/${id}`, (e3, r3, b3) => {
          const c3 = JSON.parse(b3);
          final[c3.startTime] = instanceInstance;
          if (i === 4 || i === procInstIds.length - 1) {
            cb(null, final);
          }
        });
      });
    });
  })
}
