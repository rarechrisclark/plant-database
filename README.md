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

### Final Plant Object (.json) structure

```json
{
  "taxonomy": {
    "kingdom": "Plantae",
    "phylum": "Tracheophyta",
    "class": "Magnoliopsida",
    "order": "Lamiales",
    "family": "Lamiaceae",
    "genus": "Salvia",
    "species": "Salvia officinalis",
    "variety": "Salvia officinalis 'Berggarten'",
    "cultivar": "Salvia officinalis 'Berggarten'",
    "name": {
        "scientific": "Salvia officinalis 'Berggarten'",
        "common": "Berggarten Sage",
        "display": "Berggarten Sage",
        "alias": ["Berggarten Sage", "Berggarten Sage", "Berggarten Sage"]
    },
    "image": "https://www.gardeningknowhow.com/wp-content/uploads/2019/03/berggarten-sage.jpg",
    "origin": "country",
    "production": "country",
    "category": "Herb"
  },
  
  "general": {
    "blooming": {
      "flowering_period": ["month_start", "month_end"],
      "fruiting_period": ["month_start", "month_end"]
    },
    "colors": {
      "leaf": {
        "color": ["color","color","color"],
        "hex": ["hex","hex","hex"]
      },
      "flower": {
        "color": ["color","color","color"],
        "hex": ["hex","hex","hex"]
      },
      "fruit": {
        "color": ["color","color","color"],
        "hex": ["hex","hex","hex"]
      },
      "bract": {
        "color": ["color","color","color"],
        "hex": ["hex","hex","hex"]
      }
    }
  },
  
  "care": {
    //
  },
  
  "environment": {
    "light": {
      "mmol": ["min_light_mmol", "max_light_mmol"],
        "lux": ["min_light_lux", "max_light_lux"]
    },
    "temperature": {
      "celsius": ["min_temp", "max_temp"]
    },
    "humidity": ["min_env_humid", "max_env_humid"],
    "soil": {
      "moisture": ["min_soil_moist", "max_soil_moist"],
      "ec": ["min_soil_ec", "max_soil_ec"]
    }
  }
}

```