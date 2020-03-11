// Import
const fs = require('fs');

module.exports = function (inputFileName, outputFileName) {

  // Removes the extra fields
  const data = JSON.parse(fs.readFileSync(inputFileName));
  let cleaned_data = data.map(function(data) {
    delete data.page;
    return data;
  });

  // Remove the invalid data
  let final_cleaned_data = [];
  cleaned_data.forEach(function(element) {
      if (element.isValid) {
        delete element.isValid;
        final_cleaned_data.push(JSON.stringify(element));
      }
  });

  // Override the final_cleaned_data toString method.
  final_cleaned_data.toString = function() {
      return this.join(',\n');
  };

  // Setup and write the js file
  const jsContent =
`/*global db*/
db.pedoclimaticzones.drop();
db.pedoclimaticzones.insert([
${final_cleaned_data}
]);`;

  fs.writeFileSync(outputFileName, jsContent, 'utf8');
}
