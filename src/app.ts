import express from 'express';
import riskRoutes from './routes/v1/risk';
import searchRoutes from './routes/v1/search';

const app = express();

app.use(express.json());
app.use('/companies/search', searchRoutes);
app.use('/risk-assessment', riskRoutes);

export default app;