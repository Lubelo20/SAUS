import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const DOC_DIR = path.join(process.env.UPLOAD_DIR || './uploads', 'documents');
fs.mkdirSync(DOC_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOC_DIR),
  filename: (_req, file, cb) => { cb(null, `${uuid()}${path.extname(file.originalname)}`); },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /pdf|msword|vnd\.openxmlformats/.test(file.mimetype);
    cb(null, ok);
  },
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const where: any = {};
  if (category) where.categoryId = category;
  if (search) where.title = { contains: String(search), mode: 'insensitive' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    prisma.document.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } }, category: true } }),
    prisma.document.count({ where }),
  ]);
  const base = process.env.APP_URL || 'http://localhost:4000';
  const items = data.map(d => ({ ...d, url: `${base}/uploads/documents/${d.filename}` }));
  return res.json({ data: items, total });
});

router.post('/upload', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING', 'MEDIA', 'EDITOR'),
  upload.single('file'), async (req: AuthRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { title, description, categoryId, version, isPublic, expiresAt } = req.body;
    const doc = await prisma.document.create({
      data: { title, description, filename: req.file.filename, url: req.file.filename,
        mimeType: req.file.mimetype, size: req.file.size,
        version: version || '1.0', isPublic: isPublic !== 'false',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        categoryId: categoryId || null, uploadedById: req.user!.id },
    });
    return res.status(201).json(doc);
  }
);

router.delete('/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'EDITOR'), async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(DOC_DIR, doc.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await prisma.document.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Document deleted' });
});

export default router;
