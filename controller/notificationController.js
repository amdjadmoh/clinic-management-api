const Notification = require('../models/Notification');
const User = require('../models/Users')
const Doctor = require('../models/Doctors');
const Patient = require('../models/Patient');
const Dep = require('../models/Dep');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

// Create a new notification
exports.createNotification = catchAsync(async (req, res, next) => {
  const { title, content, recipientType, recipientId, depId, accountType, senderId } = req.body;
  
  // Validate recipient based on type
  if (recipientType === 'user' && !recipientId) {
    return res.status(400).json({
      status: 'error',
      message: 'Recipient ID is required when sending to a user'
    });
  }

  if (recipientType === 'department' && !depId) {
    return res.status(400).json({
      status: 'error',
      message: 'Department ID is required when sending to a department'
    });
  }

  if (recipientType === 'accountType' && !accountType) {
    return res.status(400).json({
      status: 'error',
      message: 'Account type is required when sending to an account type'
    });
  }

  // Create notification
  const notification = await Notification.create({
    title,
    content,
    senderId,
    recipientType,
    recipientId: recipientId || null,
    depId: depId || null,
    accountType: accountType || null
  });

  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Get notifications for a user
exports.getNotifications = catchAsync(async (req, res, next) => {
  const {userId, depId} = req.query;
  
    // get user own notifications
    const userNotifications = await Notification.findAll({
        where: {
            senderId: userId
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get notifications shared with user
    const sharedNotifcations = await Notification.findAll({
        where: {
            recipientType: 'user',
            recipientId: userId
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id','username',  'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get files shared with department
    const depNotfications = await Notification.findAll({
        where: {
            recipientType: 'department',
            depId: depId
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id',  'username','fullName', 'userType']
            },
            {
                model: Dep,
                as: 'department',
                attributes: ['id', 'depName']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get public notfications
    const publicFiles = await Notification.findAll({
        where: {
            recipientType: 'all'
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get account type of use
    const use = await User.findOne({
      where :{
        id : userId
      }
    })
    // get notfications shared to an account type
    const  accountTypeNotfications = await Notification.findAll({
        where: {
             recipientType: 'accountType',
             accountType: use.userType
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id','username',  'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    })

    // combine all files into one array separating them by type
 const notfications = {
      userNotifications,
      sharedNotifcations,
      depNotfications,
      publicFiles,
      accountTypeNotfications
    };
  res.status(200).json({
    status: 'success',
    data: {
      notifications: notfications
    }
  });
});


// Delete a notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  
  const notification = await Notification.findByPk(notificationId);
  
  if (!notification) {
    return res.status(404).json({
      status: 'error',
      message: 'Notification not found'
    });
  }
  
  await notification.destroy();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Mark a notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  
  const notification = await Notification.findByPk(notificationId);
  
  if (!notification) {
    return res.status(404).json({
      status: 'error',
      message: 'Notification not found'
    });
  }
  
  notification.read = true;
  await notification.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

const Appointment = require('../models/Appointment');
exports.sendAppointmentNotification = catchAsync(async()=>{
  // get all appointments in the next 24 hours
  const appointments = await Appointment.findAll({
    where: {
      date: {
        [Op.gt]: new Date(),
        [Op.lt]: new Date(Date.now() + 24 * 60 * 60 * 1000) // next 24 hours
      }
    }
  });

  // create notifications for each appointment
  for (const appointment of appointments) {

    // get patient associated with the appointment
    const patient = await Patient.findByPk(appointment.patientID, {
      attributes: ['id', 'name']
    });

    // get associated user for the doctor
    const user = await User.findOne({
      where: {
        userID: appointment.doctorID
      },
      attributes: ['id']
    });
   console.log(`Sending notification for appointment with patient: ${patient}`);
    
    // check if notification already exists
    const existingNotification = await Notification.findOne({
      where: {
        title: 'Rendez-vous à venir',
        content: `Vous avez un rendez-vous avec ${patient.name} le ${appointment.date.toLocaleString()}.`,
        recipientType: 'user',
        recipientId: user.id,
        senderId: 1000 // assuming 1000 is the system user ID
      }
    });
    if (existingNotification) {
      continue; // skip if notification already exists
    }
    await Notification.create({
      title: 'Rendez-vous à venir',
      content : `Vous avez un rendez-vous avec ${patient.name} le ${appointment.date.toLocaleString()}.`,
      recipientType: 'user',
      recipientId: user.id,
      senderId : 1000, // assuming 1000 is the system user ID
    });
  }
}
);

