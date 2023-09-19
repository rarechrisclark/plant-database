const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');

const results = [];

//// Clean up the 'size' column strings
function cleanStr(value) {
    if (typeof value !== 'string' || !value) return value; // Check if value is a string or is empty

    // Remove any non-printable characters
    value = value.replace(/[\x00-\x1F\x7F]/gu, '');
    // Normalize Unicode characters to their closest ASCII equivalents using iconv-lite
    value = iconv.decode(value, 'utf8'); // Convert to UTF-8
    value = iconv.encode(value, 'ascii'); // Convert to ASCII
    // Remove remaining non-ASCII characters
    value = value.toString('ascii');
    // Replace any consecutive spaces with a single space
    value = value.replace(/\s+/g, ' ');
    // Trim leading and trailing spaces
    value = value.trim();
    return value;
}

fs.createReadStream('PlantDB.csv')
    .pipe(csv())
    .on('data', (data) => {

        // Extract species from the scientific_name
        const scientificNameParts = data.scientific_name.split(' ');
        data.species = scientificNameParts[1];

        // Extract family and genus from the category
        const categoryParts = data.category.split(', ');
        data.family = categoryParts[0];
        data.genus = categoryParts[1];
        delete data.category; // Remove the original "category" column

        // Add the updated data to the results array
        results.push({
            taxonomy: {
                // kingdom: cleanStr(data.kingdom),
                // phylum: cleanStr(data.phylum),
                // class: cleanStr(data.class),
                // order: cleanStr(data.order),
                family: cleanStr(data.family),
                genus: cleanStr(data.genus),
                species: (cleanStr(data.species)),
            },
            name: {
                // common: cleanStr(data.common_name),
                scientific: cleanStr(data.scientific_name),
            },
        });
    })
    .on('end', () => {
        // Create a JSON file with the updated data
        fs.writeFileSync('taxonomy.json', JSON.stringify(results, null, 2));
        console.log('JSON file created.');
    });
