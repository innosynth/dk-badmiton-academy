import { pgTable, serial, text, timestamp, date, boolean, integer, numeric } from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
    id: serial("id").primaryKey(),
    type: text("type").notNull(), // 'student' or 'member'
    studentName: text("studentName").notNull(),
    dob: date("dob"),
    age: text("age"),
    sex: text("sex"),
    schoolName: text("schoolName"),
    siblingsName: text("siblingsName"),
    regNo: text("regNo"),
    occupation: text("occupation"),
    area: text("area"),
    // Parents
    fatherName: text("fatherName"),
    fatherContact: text("fatherContact"),
    fatherEmail: text("fatherEmail"),
    motherName: text("motherName"),
    motherContact: text("motherContact"),
    motherEmail: text("motherEmail"),
    // Office info
    tshirtSize: text("tshirtSize"),
    enrollmentDate: date("enrollmentDate"),
    feesPerMonth: text("feesPerMonth"),
    squadLevel: text("squadLevel"),
    // Declaration
    studentSignature: text("studentSignature"),
    declarationDate: date("declarationDate"),
    proofType: text("proofType"),
    // Files
    photoUrl: text("photoUrl"),
    proofUrl: text("proofUrl"),
    isActive: boolean("isActive").default(true),
    feesDate: date("feesDate"),
    lastPaidMonth: text("lastPaidMonth"),
    paidMonthsCount: integer("paidMonthsCount").default(0),
    remarks: text("remarks"),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    phone: text("phone").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("coach"), // 'admin' or 'coach'
    createdAt: timestamp("createdAt").defaultNow(),
});

export const purchases = pgTable("purchases", {
    id: serial("id").primaryKey(),
    registrationId: integer("registrationId").references(() => registrations.id).notNull(),
    item: text("item").notNull(), // e.g., 'Shuttlecocks'
    quantity: integer("quantity").notNull(),
    totalPrice: numeric("totalPrice").notNull(),
    purchaseDate: date("purchaseDate").notNull().defaultNow(),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const guests = pgTable("guests", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    data: text("data"),
    courtNumber: text("courtNumber"),
    paymentDetails: text("paymentDetails"),
    earnings: text("earnings"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});
