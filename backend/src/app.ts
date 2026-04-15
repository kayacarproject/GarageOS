import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { companyRouter } from './modules/company/company.router';
import { userRouter } from './modules/user/user.router';
import { customerRouter } from './modules/customer/customer.router';
import { vehicleRouter } from './modules/vehicle/vehicle.router';
import { jobCardRouter } from './modules/jobcard/jobcard.router';
import { bookingRouter } from './modules/booking/booking.router';
import { estimateRouter } from './modules/estimate/estimate.router';
import { invoiceRouter } from './modules/invoice/invoice.router';
import { paymentRouter } from './modules/payment/payment.router';
import { errorHandler } from './common/filters/error.filter';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const v1 = '/api/v1';
app.use(`${v1}/auth`, authRouter);
app.use(`${v1}/companies`, companyRouter);
app.use(`${v1}/users`, userRouter);
app.use(`${v1}/customers`, customerRouter);
app.use(`${v1}/vehicles`, vehicleRouter);
app.use(`${v1}/job-cards`, jobCardRouter);
app.use(`${v1}/bookings`, bookingRouter);
app.use(`${v1}/estimates`, estimateRouter);
app.use(`${v1}/invoices`, invoiceRouter);
app.use(`${v1}/payments`, paymentRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'GarageOS API' }));
app.use(errorHandler);

export default app;
