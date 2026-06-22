import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|webm)/;
    cb(null, allowed.test(file.mimetype));
  },
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const { search, albumId, page = 1, limit = 60 } = req.query;
  const where: any = {};
  if (search) where.originalName = { contains: String(search), mode: 'insensitive' };
  if (albumId) where.albumId = albumId;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    prisma.mediaItem.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.mediaItem.count({ where }),
  ]);
  const baseUrl = process.env.APP_URL || 'http://localhost:4400';
  const items = data.map(item => ({ ...item, url: item.url && item.url.startsWith('http') ? item.url : `${baseUrl}/uploads/${item.filename}` }));
  return res.json({ data: items, total });
});

router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  let width: number | undefined, height: number | undefined;
  if (req.file.mimetype.startsWith('image/')) {
    try {
      const meta = await sharp(req.file.path).metadata();
      width = meta.width; height = meta.height;
    } catch {}
  }
  const item = await prisma.mediaItem.create({
    data: {
      filename: req.file.filename, originalName: req.file.originalname,
      url: req.file.filename, mimeType: req.file.mimetype,
      size: req.file.size, width, height,
      type: req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO',
      uploadedById: req.user!.id,
    },
  });
  const baseUrl = process.env.APP_URL || 'http://localhost:4400';
  return res.status(201).json({ ...item, url: item.url && item.url.startsWith('http') ? item.url : `${baseUrl}/uploads/${item.filename}` });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const item = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(UPLOAD_DIR, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await prisma.mediaItem.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Deleted' });
});

export default router;
