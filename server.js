import express, { request } from 'express'

const app = express()

const users = []; 

app.get('/users', (req ,res) => {
    res.send('OK, deu bom')
})

app.post('/users', (req, res) => {

    console.log(req)
    res.send('OK, here')
})

app.listen(3000)