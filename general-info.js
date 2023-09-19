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

// Plant Type formula
function plantType(value) {
    //
}

// Blooming Formula (flowering and fruiting)
function blooming(value) {
    //
}

// Flower language formula
function flowerLanguage(value) {
    //
}

// Color formula
function color(value) {
    //
}

// Size formula
function size(value) {
    //
}

fs.createReadStream('PlantDB.csv')
    .pipe(csv())
    .on('data', (data) => {

        // General info
        data.image = cleanStr(data.image);
        data.origin = cleanStr(data.origin);
        data.production = cleanStr(data.production);
        data.plant_type = cleanStr(data.plant_type); // TO DO - extract from taxonomy data (external source)

        // Add the updated data to the results array
        results.push({
            general_info: {
                image: cleanStr(data.image),
                origin: cleanStr(data.origin),
                production: cleanStr(data.production),
                plant_type: cleanStr(data.plant_type),
                blooming: {
                    flowering_period: [cleanStr(data.flowering_period_start), cleanStr(data.flowering_period_end)],
                    fruiting_period: [cleanStr(data.fruiting_period_start), cleanStr(data.fruiting_period_end)],
                    flower_language: cleanStr(data.flower_language),
                },
                color: {
                    leaf: cleanStr(data.leaf_color),
                    flower: cleanStr(data.flower_color),
                    fruit: cleanStr(data.fruit_color),
                    bract: cleanStr(data.bract_color),
                },
                size: {
                    metric: {
                        value: [cleanStr(data.size_metric_value_h), cleanStr(data.size_metric_value_d)],
                        units: [cleanStr(data.size_metric_unit_h), cleanStr(data.size_metric_unit_d)],
                    },
                    imperial: {
                        value: [cleanStr(data.size_imperial_value_h), cleanStr(data.size_imperial_value_d)],
                        units: [cleanStr(data.size_imperial_unit_h), cleanStr(data.size_imperial_unit_d)],
                    }
                }
            },
        });
    })
    .on('end', () => {
        // Create a JSON file with the updated data
        fs.writeFileSync('taxonomy.json', JSON.stringify(results, null, 2));
        console.log('JSON file created.');
    });
