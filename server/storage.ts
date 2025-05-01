import { mediaFiles, users, type User, type InsertUser, type MediaFile, type InsertMediaFile } from "@shared/schema";

// Storage interface for our application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Media file methods
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile>;
  listMediaFiles(limit: number): Promise<MediaFile[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mediaFilesStore: Map<number, MediaFile>;
  private userCurrentId: number;
  private mediaCurrentId: number;

  constructor() {
    this.users = new Map();
    this.mediaFilesStore = new Map();
    this.userCurrentId = 1;
    this.mediaCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Media file methods
  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    return this.mediaFilesStore.get(id);
  }
  
  async createMediaFile(insertMediaFile: InsertMediaFile): Promise<MediaFile> {
    const id = this.mediaCurrentId++;
    const mediaFile: MediaFile = { ...insertMediaFile, id };
    this.mediaFilesStore.set(id, mediaFile);
    return mediaFile;
  }
  
  async listMediaFiles(limit: number): Promise<MediaFile[]> {
    return Array.from(this.mediaFilesStore.values())
      .sort((a, b) => b.id - a.id) // Sort by ID descending (newest first)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
