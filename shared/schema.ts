import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("available"), // available, busy, offline
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  location: text("location"), // neighborhood name (legacy field)
  regionId: text("region_id"), // region ID from locations data
  cityId: text("city_id"), // city ID from locations data
  neighborhoodId: text("neighborhood_id"), // neighborhood ID from locations data
  lastUpdate: timestamp("last_update").defaultNow(),
  customerId: text("customer_id"), // when assigned to a customer
  customerName: text("customer_name"), // customer name when busy
  languages: text("languages").array().default([]), // اللغات التي يتحدث بها
  trainingCourses: text("training_courses").array().default([]), // الدورات التدريبية
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  lastUpdate: true,
});

export const updateEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
}).partial();

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
