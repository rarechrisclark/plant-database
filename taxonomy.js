const fs = require('fs');
const csv = require('csv-parser');
const cleanStr = require('./utils/cleanString');

const results = [];

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
                species: cleanStr(data.species),
                // variety: // TO DO
                name: {
                    scientific: cleanStr(data.scientific_name),
                    display: cleanStr(data.display_name),
                    common: cleanStr(data.display_name),
                    alias: [
                    // TO DO
                    ]
                },
                image: cleanStr(data.image),
                origin: cleanStr(data.origin),
                production: cleanStr(data.production),
                // type: // TO DO
            }
        });
    })
    .on('end', () => {
        // Create a JSON file with the updated data
        fs.writeFileSync('taxonomy.json', JSON.stringify(results, null, 2));
        console.log('JSON file created.');
    });
