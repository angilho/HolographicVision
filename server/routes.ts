import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for media files
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedMediaTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'video/mp4',
      'video/webm'
    ];
    
    const allowedAudioTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];
    
    if (file.fieldname === 'media') {
      if (allowedMediaTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid media file type. Please upload a JPG, PNG, GIF, or MP4 file.'));
      }
    } else if (file.fieldname === 'audio') {
      if (allowedAudioTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid audio file type. Please upload an MP3 or WAV file.'));
      }
    } else {
      cb(null, false);
    }
  }
});

// Serve the pyramid template
const serveTemplate = (app: Express) => {
  // Ensure the public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Create pyramid template SVG if it doesn't exist
  const templatePath = path.join(publicDir, 'pyramid-template.svg');
  if (!fs.existsSync(templatePath)) {
    const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800px" height="800px" viewBox="0 0 800 800" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <title>Hologram Pyramid Template</title>
  <defs>
    <style>
      .cut-line { stroke: #000000; stroke-width: 2; }
      .fold-line { stroke: #000000; stroke-width: 1; stroke-dasharray: 5,5; }
      .dimension { font-family: Arial; font-size: 14px; fill: #666666; }
      .instruction { font-family: Arial; font-size: 16px; fill: #333333; }
      .title { font-family: Arial; font-size: 24px; fill: #000000; font-weight: bold; }
      .poly-left { fill: rgba(0, 102, 255, 0.1); }
      .poly-right { fill: rgba(0, 102, 255, 0.1); }
      .poly-top { fill: rgba(0, 102, 255, 0.1); }
      .poly-bottom { fill: rgba(0, 102, 255, 0.1); }
    </style>
  </defs>
  <g>
    <!-- Title and Instructions -->
    <text x="400" y="60" class="title" text-anchor="middle">Hologram Pyramid Template</text>
    <text x="400" y="90" class="instruction" text-anchor="middle">Print at 100% scale on transparent plastic sheet, cut along solid lines, fold along dotted lines</text>
    
    <!-- Pyramid base size info -->
    <text x="400" y="120" class="instruction" text-anchor="middle">Base Width: Approximately 6 inches (15 cm) - Adjustable to your device size</text>
    
    <!-- Four triangles for a square pyramid -->
    <!-- Bottom triangle -->
    <polygon points="400,400 250,600 550,600" class="poly-bottom" />
    <line x1="400" y1="400" x2="250" y2="600" class="cut-line" />
    <line x1="400" y1="400" x2="550" y2="600" class="cut-line" />
    <line x1="250" y1="600" x2="550" y2="600" class="cut-line" />
    
    <!-- Top triangle -->
    <polygon points="400,400 250,200 550,200" class="poly-top" />
    <line x1="400" y1="400" x2="250" y2="200" class="cut-line" />
    <line x1="400" y1="400" x2="550" y2="200" class="cut-line" />
    <line x1="250" y1="200" x2="550" y2="200" class="cut-line" />
    
    <!-- Left triangle -->
    <polygon points="400,400 200,250 200,550" class="poly-left" />
    <line x1="400" y1="400" x2="200" y2="250" class="cut-line" />
    <line x1="400" y1="400" x2="200" y2="550" class="cut-line" />
    <line x1="200" y1="250" x2="200" y2="550" class="cut-line" />
    
    <!-- Right triangle -->
    <polygon points="400,400 600,250 600,550" class="poly-right" />
    <line x1="400" y1="400" x2="600" y2="250" class="cut-line" />
    <line x1="400" y1="400" x2="600" y2="550" class="cut-line" />
    <line x1="600" y1="250" x2="600" y2="550" class="cut-line" />
    
    <!-- Fold lines from center -->
    <line x1="400" y1="400" x2="400" y2="700" class="fold-line" />
    <line x1="400" y1="400" x2="400" y2="100" class="fold-line" />
    <line x1="400" y1="400" x2="100" y2="400" class="fold-line" />
    <line x1="400" y1="400" x2="700" y2="400" class="fold-line" />
    
    <!-- Assembly instructions -->
    <text x="400" y="720" class="instruction" text-anchor="middle">Assembly: Cut along solid lines, fold along dotted lines to form a pyramid</text>
    <text x1="400" y1="745" class="instruction" text-anchor="middle">Place on your device with the hologram video playing</text>
    
    <!-- Dimensions -->
    <text x="370" y="500" class="dimension">Height</text>
    <text x="500" y="380" class="dimension">Width</text>
  </g>
</svg>`;
    
    fs.writeFileSync(templatePath, svgContent);
  }
  
  // Serve the pyramid template
  app.get('/pyramid-template.svg', (req, res) => {
    res.sendFile(templatePath);
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post('/api/hologram', upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.media || !files.media[0]) {
        return res.status(400).json({ message: 'No media file uploaded' });
      }
      
      const mediaFile = files.media[0];
      const audioFile = files.audio ? files.audio[0] : null;
      
      // In a real application, you would process and store these files
      // For now, we'll just return success
      
      res.status(200).json({
        message: 'Files uploaded successfully',
        mediaType: mediaFile.mimetype.startsWith('image/') ? 'image' : 'video',
        hasAudio: !!audioFile
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: 'File upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Serve the pyramid template
  serveTemplate(app);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
