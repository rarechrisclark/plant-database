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

// 'size' column contains both height and diameter information
function extractHeightDiameter(value) {
    const result = { diameter: null, height: null };

    if (!value) return result;

    // Match any numeric value, special characters (≥, >, <), and units (cm, mm, or m).
    const diameterMatch = value.match(/Diameter\D*?\s*([\d.-]+)\s*(cm|mm|m)/i);
    const heightMatch = value.match(/Height\D*?\s*([\d.-]+)\s*(cm|mm|m)/i);

    if (diameterMatch) {
        const numericValue = cleanStr(diameterMatch[1]);
        const unit = cleanStr(diameterMatch[2]);
        result.diameter = `${numericValue} ${unit}`;
    }
    if (heightMatch) {
        const numericValue = cleanStr(heightMatch[1]);
        const unit = cleanStr(heightMatch[2]);
        result.height = `${numericValue} ${unit}`;
    }
    return result;
}

// 'blooming' column contains both flowering and fruiting information
function extractBlooming(value) {
    const result = { flowering_period: null, fruiting_period: null };

    if (!value) return result;

    // Define mappings for the special cases
    // remember that these are Northern Hemisphere seasons
    const bloomingMappings = {
        'mainly in winter and spring': 'December-May',
        'mainly in spring and summer': 'March-August',
        'mainly in summer and autumn': 'June-November',
        'mainly in autumn and winter': 'September-February',
        'winter': 'December-February',
        'spring': 'March-May',
        'summer': 'June-August',
        'autumn': 'September-November',
        'year around': 'January-December',
        'March-June and the end of winter': ['March-June', 'February'],
        'April-June and September-December': ['April-June', 'September-December'],
        'sometimes flowers': 'rarely',
    };

    const monthsRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)/ig;
    const matches = value.match(monthsRegex);

    if (matches && matches.length >= 2) {
        const floweringPeriod = matches.slice(0, 2).join('-');
        const fruitingPeriod = matches.slice(2).join('-');
        result.flowering_period = floweringPeriod || null;
        result.fruiting_period = fruitingPeriod || null;
    }

    return result;
}

// 'color' column contains leaf, flower, fruit, and bract information
function extractColors(value) {
    const result = { leaf_color: null, flower_color: null, fruit_color: null, bract_color: null };

    if (!value) return result;

    // Use regular expression to find color type and names
    const colorPattern = /(\w+)\s+(.+?)(?=(?:,\s+\w+\s+|$))/g;
    let match;

    const excludedWords = ['',',', 'to','a','in','the','mixed', 'concentrated','tender','inside', 'gradually','needle', 'shape','surface','bi','coverd','tomentum','colorLight','fresh','upper','part','colorpurple','mixture','of','rim','bio', 'from', 'with', 'small','emerald', 'pure','pale','tips','turning','crimson', 'scarlet','stripes','turnning', 'spots', 'dark','apex','leaf','dots', 'light', 'or','ï¼\x8Cwill\'','ï¼\x8Cand','ï¼\x8Cflower\'','margin', 'will', 'turn', 'under', 'sufficient', 'adequate', 'sunlight','dotted','striped','speckled','spotted','rose','mainly','with','viola','and','deep','yellowï¼\x8Cfruit', ];

    while ((match = colorPattern.exec(value))) {
        const colorType = match[1].toLowerCase();
        const colorNames = match[2].split(/\s+/).filter(name => {
            const lowerName = name.toLowerCase();
            return lowerName && !excludedWords.includes(lowerName);
        });

        // Check if the colorType is valid
        if (['leaf', 'flower', 'fruit', 'bract'].includes(colorType)) {
            if (!result[`${colorType}_color`]) {
                result[`${colorType}_color`] = [];
            }
            // Remove 'color' from color names and filter out excluded words and empty strings
            const cleanedColorNames = colorNames
                .map(name => name.replace(/color$/i, ''))
                .filter(name => name && !excludedWords.includes(name.toLowerCase()));
            // Add cleaned color names to the appropriate color type
            result[`${colorType}_color`] = result[`${colorType}_color`].concat(cleanedColorNames);
        }
    }

    // Remove trailing commas from color names
    for (const key in result) {
        if (Array.isArray(result[key])) {
            result[key] = result[key].map(name => name.replace(/,$/, ''));
            if (result[key].length === 0) {
                result[key] = null; // Remove empty arrays
            } else if (result[key].length === 1) {
                result[key] = result[key][0]; // Convert single-item arrays to single values
            }
        }
    }

    return result;
}

fs.createReadStream('PlantDB.csv')
    .pipe(csv())
    .on('data', (data) => {
        // 'category - family, genus'
        const categoryParts = data.category.split(', ');
        data.family = categoryParts[0];
        data.genus = categoryParts[1];
        delete data.category; // Remove the original "category" column

        // 'size - height, diameter'
        const sizeInfo = extractHeightDiameter(data.size);
        data.diameter = cleanStr(sizeInfo.diameter);
        data.height = cleanStr(sizeInfo.height);

        // 'blooming - flowering_period, fruiting_period'
        const bloomingInfo = extractBlooming(data.blooming);
        data.flowering_period = cleanStr(bloomingInfo.flowering_period);
        data.fruiting_period = cleanStr(bloomingInfo.fruiting_period);

        // 'color - leaf_color, flower_color, fruit_color, bract_color'
        const colorInfo = extractColors(data.color);
        data.leaf_color = cleanStr(colorInfo.leaf_color);
        data.flower_color = cleanStr(colorInfo.flower_color);
        data.fruit_color = cleanStr(colorInfo.fruit_color);
        data.bract_color = cleanStr(colorInfo.bract_color);

        results.push({
            scientific_name: cleanStr(data.scientific_name),
            display_name: cleanStr(data.display_name),
            alias: cleanStr(data.alias),
            // category
            family: cleanStr(data.family),
            genus: cleanStr(data.genus),
            image: cleanStr(data.image),
            origin: cleanStr(data.origin),
            production: cleanStr(data.production),
            ...extractHeightDiameter(data.size),
            ...extractBlooming(data.blooming),
            ...extractColors(data.color),
            //// plant care
            soil: cleanStr(data.soil),
            sunlight: cleanStr(data.sunlight),
            watering: cleanStr(data.watering),
            fertilization: cleanStr(data.fertilization),
            pruning: cleanStr(data.pruning),
            // light
            max_light_mmol: cleanStr(data.max_light_mmol),
            min_light_mmol: cleanStr(data.min_light_mmol),
            max_light_lux: cleanStr(data.max_light_lux),
            min_light_lux: cleanStr(data.min_light_lux),
            // temperature
            max_temp: cleanStr(data.max_temp),
            min_temp: cleanStr(data.min_temp),
            // humidity
            max_env_humid: cleanStr(data.max_env_humid),
            min_env_humid: cleanStr(data.min_env_humid),
            // soil moisture and EC
            max_soil_moist: cleanStr(data.max_soil_moist),
            min_soil_moist: cleanStr(data.min_soil_moist),
            max_soil_ec: cleanStr(data.max_soil_ec),
            min_soil_ec: cleanStr(data.min_soil_ec),
        });

    })
    .on('end', () => {
        // Create a JSON file with the updated data
        fs.writeFileSync('plant-data.json', JSON.stringify(results, null, 2));
        console.log('JSON file created.');
    });