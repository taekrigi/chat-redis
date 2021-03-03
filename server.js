const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const redis = require('socket.io-redis')

const PORT = 3006

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.adapter(redis({ host: 'localhost', port: 6379 }))

io.on('connection', (socket) => {
  socket.on('login', (data) => {
    console.log(`name: ${data.name}, userId: ${data.userId}`)

    socket.name = data.name
    socket.userId = data.userId

    io.emit('login', data.name)
  })

  socket.on('chat', (data) => {
    console.log(`Message from ${socket.name} ${data.msg}`)

    const msg = {
      from: {
        name: socket.name,
        userId: socket.userId,
      },
      msg: data.msg,
    }

    socket.broadcast.emit('chat', msg)
  })

  socket.on('forceDisconnect', () => {
    socket.disconnect()
  })

  socket.on('disconnect', () => {
    console.log(`user disconnected: ${socket.name}`)
  })
})

server.listen(PORT, () => {
  console.log(`Socket IO Server listening on port ${PORT}`)
})
