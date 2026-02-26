import { pgTable, serial, text, timestamp, date, boolean } from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
    id: serial("id").primaryKey(),
    type: text("type").notNull(), // 'student' or 'member'
    studentName: text("studentName").notNull(),
    dob: date("dob"),
    age: text("age"),
    sex: text("sex"),
    nationality: text("nationality"),
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
    sessionsPerMonth: text("sessionsPerMonth"),
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
    createdAt: timestamp("createdAt").defaultNow(),
});
