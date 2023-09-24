const fs = require('fs');
const csv = require('csv-parser');
const cleanStr = require('./utils/cleanString');
const knownColors = require("./utils/knownColors.json");

const results = [];


//// Blooming Formula (flowering and fruiting)
function blooming(value) {
    const result = {
        flowering_period: [null, null],
        fruiting_period: [null, null],
    };

    if (!value) return result;

    const bloomingMappings = {
        'mainly in winter and spring': ['December', 'May'],
        'mainly in spring and summer': ['March', 'August'],
        'mainly in summer and autumn': ['June', 'November'],
        'mainly in autumn and winter': ['September', 'February'],
        'winter': ['December', 'February'],
        'spring': ['March', 'May'],
        'summer': ['June', 'August'],
        'autumn': ['September', 'November'],
        'year around': ['January', 'December'],
        'March-June and the end of winter': [['March', 'June'], ['February']],
        'April-June and September-December': [['April', 'June'], ['September', 'December']],
        'sometimes flowers': ['rarely'],
    };

    const bloomingRegex = /(?:flowering|fruiting)(?:\speriod)?\s((?:[A-Za-z]+(?:-[A-Za-z]+)?\s*)+)/ig;
    const matches = [...value.matchAll(bloomingRegex)];

    for (const match of matches) {
        const periods = match[1].trim();
        const months = periods.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/ig);
        if (months) {
            if (/flowering/ig.test(match[0])) {
                if (!result.flowering_period[0]) {
                    result.flowering_period[0] = months[0];
                }
                if (!result.flowering_period[1]) {
                    result.flowering_period[1] = months[months.length - 1];
                }
            } else if (/fruiting/ig.test(match[0])) {
                if (!result.fruiting_period[0]) {
                    result.fruiting_period[0] = months[0];
                }
                if (!result.fruiting_period[1]) {
                    result.fruiting_period[1] = months[months.length - 1];
                }
            }
        }
    }
    return result;
}

//// Color formula
function extractColors(value) {
    if (!value) return null;

    // Clean the input string using the cleanStr function
    value = cleanStr(value);

    const colorInfo = {
        leaf: { color: [], hex: [] },
        flower: { color: [], hex: [] },
        fruit: { color: [], hex: [] },
        bract: { color: [], hex: [] },
    };

    // Regular expression to match color patterns
    const colorPattern = /(\b(?:leaf|flower|fruit|bract)\b)(?:\s+color)?\s+(.+?)(?=(?:\s+(?:leaf|flower|fruit|bract)\b|$))/gi;

    let match;

    while ((match = colorPattern.exec(value))) {
        const colorType = match[1].toLowerCase();
        const colorDescriptions = match[2].split(/\s*,\s*|\s+/);

        if (colorType && colorDescriptions.length > 0) {
            const validColorNames = colorDescriptions
                .map(name => name.trim())
                .filter(name => name.length > 0 && knownColors.colors.hasOwnProperty(name.toLowerCase()));

            if (validColorNames.length > 0) {
                colorInfo[colorType].color = colorInfo[colorType].color.concat(validColorNames);

                // Map validColorNames to hex values
                const hexCodes = validColorNames.map(name => knownColors.colors[name.toLowerCase()]);
                colorInfo[colorType].hex = colorInfo[colorType].hex.concat(hexCodes);
            }
        }
    }
    return colorInfo;
}

//// Size formula
function size(value) {
    const result = {
        size: {
            metric: {
                value: [],
                units: [],
            },
        },
    };
    if (!value) return result;

    const diameterMatch = value.match(/Diameter\D*?\s*([\d.-]+)\s*(cm|mm|m)/i);
    const heightMatch = value.match(/Height\D*?\s*([\d.-]+)\s*(cm|mm|m)/i);

    if (diameterMatch) {
        const numericValue = parseFloat(cleanStr(diameterMatch[1]));
        const unit = cleanStr(diameterMatch[2]);
        result.size.metric.value.push(numericValue);
        result.size.metric.units.push(unit);
    }
    if (!diameterMatch) {
        const numericValue = null;
        const unit = null;
        result.size.metric.value.push(numericValue);
        result.size.metric.units.push(unit);
    }
    if (heightMatch) {
        const numericValue = parseFloat(cleanStr(heightMatch[1]));
        const unit = cleanStr(heightMatch[2]);
        result.size.metric.value.push(numericValue);
        result.size.metric.units.push(unit);
    }
    if (!heightMatch) {
        const numericValue = null;
        const unit = null;
        result.size.metric.value.push(numericValue);
        result.size.metric.units.push(unit);
    }
    return result.blooming;
}

fs.createReadStream('PlantDB.csv')
    .pipe(csv())
    .on('data', (data) => {

        // General info
        data.image = cleanStr(data.image);
        data.origin = cleanStr(data.origin);
        data.production = cleanStr(data.production);

        data.blooming = blooming(data.blooming);

        // Extract color data for this entry
        const colorInfo = extractColors(data.color);

        // data.leaf_color = cleanStr(data.leaf_color);
        // data.flower_color = cleanStr(data.flower_color);
        // data.fruit_color = cleanStr(data.fruit_color);
        // data.bract_color = cleanStr(data.bract_color);

        data.size = size(data.size);

        //// Add the updated data to the results array
        results.push({
            scientific_name: cleanStr(data.scientific_name),
            general: {
                image: cleanStr(data.image),
                origin: cleanStr(data.origin),
                production: cleanStr(data.production),
                // plant_type: cleanStr(data.plant_type),
                blooming: data.blooming,
                colors: colorInfo,
                size: cleanStr(data.size),
            },
        });
    })
    .on('end', () => {
        // Create a JSON file with the updated data
        fs.writeFileSync('general.json', JSON.stringify(results, null, 2));
        console.log('JSON file created.');
    });
