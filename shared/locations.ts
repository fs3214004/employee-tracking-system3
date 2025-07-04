// Saudi Arabia regions, cities, and neighborhoods data
export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
}

export interface City {
  id: string;
  name: string;
  regionId: string;
  neighborhoods: Neighborhood[];
}

export interface Region {
  id: string;
  name: string;
  cities: City[];
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export const saudiLocations: Region[] = [
  {
    id: "riyadh",
    name: "منطقة الرياض",
    coordinates: {
      lat: 24.7136,
      lng: 46.6753,
      zoom: 10
    },
    cities: [
      {
        id: "riyadh-city",
        name: "الرياض",
        regionId: "riyadh",
        neighborhoods: [
          { id: "olaya", name: "حي العليا", cityId: "riyadh-city" },
          { id: "malaz", name: "حي الملز", cityId: "riyadh-city" },
          { id: "rawda", name: "حي الروضة", cityId: "riyadh-city" },
          { id: "nakheel", name: "حي النخيل", cityId: "riyadh-city" },
          { id: "sulaimaniya", name: "حي السليمانية", cityId: "riyadh-city" },
          { id: "naseem", name: "حي النسيم", cityId: "riyadh-city" },
          { id: "sahafa", name: "حي الصحافة", cityId: "riyadh-city" },
          { id: "murabba", name: "حي المربع", cityId: "riyadh-city" },
          { id: "batha", name: "حي البطحاء", cityId: "riyadh-city" },
          { id: "yamama", name: "حي اليمامة", cityId: "riyadh-city" },
          { id: "munsiyah", name: "حي المونسية", cityId: "riyadh-city" },
          { id: "qurtuba", name: "حي قرطبة", cityId: "riyadh-city" },
          { id: "ramal", name: "حي الرمال", cityId: "riyadh-city" },
          { id: "rawabi", name: "حي الروابي", cityId: "riyadh-city" },
        ]
      },
      {
        id: "kharj",
        name: "الخرج",
        regionId: "riyadh",
        neighborhoods: [
          { id: "kharj-center", name: "وسط الخرج", cityId: "kharj" },
          { id: "saih", name: "حي السيح", cityId: "kharj" },
          { id: "yamama-kharj", name: "حي اليمامة", cityId: "kharj" },
        ]
      },
      {
        id: "diriyah",
        name: "الدرعية",
        regionId: "riyadh",
        neighborhoods: [
          { id: "turaif", name: "حي طريف", cityId: "diriyah" },
          { id: "ghusaiba", name: "حي الغصيبة", cityId: "diriyah" },
          { id: "bujairi", name: "حي البجيري", cityId: "diriyah" },
        ]
      }
    ]
  },
  {
    id: "qassim",
    name: "منطقة القصيم",
    coordinates: {
      lat: 26.0667,
      lng: 43.9667,
      zoom: 9
    },
    cities: [
      {
        id: "buraidah",
        name: "بريدة",
        regionId: "qassim",
        neighborhoods: [
          { id: "rawabi", name: "حي الروابي", cityId: "buraidah" },
          { id: "salamah", name: "حي السلامة", cityId: "buraidah" },
          { id: "jubail", name: "حي الجبيل", cityId: "buraidah" },
          { id: "sadiq", name: "حي الصديق", cityId: "buraidah" },
          { id: "faruq", name: "حي الفاروق", cityId: "buraidah" },
          { id: "nakheel-buraidah", name: "حي النخيل", cityId: "buraidah" },
          { id: "andalus", name: "حي الأندلس", cityId: "buraidah" },
        ]
      },
      {
        id: "unaizah",
        name: "عنيزة",
        regionId: "qassim",
        neighborhoods: [
          { id: "wassat-unaizah", name: "وسط عنيزة", cityId: "unaizah" },
          { id: "faihaa", name: "حي الفيحاء", cityId: "unaizah" },
          { id: "qadisiyah", name: "حي القادسية", cityId: "unaizah" },
          { id: "sultan", name: "حي السلطان", cityId: "unaizah" },
        ]
      },
      {
        id: "rass",
        name: "الرس",
        regionId: "qassim",
        neighborhoods: [
          { id: "rawdah-rass", name: "حي الروضة", cityId: "rass" },
          { id: "salamah-rass", name: "حي السلامة", cityId: "rass" },
          { id: "wassat-rass", name: "وسط الرس", cityId: "rass" },
        ]
      }
    ]
  },
  {
    id: "makkah",
    name: "منطقة مكة المكرمة",
    coordinates: {
      lat: 21.4225,
      lng: 39.8262,
      zoom: 8
    },
    cities: [
      {
        id: "makkah-city",
        name: "مكة المكرمة",
        regionId: "makkah",
        neighborhoods: [
          { id: "aziziyah", name: "حي العزيزية", cityId: "makkah-city" },
          { id: "misfalah", name: "حي المسفلة", cityId: "makkah-city" },
          { id: "sharaie", name: "حي الشرائع", cityId: "makkah-city" },
          { id: "maabdah", name: "حي المعابدة", cityId: "makkah-city" },
        ]
      },
      {
        id: "jeddah",
        name: "جدة",
        regionId: "makkah",
        neighborhoods: [
          { id: "balad", name: "حي البلد", cityId: "jeddah" },
          { id: "hamra", name: "حي الحمراء", cityId: "jeddah" },
          { id: "salamah-jeddah", name: "حي السلامة", cityId: "jeddah" },
          { id: "corniche", name: "حي الكورنيش", cityId: "jeddah" },
          { id: "rawdah-jeddah", name: "حي الروضة", cityId: "jeddah" },
        ]
      },
      {
        id: "taif",
        name: "الطائف",
        regionId: "makkah",
        neighborhoods: [
          { id: "wassat-taif", name: "وسط الطائف", cityId: "taif" },
          { id: "shafa", name: "حي الشفا", cityId: "taif" },
          { id: "hada", name: "حي الهدا", cityId: "taif" },
        ]
      }
    ]
  },
  {
    id: "eastern",
    name: "المنطقة الشرقية",
    coordinates: {
      lat: 26.4282,
      lng: 50.0647,
      zoom: 8
    },
    cities: [
      {
        id: "dammam",
        name: "الدمام",
        regionId: "eastern",
        neighborhoods: [
          { id: "corniche-dammam", name: "حي الكورنيش", cityId: "dammam" },
          { id: "jalawiya", name: "حي الجلوية", cityId: "dammam" },
          { id: "fanateer", name: "حي الفناتير", cityId: "dammam" },
          { id: "badiyah", name: "حي البادية", cityId: "dammam" },
        ]
      },
      {
        id: "khobar",
        name: "الخبر",
        regionId: "eastern",
        neighborhoods: [
          { id: "aqrabiyah", name: "حي العقربية", cityId: "khobar" },
          { id: "thuqbah", name: "حي الثقبة", cityId: "khobar" },
          { id: "rakah", name: "حي الركة", cityId: "khobar" },
        ]
      },
      {
        id: "jubail",
        name: "الجبيل",
        regionId: "eastern",
        neighborhoods: [
          { id: "fanateer-jubail", name: "حي الفناتير", cityId: "jubail" },
          { id: "danah", name: "حي الدانة", cityId: "jubail" },
          { id: "sinaiyah", name: "المنطقة الصناعية", cityId: "jubail" },
        ]
      }
    ]
  }
];

// Helper functions to get locations
export const getRegions = (): Region[] => saudiLocations;

export const getCitiesByRegion = (regionId: string): City[] => {
  const region = saudiLocations.find(r => r.id === regionId);
  return region ? region.cities : [];
};

export const getNeighborhoodsByCity = (cityId: string): Neighborhood[] => {
  for (const region of saudiLocations) {
    const city = region.cities.find(c => c.id === cityId);
    if (city) {
      return city.neighborhoods;
    }
  }
  return [];
};

export const getRegionById = (regionId: string): Region | undefined => {
  return saudiLocations.find(r => r.id === regionId);
};

export const getCityById = (cityId: string): City | undefined => {
  for (const region of saudiLocations) {
    const city = region.cities.find(c => c.id === cityId);
    if (city) return city;
  }
  return undefined;
};

export const getNeighborhoodById = (neighborhoodId: string): Neighborhood | undefined => {
  for (const region of saudiLocations) {
    for (const city of region.cities) {
      const neighborhood = city.neighborhoods.find(n => n.id === neighborhoodId);
      if (neighborhood) return neighborhood;
    }
  }
  return undefined;
};