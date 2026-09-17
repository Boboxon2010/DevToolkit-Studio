import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const app = express();

// 1. Security Headers (XSS, Clickjacking va boshqa hujumlardan himoya)
app.use(helmet());

// 2. CORS Sozlamalari
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Request Body & Payload Parser (Limitlar bilan)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Response Compression (Trafik va tezlikni optimallashtirish)
app.use(compression());

// 5. Logging (HTTP so'rovlar jurnali)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 6. Rate Limiting (DDoS va Brute-Force hujumlardan himoya)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 100, // Har bir IP uchun maksimal 100 so'rov
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng qayta urinib ko'ring."
  }
});
app.use('/api/', limiter);

// 7. Health Check Endpoint (Server va tizim holatini kuzatish)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// 8. API Yo'nalishlari (Routes Integration)
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/users', userRouter);

// 9. 404 Error Handler (Mavjud bo'lmagan yo'nalishlar)
app.use((req, res, next) => {
  const error = new Error(`Mavjud bo'lmagan yo'nalish: ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 10. Global Markazlashgan Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Serverda ichki xatolik yuz berdi',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 11. Graceful Shutdown (Serverni xavfsiz to'xtatish)
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server ${process.env.NODE_ENV || 'development'} rejimida ${PORT}-portda ishlamoqda`);
});

const handleShutdown = (signal) => {
  console.log(`\n${signal} signali qabul qilindi. Server xavfsiz yopilmoqda...`);
  server.close(() => {
    console.log('HTTP server yopildi. Barcha ulanishlar uzildi.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
