import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingSettings = await prisma.applicationSettings.findUnique({ where: { id: 1 } });
  if (!existingSettings) {
    await prisma.applicationSettings.create({
      data: {
        id: 1,
        ownerName: 'Jasurbek',
        companyName: 'FURA CONTROL',
        roleTitle: 'Bosh dispetcher',
        phone: '+998 90 123 45 67',
        email: 'dispatch@furacontrol.uz',
        language: 'uz',
        dateFormat: 'DD.MM.YYYY',
        currency: 'USD',
        sidebarCompact: false,
        showSimulatedGps: true,
      },
    });
  }

  const driverCount = await prisma.driver.count();
  if (driverCount > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        fullName: 'Sobir Rahimov',
        phone: '+998 90 123 45 67',
        licenseNumber: 'UZ-DL-440219',
        licenseCategories: 'B,C,D,E',
        experienceYears: 12,
        status: 'ON_ROUTE',
        notes: 'Xalqaro TIR Carnet va ADR ruxsatnomasi mavjud',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Jasurbek Mahmudov',
        phone: '+998 93 456 78 90',
        licenseNumber: 'UZ-DL-381904',
        licenseCategories: 'B,C,E',
        experienceYears: 9,
        status: 'ON_ROUTE',
        notes: 'Refrijerator reyslar bo‘yicha tajribali',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Farhod Aliyev',
        phone: '+998 91 999 11 22',
        licenseNumber: 'UZ-DL-290411',
        licenseCategories: 'B,C,D,E',
        experienceYears: 14,
        status: 'AVAILABLE',
        notes: 'Yevropa va Rossiya yo‘nalishlari bo‘yicha usta haydovchi',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Alisher Qodirov',
        phone: '+998 97 765 43 21',
        licenseNumber: 'UZ-DL-152088',
        licenseCategories: 'B,C,E',
        experienceYears: 7,
        status: 'RESTING',
        notes: 'Olmaota reysidan qaytgan, dam olishda',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Nodir Bekmurodov',
        phone: '+998 90 555 88 44',
        licenseNumber: 'UZ-DL-510833',
        licenseCategories: 'B,C,D,E',
        experienceYears: 11,
        status: 'AVAILABLE',
        notes: 'Konteyner tashish bo‘yicha mutaxassis',
      },
    }),
    prisma.driver.create({
      data: {
        fullName: 'Rustam Usmonov',
        phone: '+998 94 333 22 11',
        licenseNumber: 'UZ-DL-609215',
        licenseCategories: 'C,E',
        experienceYears: 8,
        status: 'ON_ROUTE',
        notes: 'Qozog‘iston va Rossiya yo‘nalishi',
      },
    }),
  ]);

  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        plateNumber: '01 A 123 UA',
        model: 'Volvo FH16 540',
        vehicleType: 'TENT',
        driverId: drivers[0].id,
        phone: drivers[0].phone,
        capacityTons: 22,
        volumeM3: 92,
        currentLocation: 'Samara (A-300)',
        destination: 'Moskva (Rossiya)',
        status: 'ON_ROUTE',
        notes: 'Euro-6, TIR Carnet faol',
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: '40 B 456 UA',
        model: 'Scania R500 V8',
        vehicleType: 'REF',
        driverId: drivers[1].id,
        phone: drivers[1].phone,
        capacityTons: 24,
        volumeM3: 86,
        currentLocation: 'Pavlodar aylanmasi',
        destination: 'Novosibirsk (Rossiya)',
        status: 'ON_ROUTE',
        notes: 'Refrijerator (-18°C), ThermoKing',
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: '30 C 789 UA',
        model: 'Mercedes Actros 1845',
        vehicleType: 'MEGA',
        driverId: drivers[2].id,
        phone: drivers[2].phone,
        capacityTons: 22,
        volumeM3: 105,
        currentLocation: 'Toshkent (Sergeli)',
        destination: 'Minsk (Belarus)',
        status: 'LOADING',
        notes: 'Mega-treyler, balandligi 3.0m',
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: '50 D 321 UA',
        model: 'MAN TGX 18.480',
        vehicleType: 'TENT',
        driverId: drivers[3].id,
        phone: drivers[3].phone,
        capacityTons: 22,
        volumeM3: 92,
        currentLocation: 'Toshkent Bosh Garaji',
        destination: '—',
        status: 'AVAILABLE',
        notes: 'Texnik ko‘rikdan o‘tgan, navbatdagi reysga tayyor',
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: '01 E 987 UA',
        model: 'DAF XF 480 Space',
        vehicleType: 'KONT',
        driverId: drivers[4].id,
        phone: drivers[4].phone,
        capacityTons: 26,
        volumeM3: 76,
        currentLocation: 'Buxoro terminali',
        destination: '—',
        status: 'AVAILABLE',
        notes: '40ft konteyner platformasi',
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: '80 F 654 UA',
        model: 'Volvo FH 500 I-Save',
        vehicleType: 'TENT',
        driverId: drivers[5].id,
        phone: drivers[5].phone,
        capacityTons: 22,
        volumeM3: 92,
        currentLocation: 'Taraz kirish qismi',
        destination: 'Olmaota (Qozog‘iston)',
        status: 'BUSY',
        notes: 'Muntazam reys',
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: '10 G 777 BA',
        model: 'MAN TGS 33.440',
        vehicleType: 'REF',
        driverId: null,
        phone: '',
        capacityTons: 20,
        volumeM3: 82,
        currentLocation: 'Toshkent Servis Markazi',
        destination: '—',
        status: 'UNDER_REPAIR',
        notes: 'Tormoz tizimi profilaktikasi',
      },
    }),
  ]);

  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const cargos = await Promise.all([
    prisma.cargo.create({
      data: {
        code: '#YK-8821',
        name: 'Tekstil va tayyor trikotaj',
        cargoType: 'Sanoat mollari',
        loadingAddress: 'Toshkent (Sergeli)',
        destinationAddress: 'Moskva (Krasnoselskaya)',
        weightTons: 21.4,
        volumeM3: 88,
        loadingDate: day(-5),
        unloadingDate: day(2),
        price: 4200,
        customerName: 'Orient Logistics LLC',
        customerPhone: '+998 71 200 11 22',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        status: 'IN_TRANSIT',
        notes: '38 palet, CMR #998241',
      },
    }),
    prisma.cargo.create({
      data: {
        code: '#YK-8822',
        name: 'Yangi olma va saralangan mevalar',
        cargoType: 'Tez buziluvchi (Ref)',
        loadingAddress: 'Farg‘ona logistika markazi',
        destinationAddress: 'Novosibirsk (Rossiya)',
        weightTons: 19.8,
        volumeM3: 82,
        loadingDate: day(-3),
        unloadingDate: day(1),
        price: 5100,
        customerName: 'Agro Export Tashkent',
        customerPhone: '+998 71 230 44 55',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        status: 'IN_TRANSIT',
        notes: 'Harorat +4°C nazoratida',
      },
    }),
    prisma.cargo.create({
      data: {
        code: '#YK-8823',
        name: 'Iplar va polimer mahsulotlari',
        cargoType: 'Sanoat mollari',
        loadingAddress: 'Samarqand zavodi',
        destinationAddress: 'Minsk (Belarus)',
        weightTons: 22.0,
        volumeM3: 98,
        loadingDate: day(0),
        unloadingDate: day(6),
        price: 4850,
        customerName: 'SamAuto Trade MCHJ',
        customerPhone: '+998 66 233 99 00',
        vehicleId: vehicles[2].id,
        driverId: drivers[2].id,
        status: 'LOADING',
        notes: 'TIR Carnet rasmiylashtirilmoqda',
      },
    }),
    prisma.cargo.create({
      data: {
        code: '#YK-8824',
        name: 'Maishiy texnika (Artel)',
        cargoType: 'Sanoat mollari',
        loadingAddress: 'Toshkent (Rohat)',
        destinationAddress: 'Olmaota (Qozog‘iston)',
        weightTons: 18.0,
        volumeM3: 86,
        loadingDate: day(-1),
        unloadingDate: day(1),
        price: 2900,
        customerName: 'Artel Electronics',
        customerPhone: '+998 71 148 88 88',
        vehicleId: vehicles[5].id,
        driverId: drivers[5].id,
        status: 'IN_TRANSIT',
        notes: 'Yallama bojxona postidan o‘tgan',
      },
    }),
    prisma.cargo.create({
      data: {
        code: '#YK-8825',
        name: 'Qurilish aralashmalari va gips',
        cargoType: 'Qurilish materiallari',
        loadingAddress: 'Buxoro terminali',
        destinationAddress: 'Qozon (Tatariston)',
        weightTons: 20.5,
        volumeM3: 76,
        loadingDate: day(-12),
        unloadingDate: day(-4),
        price: 4600,
        customerName: 'Knauf Trans Central',
        customerPhone: '+998 65 221 77 00',
        vehicleId: vehicles[4].id,
        driverId: drivers[4].id,
        status: 'DELIVERED',
        notes: 'To‘liq hisob-kitob yopilgan',
      },
    }),
    prisma.cargo.create({
      data: {
        code: '#YK-8826',
        name: 'Metall konstruksiyalar',
        cargoType: 'Qurilish materiallari',
        loadingAddress: 'Toshkent (Chilonzor)',
        destinationAddress: 'Yekaterinburg (Rossiya)',
        weightTons: 21.0,
        volumeM3: 80,
        loadingDate: day(2),
        unloadingDate: day(8),
        price: 4400,
        customerName: 'Global Trans LLC',
        customerPhone: '+998 90 777 66 55',
        vehicleId: null,
        driverId: null,
        status: 'PENDING',
        notes: 'Bo‘sh fura biriktirilishi kutilmoqda',
      },
    }),
  ]);

  await Promise.all([
    prisma.trip.create({
      data: {
        tripCode: '#RS-2026-104',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        cargoId: cargos[0].id,
        origin: 'Toshkent (O‘zbekiston)',
        destination: 'Moskva (Rossiya)',
        loadingDate: day(-5),
        unloadingDate: day(2),
        freightPrice: 4200,
        distanceKm: 3380,
        status: 'ON_ROUTE',
        progressPct: 68,
        notes: 'Mashtakovo bojxona postidan muvaffaqiyatli o‘tdi',
      },
    }),
    prisma.trip.create({
      data: {
        tripCode: '#RS-2026-105',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        cargoId: cargos[1].id,
        origin: 'Farg‘ona (O‘zbekiston)',
        destination: 'Novosibirsk (Rossiya)',
        loadingDate: day(-3),
        unloadingDate: day(1),
        freightPrice: 5100,
        distanceKm: 2850,
        status: 'ON_ROUTE',
        progressPct: 82,
        notes: 'Qulanda nazoratidan o‘tilgan, grafik bo‘yicha harakatda',
      },
    }),
    prisma.trip.create({
      data: {
        tripCode: '#RS-2026-106',
        vehicleId: vehicles[5].id,
        driverId: drivers[5].id,
        cargoId: cargos[3].id,
        origin: 'Toshkent (O‘zbekiston)',
        destination: 'Olmaota (Qozog‘iston)',
        loadingDate: day(-1),
        unloadingDate: day(1),
        freightPrice: 2900,
        distanceKm: 810,
        status: 'ON_ROUTE',
        progressPct: 55,
        notes: 'Yallama postida tezlashtirilgan o‘tish',
      },
    }),
    prisma.trip.create({
      data: {
        tripCode: '#RS-2026-107',
        vehicleId: vehicles[2].id,
        driverId: drivers[2].id,
        cargoId: cargos[2].id,
        origin: 'Samarqand (O‘zbekiston)',
        destination: 'Minsk (Belarus)',
        loadingDate: day(0),
        unloadingDate: day(6),
        freightPrice: 4850,
        distanceKm: 4120,
        status: 'LOADING',
        progressPct: 15,
        notes: 'Samarqand logistika markazida yuklanmoqda',
      },
    }),
    prisma.trip.create({
      data: {
        tripCode: '#RS-2026-103',
        vehicleId: vehicles[4].id,
        driverId: drivers[4].id,
        cargoId: cargos[4].id,
        origin: 'Buxoro (O‘zbekiston)',
        destination: 'Qozon (Tatariston)',
        loadingDate: day(-12),
        unloadingDate: day(-4),
        freightPrice: 4600,
        distanceKm: 2620,
        status: 'COMPLETED',
        progressPct: 100,
        completedAt: day(-4),
        notes: 'Muvaffaqiyatli yakunlandi, CMR imzolandi',
      },
    }),
    prisma.trip.create({
      data: {
        tripCode: '#RS-2026-102',
        vehicleId: vehicles[3].id,
        driverId: drivers[3].id,
        cargoId: null,
        origin: 'Toshkent (O‘zbekiston)',
        destination: 'Ostona (Qozog‘iston)',
        loadingDate: day(-20),
        unloadingDate: day(-14),
        freightPrice: 3100,
        distanceKm: 1650,
        status: 'COMPLETED',
        progressPct: 100,
        completedAt: day(-14),
        notes: 'Arxivlangan reys',
      },
    }),
  ]);

  console.log('Seed completed successfully.');
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
