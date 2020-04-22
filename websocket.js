const socketio = require('socket.io')
const { calculateDistance, convertDistance, getDistance }  = require('./src/utils/geolocation/calculateDistance')

let io
const connections = [];

exports.setupWebsocket = (server) => {
    io = socketio(server)

    io.on('connection', (socket) => {
        console.log('conectou')
        const { locations, currentRegion, categories } = socket.handshake.query

        connections.push({
            id: socket.id,
            currentRegion,
            locations,
            categories
        })

        socket.on('disconnect', () => {
            const index = connections.map(connection => connection.id).indexOf(socket.id)
            if(index >= 0) {
                console.log('desconectou')
                connections.splice(index, 1)
            }
        })
    })
}

exports.findConnections = (coordinates, category) => {
    return connections.filter(connection => {
        const categories = JSON.parse(connection.categories)
        if(categories.length && !categories.includes(category)) {
            return false
        }
        let should = false
        const locs = JSON.parse(connection.locations)
        locs.every(location => {
            let distance = calculateDistance(coordinates, location)
            if(distance < 2) {
                distance = getDistance(JSON.parse(connection.currentRegion), coordinates)
                connection.distance = distance
                should = true
                return false
            }
            return true
        })
        return should
    })
}

exports.sendMessage = (to, message, data) => {
    to.forEach(connection => {
        data.distance = connection.distance
        io.to(connection.id).emit(message, data)
    })
}