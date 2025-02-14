import expres from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ApiError } from '../src/utils/ApiError.js';

const app = expres();

app.use(
  cors({
    origin: process.env.CORS_0RIGIN,
    credentials: true,
  })
);

app.use(expres.json({ limit: '50kb' }));
app.use(expres.urlencoded({ extended: true, limit: '50kb' }));
app.use(expres.static('public'));
app.use(cookieParser());
app.use(morgan('dev'));

//routes

import userRouter from './routes/user.routes.js';
import userAdminRouter from './routes/user_admin.routes.js';
import clientRouter from './routes/client.routes.js';
import projectSectionRouter from './routes/projectSection.routes.js';
import attendanceRecordsRouter from './routes/attandance_records.routes.js';
import holidayRouter from './routes/holiday.routes.js';
import bonusRouter from './routes/bonus.routes.js';
import reimbushmentRouter from './routes/reimbushment.routes.js';
// import userDocumentRouter from './routes/userDocument.routes.js';

//routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/client', clientRouter);
app.use('/api/v1/project-section', projectSectionRouter);
app.use('/api/v1/attandance-records', attendanceRecordsRouter);
app.use('/api/v1/holiday', holidayRouter);
app.use('/api/v1/bonus', bonusRouter);
app.use('/api/v1/reimbushment', reimbushmentRouter);
// app.use('/api/v1/user-document', userDocumentRouter);


app.use('/api/v1/user-admin', userAdminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode || 500).json({
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      data: null,
      success: err.success,
    });
  } else {
    console.error(err); // Log unexpected errors
    return res.status(500).json({
      statusCode: 500,
      message: 'An unexpected error occurred',
      errors: [],
      data: null,
      success: false,
    });
  }
});

export { app };
