CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  dob DATE,
  age TEXT,
  sex TEXT,
  "schoolName" TEXT,
  "siblingsName" TEXT,
  "regNo" TEXT,
  occupation TEXT,
  area TEXT,
  "fatherName" TEXT,
  "fatherContact" TEXT,
  "fatherEmail" TEXT,
  "motherName" TEXT,
  "motherContact" TEXT,
  "motherEmail" TEXT,
  "tshirtSize" TEXT,
  "enrollmentDate" DATE,
  "feesPerMonth" TEXT,
  "squadLevel" TEXT,
  "studentSignature" TEXT,
  "declarationDate" DATE,
  "proofType" TEXT,
  "photoUrl" TEXT,
  "proofUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "feesDate" DATE,
  "lastPaidMonth" TEXT,
  "paidMonthsCount" INTEGER DEFAULT 0,
  "remarks" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'coach',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (Phone: 9363141888, Password: Admin@2025$)
INSERT INTO users (phone, password, name, role) 
VALUES ('9363141888', 'Admin@2025$', 'Academy Admin', 'admin')
ON CONFLICT (phone) DO NOTHING;

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  "registrationId" INTEGER NOT NULL REFERENCES registrations(id),
  "item" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "totalPrice" NUMERIC NOT NULL,
  "purchaseDate" DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "data" TEXT,
  "courtNumber" TEXT,
  "paymentDetails" TEXT,
  "earnings" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
