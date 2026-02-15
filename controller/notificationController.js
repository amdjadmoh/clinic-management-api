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
exports.sendAppointmentNotification = async () => {
  try {
    // get all appointments in the next 24 hours
    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gt]: new Date(),
          [Op.lt]: new Date(Date.now() + 24 * 60 * 60 * 1000) // next 24 hours
        }
      }
    });

    if (!appointments.length) {
      console.log('No upcoming appointments found');
      return;
    }

    // Batch fetch all patients and users to avoid N+1 queries
    const patientIDs = [...new Set(appointments.map(a => a.patientID))];
    const doctorIDs = [...new Set(appointments.map(a => a.doctorID))];

    const [patients, users] = await Promise.all([
      Patient.findAll({
        where: { id: patientIDs },
        attributes: ['id', 'name']
      }),
      User.findAll({
        where: { userID: doctorIDs },
        attributes: ['id', 'userID']
      })
    ]);

    // Create lookup maps for O(1) access
    const patientMap = new Map(patients.map(p => [p.id, p]));
    const userMap = new Map(users.map(u => [u.userID, u]));

    // Process appointments in batches to avoid blocking
    const BATCH_SIZE = 10;
    for (let i = 0; i < appointments.length; i += BATCH_SIZE) {
      const batch = appointments.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (appointment) => {
        try {
          const patient = patientMap.get(appointment.patientID);
          const user = userMap.get(appointment.doctorID);

          if (!patient || !user) {
            console.warn(`Skipping appointment ${appointment.id}: missing patient or user`);
            return;
          }

          const notificationContent = `Vous avez un rendez-vous avec ${patient.name} le ${appointment.date.toLocaleString()}.`;

          // check if notification already exists
          const existingNotification = await Notification.findOne({
            where: {
              title: 'Rendez-vous à venir',
              content: notificationContent,
              recipientType: 'user',
              recipientId: user.id,
              senderId: 1000
            }
          });

          if (existingNotification) {
            return; // skip if notification already exists
          }

          await Notification.create({
            title: 'Rendez-vous à venir',
            content: notificationContent,
            recipientType: 'user',
            recipientId: user.id,
            senderId: 1000,
          });

          console.log(`Sent notification for appointment with patient: ${patient.name}`);
        } catch (error) {
          console.error(`Error processing appointment ${appointment.id}:`, error.message);
        }
      }));

      // Yield to event loop between batches to prevent blocking
      if (i + BATCH_SIZE < appointments.length) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    console.log(`Processed ${appointments.length} appointments`);
  } catch (error) {
    console.error('Error in sendAppointmentNotification:', error);
    throw error;
  }
};

