import { Holiday } from '../models/holiday.models.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createHoliday = asyncHandler(async (req, res) => {
  const { date, holidayReason } = req.body;
  if (!date || isNaN(new Date(date).getTime()) || !holidayReason) {
    throw new ApiError(400, 'Please provide a valid date and holiday reason');
  }

  const existingHoliday = await Holiday.findOne({ date });
  if (existingHoliday) {
    throw new ApiError(400, 'Holiday with the same date already exists');
  }
  
  const holiday = await Holiday.create({ date, holidayReason });
  return res.status(201).json(new ApiResponse(200, holiday, 'Holiday created successfully'));
});

const updateHoliday = asyncHandler(async (req, res) => {
  const { date, holidayReason } = req.body;
  if (!date || isNaN(new Date(date).getTime()) || !holidayReason) {
    throw new ApiError(400, 'Please provide a valid date and holiday reason');
  }

  const existingHoliday = await Holiday.findOne({ date });
  if (existingHoliday) {
    throw new ApiError(400, 'Holiday with the same date already exists');
  }

  const holiday = await Holiday.findByIdAndUpdate(
    req.params.id,
    { date, holidayReason },
    { new: true } // to return the updated document
  );
  if (!holiday) {
    throw new ApiError(404, 'Holiday not found');
  }
  return res.status(200).json(new ApiResponse(200, holiday, 'Holiday updated successfully'));
});

const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  if (!holiday) {
    throw new ApiError(404, 'Holiday not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Holiday deleted successfully'));
});


const getAllHolidays = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  let startDate = from ? new Date(from) : new Date();
  let endDate = to ? new Date(to) : new Date();

  // If no 'from' parameter is given, set the start date to Jan 1 of the current year.
  if (!from) {
    startDate = new Date(startDate.getFullYear(), 0, 1);  // Jan 1 of current year
  }

  // If no 'to' parameter is given, set the end date to Dec 31 of the current year.
  if (!to) {
    endDate = new Date(endDate.getFullYear(), 11, 31);  // Dec 31 of current year
  }

  // Define the filter for the date range.
  const filter = {
    date: {
      $gte: startDate,  // greater than or equal to startDate
      $lte: endDate     // less than or equal to endDate
    },
  };

  // Fetch holidays within the date range.
  const holidays = await Holiday.find(filter);
  
  // Respond with the holidays.
  return res.status(200).json(new ApiResponse(200, holidays, 'Holidays fetched successfully'));
});

const getHolidayById = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);
  if (!holiday) {
    throw new ApiError(404, 'Holiday not found');
  }
  return res.status(200).json(new ApiResponse(200, holiday, 'Holiday fetched successfully'));
});


export {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday
};
