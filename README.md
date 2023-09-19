## READ ME

### Installation

1. Clone the repo
2. Run `npm install`

### Plant Database (.csv)

- The plant data is contained in the `PlantDB.csv` file.
- <strong>The csv headers contain:</strong> <br>
scientific_name, display_name, alias,image, floral_language, origin, production, category, <br>
blooming, color, size, soil, sunlight, watering, fertilization, pruning, max_light_mmol, <br>
min_light_mmol, max_light_lux, min_light_lux, max_temp, min_temp, max_env_humid, min_env_humid, <br>
max_soil_moist, min_soil_moist, max_soil_ec, min_soil_ec
- The `PlantDB.csv` file is converted to a .json file using the `convert.js` file.

### Converting the .csv file to a .json file

- The `convert.js` file contains the code to convert the .csv file to a .json file.
- In order to convert the file into a JSON file, run: `node convert.js`