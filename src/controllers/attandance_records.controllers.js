import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AttandanceRecord } from '../models/attendance_records.models.js';
import { isValidObjectId } from 'mongoose';
import { ProjectSection } from '../models/projectSection.models.js';
import { User } from '../models/user.models.js';



const createLoginRecord = asyncHandler(async (req, res) => {
    const { projectId , date , loginTime ,loginLat , loginLang , workDetails  } = req.body;
    const employeeId =  req.user?._id;

    if(!(date && loginTime && loginLat && loginLang)) {
        throw new ApiError(400, 'Please provide date, loginTime, loginLat and loginLang');
    }

    if(projectId) {
        const isValidProjectId = await isValidObjectId(projectId);
        if(!isValidProjectId) {
            throw new ApiError(400, 'Plase Provide a Valid Project Id');
        }

        const isProjectExsits = await ProjectSection.findById(projectId);

        if(!isProjectExsits) {
            throw new ApiError(400, 'Plase Provide a Valid Project');
        }

    }


    const isAttandanceExists = await AttandanceRecord.findOne({
        $and : [ {employeeId} , {date}]
    })

    if(isAttandanceExists) {
        throw new ApiError(400, 'Attendance record for this date already exists');
    }

    const attendanceRecord = await AttandanceRecord.create({
        employeeId : employeeId,
        projectId,
        date,
        loginTime,
        loginLat,
        loginLang,
        workDetails
    });

    return res.status(201).json(new ApiResponse(200 , attendanceRecord , "Attandance Created Successfully"));
});

const logoutRecord = asyncHandler(async (req, res) => {
    const { projectId  , logoutTime ,logoutLat , logoutLang , workDetails  } = req.body;
    const employeeId =  req.user?._id;
    const { id } = req.params;

    if(!(logoutTime && logoutLang && logoutLat)) {
        throw new ApiError(400, 'Please provide logoutTime , loguoutLand , logoutLat');
    }

    if(projectId) {
        const isValidProjectId = await isValidObjectId(projectId);
        if(!isValidProjectId) {
            throw new ApiError(400, 'Plase Provide a Valid Project Id');
        }

        const isProjectExsits = await ProjectSection.findById(projectId);

        if(!isProjectExsits) {
            throw new ApiError(400, 'Plase Provide a Valid Project');
        }

    }

    const isValidId = await isValidObjectId(id);

    if(!isValidId) {
        throw new ApiError(400 , "Plase Provide a Valid Id");
    }


    const isREcordExists = await AttandanceRecord.findById(id);

    if(!isREcordExists) {
        throw new ApiError(400 , "No REcord Found With Id");
    }

    if(!(req.user?._id?.toString() == isREcordExists?.employeeId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }

    const updateAttendanceRecord =  await AttandanceRecord.findByIdAndUpdate(id , {
        employeeId,
        projectId,
        logoutTime,
        logoutLat,
        logoutLang,
        workDetails
    } , {
        new: true
    })
    return res.status(201).json(new ApiResponse(200 , updateAttendanceRecord , "Attandance Updated"));
});

const customUpdateAttendanceRecord = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { projectId , date , loginTime , loginLat , loginLang , logoutLat , logoutLang ,logoutTime ,workDetails  } = req.body;
    const isValidId = await isValidObjectId(id);

    if(!isValidId) {
        throw new ApiError(400 , "Plase Provide a Valid Id");
    }

    const isREcordExists = await AttandanceRecord.findById(id);
    if(!isREcordExists) {
        throw new ApiError(400 , "No REcord Found With Id");
    }

    if(!(req.user?._id?.toString() == isREcordExists?.employeeId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }

    const updateAttendanceRecord =  await AttandanceRecord.findByIdAndUpdate(id , {
        projectId,
        date,
        loginTime,
        loginLat,
        loginLang,
        logoutLat,
        logoutLang,
        logoutTime,
        workDetails
    },{
        new: true
    });

    return res.status(201).json(new ApiResponse(200 , updateAttendanceRecord , "Attandance Updated"));
});

const deleteAttandanceREcord = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isValidId = await isValidObjectId(id);

    if(!isValidId) {
        throw new ApiError(400 , "Plase Provide a Valid Id");
    }

    const isREcordExists = await AttandanceRecord.findById(id);
    if(!isREcordExists) {
        throw new ApiError(400 , "No Record Found With Id");
    }

    if(!(req.user?._id?.toString() == isREcordExists?.employeeId?.toString())) {
        throw new ApiError(403, 'You are not authorized to delete this record');
    }
     await AttandanceRecord.findByIdAndDelete(id);

    return res.status(201).json(new ApiResponse(200 , null , "Attandance Deleted"));
});


const getAllAttendanceRecords = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, from  , to } = req.query;

    // Default Date Range: Current month
    let startDate = from ? new Date(from) : new Date();
    let endDate = to ? new Date(to) : new Date();

    if (!from) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);  // 1st day of current month
    }

    if (!to) {
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // Last day of current month
    }

    // Filter setup with calculated date range
    const filter = {
        date: { 
            $gte: startDate, 
            $lte: endDate 
        },
        employeeId: req?.user?._id
    };
    
    // Pagination setup
    const skip = (page - 1) * limit;
    
    // Fetch attendance records with filtering and pagination
    const attendanceRecords = await AttandanceRecord.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ date: -1 }); // Sort by most recent date

    // Count the total number of records to include in response metadata
    const totalRecords = await AttandanceRecord.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        attendanceRecords,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page
    }, "Attendance Records Fetched"));
});

const getuserWiseAttandanceRecords = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, from  , to } = req.query;
    const { employeeId } = req.params;
    const isValidEmployeeId = await isValidObjectId(employeeId);
    if(!isValidEmployeeId) {
        throw new ApiError(400, 'Plase Provide a Valid Employee Id');
    }

    const isEmployeeExists = await User.findById(employeeId);

    if(!isEmployeeExists) {
        throw new ApiError(400, 'Plase Provide a Valid Employee');
    }

    // Default Date Range: Current month
    let startDate = from ? new Date(from) : new Date();
    let endDate = to ? new Date(to) : new Date();

    if (!from) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);  // 1st day of current month
    }

    if (!to) {
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // Last day of current month
    }

    // Filter setup with calculated date range
    const filter = {
        date: { 
            $gte: startDate, 
            $lte: endDate 
        },
        employeeId: employeeId
    };
    
    // Pagination setup
    const skip = (page - 1) * limit;
    
    // Fetch attendance records with filtering and pagination
    const attendanceRecords = await AttandanceRecord.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ date: -1 }); // Sort by most recent date

    // Count the total number of records to include in response metadata
    const totalRecords = await AttandanceRecord.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        attendanceRecords,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page
    }, "Attendance Records Fetched"));
});

const getUser_StatusWiseAttandanceRecords  = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, from  , to } = req.query;
    const { employeeId , status} = req.params;
    const isValidEmployeeId = await isValidObjectId(employeeId);
    if(!isValidEmployeeId) {
        throw new ApiError(400, 'Plase Provide a Valid Employee Id');
    }

    const isEmployeeExists = await User.findById(employeeId);

    if(!isEmployeeExists) {
        throw new ApiError(400, 'Plase Provide a Valid Employee');
    }

    if(!(status == true || status == false || status == 'true' || status == 'false')) {
        throw new ApiError(400, 'Plase Provide a Valid Status');
    }

    // Default Date Range: Current month
    let startDate = from ? new Date(from) : new Date();
    let endDate = to ? new Date(to) : new Date();

    if (!from) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);  // 1st day of current month
    }

    if (!to) {
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // Last day of current month
    }

    // Filter setup with calculated date range
    const filter = {
        date: { 
            $gte: startDate, 
            $lte: endDate 
        },
        employeeId: employeeId,
        isApproved : status
    };
    
    // Pagination setup
    const skip = (page - 1) * limit;
    
    // Fetch attendance records with filtering and pagination
    const attendanceRecords = await AttandanceRecord.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ date: -1 }); // Sort by most recent date

    // Count the total number of records to include in response metadata
    const totalRecords = await AttandanceRecord.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        attendanceRecords,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page
    }, "Attendance Records Fetched"));
});

const approveAttandanceRecords = asyncHandler(async (req, res) => {
    const { id , status} = req.params;
    const isValidRecord = await isValidObjectId(id);
    if(!isValidRecord) {
        throw new ApiError(400, 'Plase Provide a Valid Record');
    }

    const isREcordExists = await AttandanceRecord.findById(id);

    if(!isREcordExists) {
        throw new ApiError(400, 'Plase Provide a Valid Record');
    }
    
    if(!(status == true || status == false || status == 'true' || status == 'false')) {
        throw new ApiError(400, 'Plase Provide a Valid Status');
    }

    const updateStatus = await AttandanceRecord.findByIdAndUpdate(id , {
        isApproved : status
    } , {
        new: true
    })

    return res.status(200).json(new ApiResponse(200, updateStatus, "Attendance Record Updated"));
});

export {
    createLoginRecord,
    logoutRecord,
    customUpdateAttendanceRecord,
    deleteAttandanceREcord,
    getAllAttendanceRecords,
    getuserWiseAttandanceRecords,
    getUser_StatusWiseAttandanceRecords,
    approveAttandanceRecords, 
};
