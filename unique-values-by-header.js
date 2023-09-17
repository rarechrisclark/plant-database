const fs = require('fs');
const csv = require('csv-parser');

// Specify the CSV file path
const csvFilePath = 'PlantDB.csv';

// Create an object to store unique values by headers
const uniqueValuesByHeader = {};

fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
        // Loop through the CSV headers and add values to the respective Sets
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (value) {
                    // Use trim() to remove leading/trailing spaces
                    const trimmedValue = value.trim();
                    // Initialize a Set for each header if it doesn't exist
                    if (!uniqueValuesByHeader[key]) {
                        uniqueValuesByHeader[key] = new Set();
                    }
                    // Add the trimmed value to the respective Set
                    uniqueValuesByHeader[key].add(trimmedValue);
                }
            }
        }
    })
    .on('end', () => {
        // Now, uniqueValuesByHeader contains unique values correlated with headers

        // Convert the Sets to arrays and remove duplicates
        const uniqueValuesObject = {};
        for (const key in uniqueValuesByHeader) {
            if (uniqueValuesByHeader.hasOwnProperty(key)) {
                uniqueValuesObject[key] = Array.from(uniqueValuesByHeader[key]);
            }
        }

        // Convert the object to JSON
        const jsonData = JSON.stringify(uniqueValuesObject, null, 2);

        // Specify the JSON file path where you want to save the data
        const jsonFilePath = 'unique-values-by-header.json';

        // Write the JSON data to the file
        fs.writeFileSync(jsonFilePath, jsonData, 'utf-8');

        console.log(`Unique values by header saved to ${jsonFilePath}`);
    });
