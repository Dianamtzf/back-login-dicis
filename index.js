const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express() //App tiene toda las propiedades del servidor web

// Capturar el body->objeto->formato json 
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

//Conexion a la base de datos
//const url = `mongodb+srv://${process.env.USUARIO}:${process.env.PASSWORD}@cluster0.hpa5z9j.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
const url = `mongodb+srv://dianamtz14:diana2002@cluster0.hpa5z9j.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log('Conectado a BD'))
   .catch((error) => console.log('Error: '+ error))
//Creacion e importación de rutas
const authRoutes = require('./routes/auth')

// Ruta del middleware
app.use('/api/user', authRoutes)

app.get('/', (req, res)=>{
    res.json({
        estado: true,
        mensaje: 'Funciona bien ... eso creo :)'
    })
})

//iniciamos el servidor, si no existe la variable process.env.PORT se conecta al puerto 10000
const PORT = process.env.PORT || 10000
app.listen(PORT, ()=>{
    console.log(`Servidor en Puerto: ${PORT}`)
})