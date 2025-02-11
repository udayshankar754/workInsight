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

    const updateAttendanceRecord =  await AttandanceRecord.findByIdAndUpdate(id , {
        employeeId,
        projectId,
        logoutTime,
        logoutLat,
        logoutLang,
        workDetails
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

const createAttendanceRecord = asyncHandler(async (req, res) => {
    const { projectId , date  ,loginTime ,loginLat , loginLang , logoutLat , logoutLang ,logoutTime ,workDetails  } = req.body;

    const { employeeId } = req.params;

    if(!employeeId) {
        throw new ApiError(400, 'Please provide employeeId');
    }
    if(!isValidObjectId(employeeId)) {
        throw new ApiError(400, 'Invalid employeeId');
    }

    const isValidEmployee = await User.findById(employeeId);

    if(!isValidEmployee) {
        throw new ApiError(400, 'Invalid employeeId');
    }

    if(!(date && loginTime && loginLat && loginLang)){
        throw new ApiError(400, 'Please provide date, loginTime, loginLat and loginLang');
    }

    if(logoutTime) {
        if(!(logoutLang && logoutLat)) {
            throw new ApiError(400, 'Please provide logoutLat and logoutLang');
        }
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
        employeeId,
        projectId,
        date,
        loginTime,
        loginLat,
        loginLang,
        logoutTime,
        logoutLat,
        logoutLang,
        workDetails,
        isHoliday,
        holidayReason
    });

    return res.status(201).json(new ApiResponse(200, attendanceRecord, "Attandance Created Successfully"));
});



const updateAttendanceRecord = asyncHandler(async (req, res) => {
    const {  employeeId , id } = req.params;
    const { projectId  , date ,loginTime ,loginLat , loginLang , logoutLat , logoutLang ,logoutTime ,workDetails  } = req.body;
    const isValidId = await isValidObjectId(id);
    if(!isValidId) {
        throw new ApiError(400 , "Plase Provide a Valid Id");
    }
    const isValidEmployeeId = await isValidObjectId(employeeId);
    if(!isValidEmployeeId) {
        throw new ApiError(400 , "Plase Provide a Valid Employee Id");
    }
    const isREcordExists = await AttandanceRecord.findById(id);
    if(!isREcordExists) {
        throw new ApiError(400 , "No REcord Found With Id");
    }
    const isValidEmployee = await User.findById(employeeId);
    if(!isValidEmployee) {
        throw new ApiError(400, 'Invalid employee id');
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

    if(loginTime) {
        if(!(loginLang && loginLat)) {
            throw new ApiError(400, 'Please provide loginLat and loginLang');
        }
    }

    if(logoutTime) {
        if(!(logoutLang && logoutLat)) {
            throw new ApiError(400, 'Please provide logoutLat and logoutLang');
        }
    }

    const updateAttendanceRecord =  await AttandanceRecord.findByIdAndUpdate(id , {
        employeeId,
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
    return res.status(201).json(new ApiResponse(200, updateAttendanceRecord , "Attandance Updated"));

});

const deleteAttendanceRecord = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isValidId = await isValidObjectId(id);
    if(!isValidId) {
        throw new ApiError(400 , "Plase Provide a Valid Id");
    }
    const isREcordExists = await AttandanceRecord.findById(id);
    if(!isREcordExists) {
        throw new ApiError(400 , "No REcord Found With Id");
    }
    await AttandanceRecord.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Attandance Record Deleted Successfully"));
});

// TODO: Generated 
const getAllAttendanceRecords = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '', sortBy = 'date', order = 'desc' } = req.query;
    const query = {};
    if (search) {
        query.$or = [
            { employeeId: new RegExp(search, 'i') },
            { projectId: new RegExp(search, 'i') },
            { date: new RegExp(search, 'i') },
            { loginTime: new RegExp(search, 'i') },
            { logoutTime: new RegExp(search, 'i') },
            { workDetails: new RegExp(search, 'i') },
        ];
    
    }
    const count = await AttandanceRecord.countDocuments(query);
    const attendanceRecords = await AttandanceRecord.find(query)
    // Sorting
    attendanceRecords.sort((a, b) => {
        if (order === 'asc') {
            return a[sortBy] > b[sortBy]? 1 : -1;
        } else {
            return a[sortBy] < b[sortBy]? 1 : -1;
        }
    });
    // Pagination
    attendanceRecords.skip((page - 1) * limit).limit(limit);
    return res.status(200).json(new ApiResponse(200, { attendanceRecords, page, limit, totalPages: Math.ceil(count / limit) }));
});

// admin 
const approveAttandanceRecords = asyncHandler(async (req, res) => {});

export {
 
};
