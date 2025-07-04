import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, updateEmployeeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateEmployeeSchema.parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  app.get("/api/employees/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const employees = await storage.getEmployeesByStatus(status);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees by status" });
    }
  });

  app.put("/api/employees/:id/location", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude, location } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const employee = await storage.updateEmployeeLocation(id, latitude, longitude, location);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee location" });
    }
  });

  // Employee assignment route
  app.put("/api/employees/:id/assign", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { customerId, customerName } = req.body;

      if (!customerId || !customerName) {
        return res.status(400).json({ message: "Customer ID and name are required" });
      }

      const employee = await storage.updateEmployee(id, {
        status: "busy",
        customerId,
        customerName,
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign employee" });
    }
  });

  // Employee status update route
  app.put("/api/employees/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!["available", "busy", "offline"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updateData: any = { status };
      
      // Clear customer assignment if status is not busy
      if (status !== "busy") {
        updateData.customerId = null;
        updateData.customerName = null;
      }

      const employee = await storage.updateEmployee(id, updateData);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
