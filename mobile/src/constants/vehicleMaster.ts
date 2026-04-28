export interface BrandEntry {
  name: string;
  popular?: boolean;
  models: string[];
}

export const VEHICLE_BRANDS: BrandEntry[] = [
  {
    name: "Maruti Suzuki",
    popular: true,
    models: [
      "Swift",
      "Baleno",
      "Dzire",
      "Alto",
      "Alto K10",
      "Wagon R",
      "Brezza",
      "Ertiga",
      "Celerio",
      "Ignis",
      "S-Cross",
      "XL6",
      "Ciaz",
      "Eeco",
      "Omni",
      "Vitara Brezza",
    ],
  },
  {
    name: "Hyundai",
    popular: true,
    models: [
      "Creta",
      "i20",
      "Venue",
      "Verna",
      "Tucson",
      "i10",
      "Grand i10 Nios",
      "Aura",
      "Alcazar",
      "Ioniq 5",
      "Kona Electric",
      "Santro",
      "Elite i20",
    ],
  },
  {
    name: "Tata",
    popular: true,
    models: [
      "Nexon",
      "Harrier",
      "Safari",
      "Altroz",
      "Tigor",
      "Tiago",
      "Punch",
      "Nexon EV",
      "Tigor EV",
      "Gravitas",
    ],
  },
  {
    name: "Mahindra",
    popular: true,
    models: [
      "Scorpio",
      "Scorpio-N",
      "Thar",
      "XUV700",
      "XUV300",
      "Bolero",
      "KUV100",
      "Marazzo",
      "Alturas G4",
      "BE 6e",
      "XEV 9e",
    ],
  },
  {
    name: "Kia",
    popular: true,
    models: ["Seltos", "Sonet", "Carnival", "EV6", "Carens"],
  },
  {
    name: "Honda",
    popular: true,
    models: ["City", "Amaze", "Jazz", "WR-V", "CR-V", "Elevate"],
  },
  {
    name: "Toyota",
    popular: true,
    models: [
      "Innova Crysta",
      "Innova HyCross",
      "Fortuner",
      "Camry",
      "Glanza",
      "Urban Cruiser Hyryder",
      "Hilux",
      "Land Cruiser",
      "Corolla",
    ],
  },
  {
    name: "Volkswagen",
    popular: false,
    models: ["Polo", "Vento", "Taigun", "Tiguan", "Virtus"],
  },
  {
    name: "Skoda",
    popular: false,
    models: [
      "Rapid",
      "Octavia",
      "Superb",
      "Kushaq",
      "Slavia",
      "Kodiaq",
      "Karoq",
    ],
  },
  {
    name: "Renault",
    popular: false,
    models: ["Kwid", "Triber", "Kiger", "Duster"],
  },
  { name: "Nissan", popular: false, models: ["Magnite", "Kicks", "Terrano"] },
  {
    name: "MG",
    popular: false,
    models: ["Hector", "Hector Plus", "Gloster", "ZS EV", "Astor", "Comet EV"],
  },
  {
    name: "Ford",
    popular: false,
    models: ["EcoSport", "Endeavour", "Figo", "Aspire", "Freestyle"],
  },
  {
    name: "Jeep",
    popular: false,
    models: ["Compass", "Meridian", "Wrangler", "Grand Cherokee"],
  },
  {
    name: "BMW",
    popular: false,
    models: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7"],
  },
  {
    name: "Mercedes-Benz",
    popular: false,
    models: ["A-Class", "C-Class", "E-Class", "GLA", "GLC", "GLE", "S-Class"],
  },
  {
    name: "Audi",
    popular: false,
    models: ["A4", "A6", "Q3", "Q5", "Q7", "Q8"],
  },
  {
    name: "Volvo",
    popular: false,
    models: ["XC40", "XC60", "XC90", "S60", "S90"],
  },
  {
    name: "Land Rover",
    popular: false,
    models: [
      "Defender",
      "Discovery",
      "Freelander",
      "Range Rover",
      "Range Rover Evoque",
      "Range Rover Sport",
    ],
  },
  {
    name: "Porsche",
    popular: false,
    models: ["Cayenne", "Macan", "911", "Panamera", "Taycan"],
  },
  {
    name: "Mitsubishi",
    popular: false,
    models: ["Outlander", "Pajero Sport", "Eclipse Cross"],
  },
  { name: "Isuzu", popular: false, models: ["D-Max", "mu-X"] },
  { name: "Force", popular: false, models: ["Gurkha", "Traveller", "Trax"] },
];

export const POPULAR_BRANDS = VEHICLE_BRANDS.filter((b) => b.popular).map(
  (b) => b.name,
);

export function getModelsForBrand(brand: string): string[] {
  return VEHICLE_BRANDS.find((b) => b.name === brand)?.models ?? [];
}
