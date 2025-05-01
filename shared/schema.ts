import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  processedUrl: text("processed_url").notNull(),
  mediaType: text("media_type").notNull(), // "image" or "video"
  hasAudio: boolean("has_audio").default(false),
  audioUrl: text("audio_url"),
  createdAt: text("created_at").notNull(), // Using text for date simplicity in this example
});

export const mediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMediaFile = z.infer<typeof mediaFileSchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;

// File upload validation schema
export const fileUploadSchema = z.object({
  mediaType: z.enum(["image", "video"]),
  hasAudio: z.boolean().default(false),
});

// Define the maximum file sizes (in bytes)
export const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB

// Supported file formats
export const SUPPORTED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/gif"];
export const SUPPORTED_VIDEO_FORMATS = ["video/mp4", "video/webm"];
export const SUPPORTED_AUDIO_FORMATS = ["audio/mpeg", "audio/wav", "audio/ogg"];
