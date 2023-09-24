const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('PlantDB.csv')
    .pipe(csv())
    .on('data', (data) => {

        results.push({
            scientific_name: data.scientific_name,

            // environment - light, temperature, humidity, soil
            environment: {
                light: {
                    mmol: [parseFloat(data.min_light_mmol), parseFloat(data.max_light_mmol)],
                    lux: [parseFloat(data.min_light_lux), parseFloat(data.max_light_lux)],
                },
                temperature: {
                    celsius: [parseFloat(data.min_temp), parseFloat(data.max_temp)],
                },
                humidity: [parseFloat(data.min_env_humid), parseFloat(data.max_env_humid)],
                soil: {
                    moisture: [parseFloat(data.min_soil_moist), parseFloat(data.max_soil_moist)],
                    ec: [parseFloat(data.min_soil_ec), parseFloat(data.max_soil_ec)],
                },
            }
        });
    })
    .on('end', () => {
        // Create a JSON file with the updated data
        fs.writeFileSync('environment.json', JSON.stringify(results, null, 2));
        console.log('JSON file created.');
    });