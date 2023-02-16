const res = require('express/lib/response')
const {ONE_SIGNAL_CONFIG}= require('../config/app.config')
const pushNotificationService= require('../services/push-notification.service')
//check

exports.SendNotification= (req,res,next)=>{
    var message={
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {en: "New Rescue Alert"},
        included_segments: ["All"],
        content_available: true,
        small_icon: "ic_notification_icon",
        data:{
            PushTitle: "CUSTOM NOTIFICATION"
        }
    }
    console.log({message})

    pushNotificationService.SendNotification(message, (error, results)=>{
        console.log(message)
        if (error){
            return next(error)
        }
        return res.status(200).send({
            message:"success",
            data:results
        })
    })

}

exports.SendNotificationToDevice= (req,res,next)=>{
    var message={
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {en: "Your order is in Processing"},
        included_segments: ["included_player_ids"],
        include_player_ids: req.body.devices,
        content_available: true,
        small_icon: "ic_notification_icon",
        data:{
            PushTitle: "CUSTOM NOTIFICATION"
        }
    }

    pushNotificationService.SendNotification(message, (error, results)=>{

        if (error){
            return next(error)
        }
        return res.status(200).send({
            message:"success",
            data:results
        })
    })

}

 exports.sendSpecificNotificationBasedOnOrderStatus = (id, status) => {
    var message={
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {en: `Your Order is in ${status}`},
        included_segments: ["included_player_ids"],
        include_player_ids: [id],
        content_available: true,
        small_icon: "ic_notification_icon",
        data:{
            PushTitle: "CUSTOM NOTIFICATION"
        }
    }

    pushNotificationService.SendNotification(message, (error, results)=>{

        if (error){
            return next(error)
        }
       console.log("success")
    })
}


