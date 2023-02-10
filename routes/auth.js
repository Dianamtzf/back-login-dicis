//router para las conexiones de los sitios en la web
const router = require('express').Router()
const User = require('../models/User')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')
//Para validar los datos que se van a ingresar (volver a check)
const validacionRegistro = Joi.object({
    name: Joi.string().max(255).required(),
    apaterno: Joi.string().max(255).required(),
    amaterno: Joi.string().max(255).required(),
    email: Joi.string().max(255).required(),
    password: Joi.string().min(6).max(1024).required()
})

const validacionLogin = Joi.object({
    email: Joi.string().max(255).required(),
    password: Joi.string().min(6).max(1024).required()
})

const validacionUpdate = Joi.object({
    id: Joi.string().max(1024).required(),
    name: Joi.string().max(255).required(),
    apaterno: Joi.string().max(255).required(),
    amaterno: Joi.string().max(255).required(),
    password: Joi.string().min(6).max(1024).required()
})

//con post mandamos datos a la ruta
//con ansyc se espera a que reciba respuesta para ejecutar lo demas
router.post('/register', async(req, res)=>{
   //se pone {} porque es una var de json
    const { error } = validacionRegistro.validate(req.body)

    if ( error ){
        return res.status(400).json({
            error: error.details[0].message
        })
    }

    const existeCorreo = await User.findOne({
        email: req.body.email
    })
    //console.log(existeCorreo)
    if ( existeCorreo){
        return res.status(400).json({
            error: "El correo ya existe"
        })
    }

    const salt = await bcrypt.genSalt(10)
    const contrasenaNueva = await bcrypt.hash(req.body.password, salt)

    //crear un usuario
    const usuario = new User({
        name: req.body.name,
        apaterno: req.body.apaterno,
        amaterno: req.body.amaterno,
        email: req.body.email,
        password: contrasenaNueva
    })

    //Para identificar un error
    try{
        const guardado = await usuario.save()
        if( guardado){
            return res.json({
                error: null,
                data: guardado
            })
        } else {
            return res.json({
                error: "No se pudo guardar"
            })
        }
    }catch(error){
        return res.json({
            error
        })
    }
})

router.post('/login', async(req, res) =>{
    const { error } = validacionLogin.validate(req.body)

    if ( error ){
        return res.status(400).json({
            error: error.details[0].message
        })
    }

    const existeCorreo = await User.findOne({
        email: req.body.email
    })

    if (!existeCorreo){
        return res.status(400).json({
            error: "Correo no encontrado"
        })
    }

    const passwordCorrecto = await bcrypt.compare(req.body.password, existeCorreo.password)

    if (!passwordCorrecto){
        return res.status(400).json({
            error: "Las constraseñas no coinciden"
        })
    }

    const token = Jwt.sign({
        name: existeCorreo.name,
        id: existeCorreo._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: { token }
    })
})

//Regresar los usuarios de la base de datos
router.get('/getallusers', async(req, res) =>{
    const users = await User.find()
    if(users){
        res.json({
            error: null,
            data:users
        })
    } else {
        res.json({
            error: "No hay usuarios en la BD"
        })
    }
})

//Borrar un usuario en la BD
router.post('/deleteuser', async(req, res) =>{
    const id = req.body.id
    const userExist = await User.findById({_id: id}) //Para saber si existe el id
    if(userExist){
        await User.findByIdAndDelete({_id: id}) //Para borrar el id de la BD
        res.json({
            error: null,
            data: "Usuario Borrado"
        })
    } else {
        res.json({
            error: "Usuario no encontrado :("
        })
    }
})

router.post('/updateuser', async(req, res)=>{
    //se pone {} porque es una var de json
     const { error } = validacionUpdate.validate(req.body)
 
     if ( error ){
         return res.status(400).json({
             error: error.details[0].message
         })
     }
 
     let existeId = await User.findOne({
         _id: req.body.id
     })
     //si no existe id !
     if ( !existeId){
         return res.status(400).json({
             error: "El usuario no existe"
         })
     }
 
     const salt = await bcrypt.genSalt(10)
     const contrasenaNueva = await bcrypt.hash(req.body.password, salt)
     existeId = {
        id: req.body.id,
        name: req.body.name,
        apaterno: req.body.apaterno,
        amaterno: req.body.amaterno,
        password: contrasenaNueva
     }
     //Para identificar un error
     try{
         const guardado = await User.findByIdAndUpdate(
            {_id: existeId.id},
            existeId,
            { new: true }
         )
         if( guardado){
             return res.json({
                 error: null,
                 data: guardado
             })
         } else {
             return res.json({
                 error: "No se pudo actualizar"
             })
         }
     }catch(error){
         return res.json({
             error
         })
     }
 })






module.exports = router