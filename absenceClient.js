const Request = require("request");
const Hawk = require("hawk");

var credentials = {
  id: "5b746fdaaff2eb5d1ab0f929", // the key identifier
  key: "ca2178296acaf1fff45bdc164a10454924e7c6b0b2d9d334f666a452805cd7c8", // the actual key
  algorithm: "sha256" // the algorythm used to build the request header
};

const requestOptions = {
  uri: "https://app.absence.io/api/v2/absences",
  method: "POST",
  headers: {}
};

const body = {
  skip: 0,
  limit: 50,
  filter: {
    assignedToId: "5b746fdaaff2eb5d1ab0f929"
  },
  relations: ["assignedToId", "reasonId", "approverId"]
};

// Generate Authorization request header

const { header } = Hawk.client.header(
  "https://app.absence.io/api/v2/absences",
  "POST",
  { credentials: credentials, ext: "some-app-data" }
);
requestOptions.headers.Authorization = header;

// Send authenticated request
returnHolidayData = cb =>
  Request(requestOptions, (error, response, body) => {
    // Authenticate the server's response
    const isValid = Hawk.client.authenticate(
      response,
      credentials,
      header.artifacts,
      { payload: body }
    );
    let responseBody = JSON.parse(body);
    cb(responseBody.data);
  });

exports.getHolidayRanges = cb => {
  returnHolidayData(data => {
    const ranges = data.map(absence => {
      return {
        start: absence.start,
        end: absence.end,
        duration: absence.daysCount
      };
    });
    cb(ranges);
  });
};

exports.getLatestAbsence = cb => {
  returnHolidayData(data => {
    cb(data[0]);
  });
};

exports.isOnHoliday = (day, cb) => {
  returnHolidayData(data => {
    let match = false;
    const date = new Date(day);
    data.forEach(absence => {
      const absStart = new Date(absence.start);
      const absEnd = new Date(absence.end);
      if (absStart < date && absEnd > date) {
        match = true;
        cb({
          absenceStart: absence.start,
          absenceEnd: absence.end,
          match: true
        });
        return;
      }
    });
    if (!match) {
      cb({ absenceStart: null, absenceEnd: null, match: false });
    }
  });
};
