import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Supplier } from "../models/Supplier.js";
import { Item } from "../models/Item.js";
import { Transaction } from "../models/Transaction.js";
import { AuditLog } from "../models/AuditLog.js";

const usersSeed = [
  { name: "Worker One", email: "worker1@demo.com", password: "password123", role: "worker" },
  { name: "Worker Two", email: "worker2@demo.com", password: "password123", role: "worker" },
  { name: "Admin One", email: "admin1@demo.com", password: "password123", role: "admin" },
  { name: "Admin Two", email: "admin2@demo.com", password: "password123", role: "admin" },
  { name: "Super Admin", email: "superadmin@demo.com", password: "password123", role: "super_admin" },
];

const suppliersSeed = [
  { supplier_id: "SUP101", name: "Tech Source Ltd", contact_person: "Rafiq Islam", phone: "+8801711000001", email: "sales@techsource.com", city: "Dhaka", country: "Bangladesh" },
  { supplier_id: "SUP102", name: "Peripheral Hub", contact_person: "Mahir Rahman", phone: "+8801711000002", email: "contact@peripheralhub.com", city: "Chattogram", country: "Bangladesh" },
  { supplier_id: "SUP103", name: "OfficeGear Traders", contact_person: "Farzana Akter", phone: "+8801711000003", email: "support@officegear.com", city: "Khulna", country: "Bangladesh" },
  { supplier_id: "SUP104", name: "Network Plus", contact_person: "Tareq Hasan", phone: "+8801711000004", email: "hello@networkplus.com", city: "Rajshahi", country: "Bangladesh" },
  { supplier_id: "SUP105", name: "Smart Devices BD", contact_person: "Sadia Jahan", phone: "+8801711000005", email: "info@smartdevices.com", city: "Sylhet", country: "Bangladesh" },
  { supplier_id: "SUP106", name: "Prime Components", contact_person: "Nayeem Ahmed", phone: "+8801711000006", email: "orders@primecomponents.com", city: "Dhaka", country: "Bangladesh" },
  { supplier_id: "SUP107", name: "Metro Office Supply", contact_person: "Tanvir Alam", phone: "+8801711000007", email: "sales@metrooffice.com", city: "Gazipur", country: "Bangladesh" },
  { supplier_id: "SUP108", name: "Secure Storage Co", contact_person: "Sharmin Sultana", phone: "+8801711000008", email: "contact@securestorage.com", city: "Narayanganj", country: "Bangladesh" },
  { supplier_id: "SUP109", name: "Compute World", contact_person: "Fahim Karim", phone: "+8801711000009", email: "support@computeworld.com", city: "Mymensingh", country: "Bangladesh" },
  { supplier_id: "SUP110", name: "PowerLink Systems", contact_person: "Rezaul Kabir", phone: "+8801711000010", email: "service@powerlink.com", city: "Rangpur", country: "Bangladesh" },
  { supplier_id: "SUP111", name: "SignalNet Imports", contact_person: "Nabila Noor", phone: "+8801711000011", email: "hello@signalnet.com", city: "Barishal", country: "Bangladesh" },
  { supplier_id: "SUP112", name: "Delta Industrial Supply", contact_person: "Hasib Chowdhury", phone: "+8801711000012", email: "sales@deltasupply.com", city: "Cumilla", country: "Bangladesh" },
];

const itemsSeedRaw = [
  { item_id: "ITM101", name: "Laptop", category: "Computing", quantity: 18, unit: "pcs", price: 850, reorder_level: 8 },
  { item_id: "ITM102", name: "Keyboard", category: "Accessories", quantity: 42, unit: "pcs", price: 22, reorder_level: 10 },
  { item_id: "ITM103", name: "Mouse", category: "Accessories", quantity: 55, unit: "pcs", price: 14, reorder_level: 15 },
  { item_id: "ITM104", name: "Printer", category: "Office", quantity: 6, unit: "pcs", price: 210, reorder_level: 5 },
  { item_id: "ITM105", name: "Router", category: "Networking", quantity: 11, unit: "pcs", price: 90, reorder_level: 7 },
  { item_id: "ITM106", name: "LED Monitor", category: "Display", quantity: 9, unit: "pcs", price: 185, reorder_level: 7 },
  { item_id: "ITM107", name: "Hard Disk", category: "Storage", quantity: 5, unit: "pcs", price: 75, reorder_level: 8 },
  { item_id: "ITM108", name: "Office Chair", category: "Furniture", quantity: 4, unit: "pcs", price: 130, reorder_level: 6 },
  { item_id: "ITM109", name: "Barcode Scanner", category: "Warehouse", quantity: 7, unit: "pcs", price: 160, reorder_level: 6 },
  { item_id: "ITM110", name: "USB Cable", category: "Accessories", quantity: 65, unit: "pcs", price: 6, reorder_level: 20 },
  { item_id: "ITM111", name: "Desktop PC", category: "Computing", quantity: 14, unit: "pcs", price: 620, reorder_level: 6 },
  { item_id: "ITM112", name: "Server Rack", category: "Infrastructure", quantity: 3, unit: "pcs", price: 980, reorder_level: 2 },
  { item_id: "ITM113", name: "Patch Panel", category: "Networking", quantity: 18, unit: "pcs", price: 48, reorder_level: 8 },
  { item_id: "ITM114", name: "Ethernet Cable Cat6", category: "Networking", quantity: 210, unit: "pcs", price: 5, reorder_level: 60 },
  { item_id: "ITM115", name: "Projector", category: "Office", quantity: 5, unit: "pcs", price: 420, reorder_level: 3 },
  { item_id: "ITM116", name: "Whiteboard", category: "Office", quantity: 9, unit: "pcs", price: 75, reorder_level: 4 },
  { item_id: "ITM117", name: "Power Bank", category: "Accessories", quantity: 28, unit: "pcs", price: 34, reorder_level: 12 },
  { item_id: "ITM118", name: "UPS Backup Unit", category: "Power", quantity: 11, unit: "pcs", price: 190, reorder_level: 5 },
  { item_id: "ITM119", name: "Label Printer", category: "Warehouse", quantity: 6, unit: "pcs", price: 175, reorder_level: 4 },
  { item_id: "ITM120", name: "Safety Helmet", category: "Safety", quantity: 35, unit: "pcs", price: 18, reorder_level: 12 },
  { item_id: "ITM121", name: "Hand Gloves", category: "Safety", quantity: 90, unit: "pairs", price: 4, reorder_level: 30 },
  { item_id: "ITM122", name: "Tablet Device", category: "Computing", quantity: 16, unit: "pcs", price: 310, reorder_level: 7 },
  { item_id: "ITM123", name: "External SSD", category: "Storage", quantity: 22, unit: "pcs", price: 120, reorder_level: 8 },
  { item_id: "ITM124", name: "CCTV Camera", category: "Security", quantity: 19, unit: "pcs", price: 95, reorder_level: 7 },
];

const transactionTemplates = itemsSeedRaw.flatMap((item, idx) => [
  ["IN", item.item_id, 10 + (idx % 6) * 3],
  ["OUT", item.item_id, 2 + (idx % 4)],
  ["IN", item.item_id, 6 + (idx % 5) * 2],
  ["OUT", item.item_id, 1 + (idx % 3)],
]);

const runSeed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Supplier.deleteMany({}),
    Item.deleteMany({}),
    Transaction.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const users = await Promise.all(usersSeed.map((payload) => User.create(payload)));
  const suppliers = await Supplier.insertMany(suppliersSeed);
  const userMap = Object.fromEntries(users.map((u) => [u.role, u]));

  const itemsPayload = itemsSeedRaw.map((item, idx) => ({
    ...item,
    description: `${item.name} for warehouse operations`,
    supplier_id: suppliers[idx % suppliers.length]._id,
    warehouse_location: `A-${idx + 1}`,
    status: "active",
    cost_price: Math.max(1, Math.round(item.price * 0.75)),
  }));

  const items = await Item.insertMany(itemsPayload);
  const itemMap = Object.fromEntries(items.map((i) => [i.item_id, i]));

  const transactionsPayload = transactionTemplates.map((tpl, idx) => {
    const [type, itemCode, qty] = tpl;
    const item = itemMap[itemCode];
    const actor = idx % 3 === 0 ? userMap.worker : idx % 2 === 0 ? userMap.admin : userMap.super_admin;

    return {
      transaction_id: `TRX${String(idx + 1).padStart(4, "0")}`,
      item_id: item._id,
      supplier_id: type === "IN" ? item.supplier_id : null,
      type,
      quantity: qty,
      unit_price: item.price,
      total_amount: qty * item.price,
      date: new Date(Date.now() - (transactionTemplates.length - idx) * 24 * 60 * 60 * 1000),
      remarks: `${type} transaction for ${item.name}`,
      performed_by: actor._id,
      performed_by_role: actor.role,
    };
  });

  await Transaction.insertMany(transactionsPayload);

  await AuditLog.insertMany([
    {
      user_id: userMap.super_admin._id,
      user_name: userMap.super_admin.name,
      role: "super_admin",
      action: "SEED_DATABASE",
      module: "system",
      target_id: "seed",
      details: "Expanded academic demo data generated",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: userMap.admin._id,
      user_name: userMap.admin.name,
      role: "admin",
      action: "CREATE_SUPPLIERS",
      module: "suppliers",
      target_id: "bulk",
      details: `${suppliers.length} suppliers seeded`,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: userMap.admin._id,
      user_name: userMap.admin.name,
      role: "admin",
      action: "CREATE_ITEMS",
      module: "inventory",
      target_id: "bulk",
      details: `${items.length} items seeded`,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: userMap.worker._id,
      user_name: userMap.worker.name,
      role: "worker",
      action: "STOCK_IN_ENTRY",
      module: "transactions",
      target_id: "bulk",
      details: "Initial stock-in transactions created",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: userMap.worker._id,
      user_name: userMap.worker.name,
      role: "worker",
      action: "STOCK_OUT_ENTRY",
      module: "transactions",
      target_id: "bulk",
      details: "Dispatch transactions created",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      user_id: userMap.super_admin._id,
      user_name: userMap.super_admin.name,
      role: "super_admin",
      action: "VERIFY_SEED",
      module: "system",
      target_id: "seed",
      details: "Seed data integrity verified",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("Seed completed successfully");
  await mongoose.disconnect();
};

runSeed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.disconnect();
  process.exit(1);
});