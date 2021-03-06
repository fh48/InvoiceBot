const request = require("request");
const download = require("download-pdf");
const fs = require("fs");
const { getHolidayRanges } = require("./absenceClient");
const PDFImage = require("pdf-image").PDFImage;

exports.sendPdf = (processInstanceId, cb) => {
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
                channels: "UC8PT88BE",
                filetype: "pdf",
                file: fs.createReadStream(variable + ".pdf"),
                filename: variable + ".pdf"
              }
            };
            download(pdf, options, function(err) {
              if (err) {
                cb(err);
                return;
              }
              const pdfImage = new PDFImage(variable + ".pdf");
              pdfImage.convertPage(0).then(function(img) {
                options = {
                  method: "POST",
                  url: "https://slack.com/api/files.upload",
                  headers: {
                    Authorization:
                      "Bearer xoxb-418375872038-416341547520-Sa9qPMwFs8R8ZyBBQISLu1dP"
                  },
                  formData: {
                    channels: "UC917TW2E",
                    filetype: "png",
                    file: fs.createReadStream(img),
                    filename: img
                  }
                };
                request(options, function(error, response, body) {
                  if (error) {
                    cb(error);
                    return;
                  } else {
                    fs.unlink((img, err2) => {
                      if (err2) {
                        cb(err2);
                        return;
                      }
                    });
                    fs.unlink((variable + ".pdf", errrrrrrrrrrr) => {
                      if (errrrrrrrrrrr) {
                        cb(errrrrrrrrrrr);
                        return;
                      }
                    });
                    cb(null);
                  }
                });
              });
            });
          });
        }
      });
    }
  );
};

exports.getCreditorsInvoices = (creditor, procDefId, cb) => {
  request.get(
    `http://localhost:8080/engine-rest/history/variable-instance?processDefinitionId=${procDefId}`,
    (e, r, b) => {
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
      let hackyFlag = false;
      procInstIds.forEach((id, i) => {
        request.get(
          `http://localhost:8080/engine-rest/history/variable-instance?processInstanceId=${id}`,
          (e2, r2, b2) => {
            if (e2) {
              cb(e2, null);
              return;
            }
            const instanceInstance = JSON.parse(b2);
            request.get(
              `http://localhost:8080/engine-rest/history/process-instance/${id}`,
              (e3, r3, b3) => {
                const c3 = JSON.parse(b3);
                final[c3.startTime] = instanceInstance;
                if (
                  Object.keys(final).length === 5 ||
                  Object.keys(final).length === procInstIds.length
                ) {
                  if (!hackyFlag) {
                    cb(null, final);
                    hackyFlag = true;
                  }
                }
              }
            );
          }
        );
      });
    }
  );
};

exports.matchAbsenceDate = (procInstIds, cb) => {
  request.get(
    `http://localhost:8080/engine-rest/history/process-instance/${procInstIds}`,
    (e, r, body) => {
      const b = JSON.parse(body);
      if (!e) {
        let match = false;
        getHolidayRanges(data => {
          data.forEach(absence => {
            const absStart = new Date(absence.start);
            const absEnd = new Date(absence.end);
            const instStart = new Date(b.startTime);
            if (absStart < instStart && absEnd > instStart) {
              match = true;
              cb({
                absenceStart: absence.start,
                absenceEnd: absence.end,
                invoiceDate: b.startTime,
                match: true
              });
              return;
            }
          });
          if (!match) {
            cb({
              absenceStart: null,
              absenceEnd: null,
              invoiceDate: instStart,
              match: false
            });
          }
        });
      }
    }
  );
};

exports.sendPdf("2f96d06e-a13d-11e8-b63b-8eb4ce52a4bf", e => {
  console.log("SUS");
});
