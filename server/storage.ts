import { Employee, User, InsertEmployee, UpdateEmployee, InsertUser } from '../shared/schema';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Employee methods
  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: UpdateEmployee): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  getEmployeesByStatus(status: string): Promise<Employee[]>;
  updateEmployeeLocation(id: number, latitude: number, longitude: number, location?: string): Promise<Employee | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private employees: Map<number, Employee>;
  private currentUserId: number;
  private currentEmployeeId: number;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.currentUserId = 1;
    this.currentEmployeeId = 1;
    
    // Initialize with sample employees for Riyadh
    this.initializeSampleEmployees();
  }

  private initializeSampleEmployees() {
    const sampleEmployees: Omit<Employee, 'id'>[] = [
      {
        name: "محمد أحمد",
        phone: "0501234567",
        status: "available",
        latitude: "24.7136",
        longitude: "46.6753",
        location: "حي النخيل",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "nakheel",
        lastUpdate: new Date(),
        customerId: null,
        customerName: null,
        languages: ["العربية", "الإنجليزية"],
        trainingCourses: ["التسويق الرقمي", "المبيعات"],
      },
      {
        name: "سارة علي",
        phone: "0501234568", 
        status: "busy",
        latitude: "24.7000",
        longitude: "46.6900",
        location: "حي العليا",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "olaya",
        lastUpdate: new Date(),
        customerId: "CUST001",
        customerName: "شركة الاتصالات",
        languages: ["العربية", "الإنجليزية", "الفرنسية"],
        trainingCourses: ["خدمة العملاء", "التسويق"],
      },
      {
        name: "خالد عبدالله",
        phone: "0501234569",
        status: "offline",
        latitude: "24.6877",
        longitude: "46.7219",
        location: "حي الملز",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "malaz",
        lastUpdate: new Date(Date.now() - 3600000), // 1 hour ago
        customerId: null,
        customerName: null,
        languages: ["العربية"],
        trainingCourses: ["المبيعات", "إدارة الوقت"],
      },
      {
        name: "فاطمة محمد",
        phone: "0501234570",
        status: "available",
        latitude: "24.7200",
        longitude: "46.6400",
        location: "حي الروضة",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "rawdah",
        lastUpdate: new Date(),
        customerId: null,
        customerName: null,
        languages: ["العربية", "الإنجليزية"],
        trainingCourses: ["إدارة المشاريع", "التسويق"],
      },
      {
        name: "علي حسن",
        phone: "0501234571",
        status: "busy",
        latitude: "24.7300",
        longitude: "46.6600",
        location: "حي الصحافة",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "sahafa",
        lastUpdate: new Date(),
        customerId: "CUST002",
        customerName: "مؤسسة الخليج",
        languages: ["العربية", "الإنجليزية", "الأردية"],
        trainingCourses: ["المبيعات", "التفاوض"],
      },
      {
        name: "منى سالم",
        phone: "0501234572",
        status: "available",
        latitude: "24.7400",
        longitude: "46.6500",
        location: "حي الياسمين",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "yasmin",
        lastUpdate: new Date(),
        customerId: null,
        customerName: null,
        languages: ["العربية"],
        trainingCourses: ["خدمة العملاء"],
      },
      {
        name: "عمر إبراهيم",
        phone: "0501234573",
        status: "busy",
        latitude: "24.7500",
        longitude: "46.6700",
        location: "حي الحمراء",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "hamra",
        lastUpdate: new Date(),
        customerId: "CUST003",
        customerName: "شركة البناء",
        languages: ["العربية", "الإنجليزية"],
        trainingCourses: ["التسويق", "المبيعات", "إدارة الوقت"],
      },
      {
        name: "هند عبدالرحمن",
        phone: "0501234574",
        status: "available",
        latitude: "24.7600",
        longitude: "46.6800",
        location: "حي الربيع",
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: "rabee",
        lastUpdate: new Date(),
        customerId: null,
        customerName: null,
        languages: ["العربية", "الإنجليزية", "الفرنسية"],
        trainingCourses: ["إدارة المشاريع", "القيادة"],
      },
    ];

    // Generate 49 additional employees randomly distributed in Riyadh
    const firstNames = ["أحمد", "محمد", "علي", "حسن", "خالد", "عبدالله", "يوسف", "إبراهيم", "عبدالعزيز", "فهد", "سلطان", "ناصر", "سعد", "فيصل", "عبدالرحمن", "طلال", "بندر", "ماجد", "سلمان", "تركي"];
    const femaleFirstNames = ["فاطمة", "عائشة", "خديجة", "زينب", "مريم", "سارة", "نورا", "هند", "ريم", "منى", "أمل", "رانيا", "دانة", "شهد", "لجين", "روان", "غدير", "جود", "لمى", "نهى"];
    const lastNames = ["أحمد", "علي", "محمد", "عبدالله", "السعيد", "الأحمد", "الحربي", "العتيبي", "المطيري", "الدوسري", "القحطاني", "الغامدي", "الزهراني", "الشهري", "عسيري", "الثقفي", "البقمي", "الجهني", "العوفي", "السلمي"];
    const neighborhoods = [
      { name: "حي العليا", id: "olaya", lat: 24.7000, lng: 46.6900 },
      { name: "حي الملز", id: "malaz", lat: 24.6877, lng: 46.7219 },
      { name: "حي النخيل", id: "nakheel", lat: 24.7136, lng: 46.6753 },
      { name: "حي الروضة", id: "rawdah", lat: 24.7200, lng: 46.6400 },
      { name: "حي الصحافة", id: "sahafa", lat: 24.7300, lng: 46.6600 },
      { name: "حي الياسمين", id: "yasmin", lat: 24.7400, lng: 46.6500 },
      { name: "حي الحمراء", id: "hamra", lat: 24.7500, lng: 46.6700 },
      { name: "حي السليمانية", id: "sulaymaniyah", lat: 24.6900, lng: 46.6800 },
      { name: "حي المرسلات", id: "mursalat", lat: 24.7100, lng: 46.6200 },
      { name: "حي القادسية", id: "qadisiyah", lat: 24.6950, lng: 46.7150 },
      { name: "حي النرجس", id: "narjis", lat: 24.7250, lng: 46.6350 },
      { name: "حي الواحة", id: "wahat", lat: 24.7350, lng: 46.6450 },
      { name: "حي الربيع", id: "rabee", lat: 24.7450, lng: 46.6550 },
      { name: "حي الورود", id: "worod", lat: 24.7150, lng: 46.6650 },
      { name: "حي الندى", id: "nada", lat: 24.7050, lng: 46.6750 },
      { name: "حي الفلاح", id: "falah", lat: 24.6850, lng: 46.6850 },
      { name: "حي الخليج", id: "khaleej", lat: 24.6750, lng: 46.6950 },
      { name: "حي البديعة", id: "badeea", lat: 24.7550, lng: 46.6250 },
      { name: "حي الغدير", id: "ghadeer", lat: 24.7650, lng: 46.6150 },
      { name: "حي المونسية", id: "munsiyah", lat: 24.7750, lng: 46.6050 },
      { name: "حي قرطبة", id: "qurtuba", lat: 24.7850, lng: 46.5950 },
      { name: "حي الرمال", id: "ramal", lat: 24.7950, lng: 46.5850 },
      { name: "حي النسيم", id: "naseem", lat: 24.8050, lng: 46.5750 },
      { name: "حي الروابي", id: "rawabi", lat: 24.8150, lng: 46.5650 }
    ];
    const languages = [
      ["العربية"],
      ["العربية", "الإنجليزية"],
      ["العربية", "الإنجليزية", "الفرنسية"],
      ["العربية", "الأردية"],
      ["العربية", "الإنجليزية", "الأردية"],
      ["العربية", "التركية"],
      ["العربية", "الإنجليزية", "الألمانية"]
    ];
    const courses = [
      ["خدمة العملاء"],
      ["المبيعات"],
      ["التسويق الرقمي"],
      ["إدارة المشاريع"],
      ["التفاوض"],
      ["المبيعات", "خدمة العملاء"],
      ["التسويق", "المبيعات"],
      ["إدارة الوقت", "القيادة"],
      ["التسويق الرقمي", "وسائل التواصل"],
      ["المبيعات", "التفاوض", "إدارة العملاء"]
    ];
    const statuses = ["available", "busy", "offline"];
    const companies = ["شركة الاتصالات", "مؤسسة الخليج", "شركة البناء", "مجموعة الرياض", "شركة الصناعات", "مؤسسة التجارة", "شركة التقنية", "مجموعة الاستثمار"];

    // Add employees for specific Riyadh neighborhoods requested by user
    const specificNeighborhoods = [
      { name: "حي المونسية", id: "munsiyah", lat: 24.7750, lng: 46.6050 },
      { name: "حي قرطبة", id: "qurtuba", lat: 24.7850, lng: 46.5950 },
      { name: "حي الرمال", id: "ramal", lat: 24.7950, lng: 46.5850 },
      { name: "حي النسيم", id: "naseem", lat: 24.8050, lng: 46.5750 },
      { name: "حي الروابي", id: "rawabi", lat: 24.8150, lng: 46.5650 }
    ];

    // Add 2 employees per specific neighborhood (10 total)
    specificNeighborhoods.forEach((neighborhood, idx) => {
      for (let j = 0; j < 2; j++) {
        const isFemale = Math.random() > 0.5;
        const firstName = isFemale ? femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)] : firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isBusy = status === "busy";
        
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lngOffset = (Math.random() - 0.5) * 0.01;

        sampleEmployees.push({
          name: `${firstName} ${lastName}`,
          phone: `05012${(100 + idx * 10 + j).toString().padStart(2, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
          status: status,
          latitude: (neighborhood.lat + latOffset).toFixed(6),
          longitude: (neighborhood.lng + lngOffset).toFixed(6),
          location: neighborhood.name,
          regionId: "riyadh",
          cityId: "riyadh-city",
          neighborhoodId: neighborhood.id,
          lastUpdate: status === "offline" ? new Date(Date.now() - Math.random() * 7200000) : new Date(Date.now() - Math.random() * 1800000),
          customerId: isBusy ? `CUST${String(Math.floor(Math.random() * 999)).padStart(3, '0')}` : null,
          customerName: isBusy ? companies[Math.floor(Math.random() * companies.length)] : null,
          languages: languages[Math.floor(Math.random() * languages.length)],
          trainingCourses: courses[Math.floor(Math.random() * courses.length)],
        });
      }
    });

    // Add employees across all Saudi regions
    const saudiRegions = [
      { name: "مكة المكرمة", id: "makkah", cities: [
        { name: "مكة المكرمة", id: "makkah-city", lat: 21.4225, lng: 39.8262 },
        { name: "جدة", id: "jeddah", lat: 21.4858, lng: 39.1925 },
        { name: "الطائف", id: "taif", lat: 21.2703, lng: 40.4150 }
      ]},
      { name: "المدينة المنورة", id: "medina", cities: [
        { name: "المدينة المنورة", id: "medina-city", lat: 24.4681, lng: 39.6142 },
        { name: "ينبع", id: "yanbu", lat: 24.0896, lng: 38.0618 }
      ]},
      { name: "المنطقة الشرقية", id: "eastern", cities: [
        { name: "الدمام", id: "dammam", lat: 26.4207, lng: 50.0888 },
        { name: "الخبر", id: "khobar", lat: 26.2172, lng: 50.1971 },
        { name: "الأحساء", id: "ahsa", lat: 25.4295, lng: 49.5930 },
        { name: "الجبيل", id: "jubail", lat: 27.0174, lng: 49.6251 }
      ]},
      { name: "عسير", id: "asir", cities: [
        { name: "أبها", id: "abha", lat: 18.2164, lng: 42.5048 },
        { name: "خميس مشيط", id: "khamis", lat: 18.3059, lng: 42.7289 }
      ]},
      { name: "تبوك", id: "tabuk", cities: [
        { name: "تبوك", id: "tabuk-city", lat: 28.3998, lng: 36.5700 }
      ]},
      { name: "حائل", id: "hail", cities: [
        { name: "حائل", id: "hail-city", lat: 27.5114, lng: 41.6900 }
      ]},
      { name: "الحدود الشمالية", id: "northern", cities: [
        { name: "عرعر", id: "arar", lat: 30.9753, lng: 41.0381 }
      ]},
      { name: "جازان", id: "jazan", cities: [
        { name: "جازان", id: "jazan-city", lat: 16.8892, lng: 42.5511 }
      ]},
      { name: "نجران", id: "najran", cities: [
        { name: "نجران", id: "najran-city", lat: 17.4924, lng: 44.1277 }
      ]},
      { name: "الباحة", id: "baha", cities: [
        { name: "الباحة", id: "baha-city", lat: 20.0129, lng: 41.4687 }
      ]},
      { name: "الجوف", id: "jouf", cities: [
        { name: "سكاكا", id: "sakaka", lat: 29.9697, lng: 40.2064 }
      ]},
      { name: "القصيم", id: "qassim", cities: [
        { name: "بريدة", id: "buraidah", lat: 26.3260, lng: 43.9750 },
        { name: "عنيزة", id: "unaizah", lat: 26.0877, lng: 43.9986 }
      ]}
    ];

    // Add 2-4 employees per city in other regions
    saudiRegions.forEach(region => {
      region.cities.forEach(city => {
        const employeeCount = Math.floor(Math.random() * 3) + 2; // 2-4 employees per city
        for (let k = 0; k < employeeCount; k++) {
          const isFemale = Math.random() > 0.5;
          const firstName = isFemale ? femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)] : firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const isBusy = status === "busy";
          
          const latOffset = (Math.random() - 0.5) * 0.02;
          const lngOffset = (Math.random() - 0.5) * 0.02;

          sampleEmployees.push({
            name: `${firstName} ${lastName}`,
            phone: `05013${Math.floor(Math.random() * 900000 + 100000)}`,
            status: status,
            latitude: (city.lat + latOffset).toFixed(6),
            longitude: (city.lng + lngOffset).toFixed(6),
            location: city.name,
            regionId: region.id,
            cityId: city.id,
            neighborhoodId: `${city.id}-center`,
            lastUpdate: status === "offline" ? new Date(Date.now() - Math.random() * 7200000) : new Date(Date.now() - Math.random() * 1800000),
            customerId: isBusy ? `CUST${String(Math.floor(Math.random() * 999)).padStart(3, '0')}` : null,
            customerName: isBusy ? companies[Math.floor(Math.random() * companies.length)] : null,
            languages: languages[Math.floor(Math.random() * languages.length)],
            trainingCourses: courses[Math.floor(Math.random() * courses.length)],
          });
        }
      });
    });

    for (let i = 9; i <= 40; i++) {
      const isFemale = Math.random() > 0.6;
      const firstName = isFemale ? femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)] : firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isBusy = status === "busy";
      
      // Add random offset to neighborhood coordinates (±0.01 degrees ≈ ±1km)
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;

      sampleEmployees.push({
        name: `${firstName} ${lastName}`,
        phone: `05012345${String(i).padStart(2, '0')}`,
        status: status,
        latitude: (neighborhood.lat + latOffset).toFixed(6),
        longitude: (neighborhood.lng + lngOffset).toFixed(6),
        location: neighborhood.name,
        regionId: "riyadh",
        cityId: "riyadh-city",
        neighborhoodId: neighborhood.id,
        lastUpdate: status === "offline" ? new Date(Date.now() - Math.random() * 7200000) : new Date(Date.now() - Math.random() * 1800000),
        customerId: isBusy ? `CUST${String(Math.floor(Math.random() * 999)).padStart(3, '0')}` : null,
        customerName: isBusy ? companies[Math.floor(Math.random() * companies.length)] : null,
        languages: languages[Math.floor(Math.random() * languages.length)],
        trainingCourses: courses[Math.floor(Math.random() * courses.length)],
      });
    }

    sampleEmployees.forEach(emp => {
      const employee: Employee = { 
        ...emp, 
        id: this.currentEmployeeId++,
      };
      this.employees.set(employee.id, employee);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const employee: Employee = {
      ...insertEmployee,
      id,
      status: insertEmployee.status || "available",
      lastUpdate: new Date(),
      languages: insertEmployee.languages || [],
      trainingCourses: insertEmployee.trainingCourses || [],
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, updates: UpdateEmployee): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const updatedEmployee: Employee = {
      ...employee,
      ...updates,
      lastUpdate: new Date(),
      id, // Ensure ID is preserved
    };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  async getEmployeesByStatus(status: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.status === status);
  }

  async updateEmployeeLocation(id: number, latitude: number, longitude: number, location?: string): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const updatedEmployee: Employee = {
      ...employee,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      location: location || employee.location,
      lastUpdate: new Date(),
    };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }
}

export const storage = new MemStorage();