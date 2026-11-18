-- CreateTable
CREATE TABLE "Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plateNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'TENT',
    "driverId" INTEGER,
    "phone" TEXT NOT NULL DEFAULT '',
    "capacityTons" REAL NOT NULL DEFAULT 22,
    "volumeM3" REAL NOT NULL DEFAULT 92,
    "currentLocation" TEXT NOT NULL DEFAULT '',
    "destination" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT NOT NULL DEFAULT '',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseCategories" TEXT NOT NULL DEFAULT 'B,C,E',
    "experienceYears" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cargoType" TEXT NOT NULL DEFAULT 'Quruq yuk',
    "loadingAddress" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "weightTons" REAL NOT NULL,
    "volumeM3" REAL NOT NULL DEFAULT 82,
    "loadingDate" DATETIME NOT NULL,
    "unloadingDate" DATETIME NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL DEFAULT '',
    "vehicleId" INTEGER,
    "driverId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cargo_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cargo_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tripCode" TEXT NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "cargoId" INTEGER,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "loadingDate" DATETIME NOT NULL,
    "unloadingDate" DATETIME NOT NULL,
    "freightPrice" REAL NOT NULL DEFAULT 0,
    "distanceKm" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "ownerName" TEXT NOT NULL DEFAULT 'Jasurbek',
    "companyName" TEXT NOT NULL DEFAULT 'FURA CONTROL',
    "roleTitle" TEXT NOT NULL DEFAULT 'Bosh dispetcher',
    "phone" TEXT NOT NULL DEFAULT '+998 90 123 45 67',
    "email" TEXT NOT NULL DEFAULT 'dispatch@furacontrol.uz',
    "language" TEXT NOT NULL DEFAULT 'uz',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD.MM.YYYY',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sidebarCompact" BOOLEAN NOT NULL DEFAULT false,
    "showSimulatedGps" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleType_idx" ON "Vehicle"("vehicleType");

-- CreateIndex
CREATE INDEX "Vehicle_isDeleted_idx" ON "Vehicle"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "Driver"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_code_key" ON "Cargo"("code");

-- CreateIndex
CREATE INDEX "Cargo_status_idx" ON "Cargo"("status");

-- CreateIndex
CREATE INDEX "Cargo_loadingDate_idx" ON "Cargo"("loadingDate");

-- CreateIndex
CREATE INDEX "Cargo_unloadingDate_idx" ON "Cargo"("unloadingDate");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_tripCode_key" ON "Trip"("tripCode");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "Trip_vehicleId_idx" ON "Trip"("vehicleId");

-- CreateIndex
CREATE INDEX "Trip_loadingDate_idx" ON "Trip"("loadingDate");

-- CreateIndex
CREATE INDEX "Trip_unloadingDate_idx" ON "Trip"("unloadingDate");
