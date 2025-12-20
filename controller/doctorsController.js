const {Doctors} = require("../models/Doctors");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const  preDefinedProcedure  = require("../models/PreDefinedProcedure");
const DoctorWorkLog = require("../models/DoctorLog");

exports.searchDoctor = catchAsync(async (req, res, next) => {
  const doctors = await Doctors.findAll({
    where: {
      name: { [Op.iLike]: `%${req.query.name}%` },
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      doctors,
    },
  });
});


exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctors.findAll();
  res.status(200).json({
    status: "success",
    data: {
      doctors,
    },
  });
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctors.findByPk(req.params.id);
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      doctor,
    },
  });
});

exports.createDoctor= catchAsync(
    async (req,res,next)=>{
        const newDoctor= await Doctors.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
                doctor:newDoctor,
            },
        });
    }
);

exports.updateDoctor= catchAsync(
    async (req,res,next)=>{
        const doctor= await Doctors.findByPk(req.params.id);
        if(!doctor){
            return next(new AppError('Doctor not found',404));
        }
        const updatedDoctor= await doctor.update(req.body);
        res.status(200).json({
            status:'success',
            data:{
                doctor:updatedDoctor,
            },
        });
    }
);
 exports.deleteDoctor= catchAsync(
    async (req,res,next)=>{
        const doctor = await Doctors.findByPk(req.params.id);
        if(!doctor){
            return next(new AppError('Doctor not found',404));
        }
        await doctor.destroy();
        res.status(200).json({
            status:'success',
            message:"Doctor deleted successfully",
        });
    }
);


exports.createLog = catchAsync(async (req, res, next) => {
  const procedure = await preDefinedProcedure.findByPk(req.body.procedureID);
  if (!procedure) {
    return next(new AppError("Procedure not found", 404));
  }
  const doctor = await Doctors.findByPk(req.body.doctorID);
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }
  req.body.procedureName = procedure.procedureName
  req.body.procedureCost = procedure.cost;
  req.body.procedureType=procedure.type;
  const doctorLog = await DoctorWorkLog.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      doctorLog,
    },
  });
}
);
exports.getLog = catchAsync(async (req, res, next) => {
  const doctorLog = await DoctorWorkLog.findByPk(req.params.id);
  if (!doctorLog) {
    return next(new AppError("Doctor log not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      doctorLog,
    },
  });
}
);
exports.deleteLog = catchAsync(async (req, res, next) => {
  const doctorLog = await DoctorWorkLog.findByPk(req.params.id);
  if (!doctorLog) {
    return next(new AppError("Doctor log not found", 404));
  }
  await doctorLog.destroy();
  res.status(200).json({
    status: "success",
    message: "Doctor log deleted successfully",
  });
}
);
exports.getDoctorLogs = catchAsync(async (req, res, next) => {
  const doctorWorkLog = await DoctorWorkLog.findAll({
    where: {
      doctorID: req.params.doctorID,
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      doctorWorkLog,
    },
  });
}
);

exports.getDoctorLogInDateRange= catchAsync(async (req,res,next)=>{
  const logs= await DoctorWorkLog.findAll({
    where:{
      doctorID:req.params.doctorID,
      date:{
        [Op.between]:[req.query.startDate,req.query.endDate],
      },
      ...(req.query.type && { procedureType: req.query.type })
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      logs,
    },
  });
}
);


exports.getDoctorLogInDateRangeByProc= catchAsync(async (req,res,next)=>{
  const logs= await DoctorWorkLog.unscoped().findAll({
    where:{
      doctorID:req.params.doctorID,
      date:{
        [Op.between]:[req.query.startDate,req.query.endDate],
      },
      ...(req.query.type && { procedureType: req.query.type })
    },
  });
  const logMap= new Map();
  
  logs.forEach(log => {
    const key = log.procedureID; 
       if (logMap.has(key)) {
        logMap.get(key).quantity += 1;
    } else {
        delete log.dataValues.date;
        delete log.dataValues.updatedAt;
        delete log.dataValues.createdAt;
        delete log.dataValues.patientID;
        logMap.set(key, { ...log.get({ plain: true }), quantity: 1 });
    }
  }
  );
  res.status(200).json({
    status: "success",
    data: {
      logs: Array.from(logMap.values()),
    },
  });
}
);


