const fs = require("fs");
const { assert } = require("chai");

describe("Mock Application Sanitization", function () {
  it("should sanitize the mock_application.json file", function (done) {
    // Read the mock_application.json file
    fs.readFile("mock_application.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading mock_application.json:", err);
        return done(err);
      }

      try {
        // Parse the JSON data
        const mockApp = JSON.parse(data);

        // Remove duplicate fields
        mockApp.versions.forEach((version) => {
          version.objects.forEach((object) => {
            object.fields = removeDuplicateFields(object.fields);
          });
        });

        // Remove duplicate objects
        const uniqueVersions = removeDuplicateObjects(mockApp.versions);

        // Update the mock application with unique versions
        mockApp.versions = uniqueVersions;

        // Create the clean_application.json file with the sanitized data
        const cleanData = JSON.stringify(mockApp, null, 2);
        fs.writeFile("clean_application.json", cleanData, "utf8", (err) => {
          if (err) {
            console.error("Error writing clean_application.json:", err);
            return done(err);
          }
          console.log("Clean application file created: clean_application.json");

          // Perform assertions to verify the test case
          assert.strictEqual(mockApp.versions.length, uniqueVersions.length);
          assert.strictEqual(
            mockApp.versions[0].objects.length,
            uniqueVersions[0].objects.length
          );

          done();
        });
      } catch (err) {
        console.error("Error parsing mock_application.json:", err);
        done(err);
      }
    });
  });
});

// Function to remove duplicate fields
function removeDuplicateFields(fields) {
  const uniqueFields = new Map();
  return fields.filter((field) => {
    const fieldKey = `${field.key}_${field.type}`;
    if (!uniqueFields.has(fieldKey)) {
      uniqueFields.set(fieldKey, true);
      return true;
    }
    return false;
  });
}

// Function to remove duplicate objects
function removeDuplicateObjects(versions) {
  const uniqueVersions = new Map();
  return versions.filter((version) => {
    const uniqueObjects = new Map();
    version.objects = version.objects.filter((object) => {
      const objectKey = object.key;
      if (!uniqueObjects.has(objectKey)) {
        uniqueObjects.set(objectKey, true);
        return true;
      }
      return false;
    });
    const versionKey = JSON.stringify(version.objects);
    if (!uniqueVersions.has(versionKey)) {
      uniqueVersions.set(versionKey, true);
      return true;
    }
    return false;
  });
}
