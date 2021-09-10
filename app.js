const express = require("express");
const socket = require("socket.io");

let app = express();


let server = app.listen(process.env.PORT || 3000, () => {
    console.log("listsening to port 3000");
})

app.use(express.static("public"));

let io = socket(server);

io.on("connection", (socket) => {

    socket.on("join", (meeting_id, person_name) => {

        // finding no of rooms in the server

        let rooms = io.sockets.adapter.rooms;
        let room = rooms.get(meeting_id);



        if (person_name == "" && room == undefined) {
            socket.join(meeting_id);
            socket.emit("created");

        }
        else if (person_name != "" && room == undefined) {
            socket.emit("noSuchRoom");
        }
        else if (room.size == 1) {
            socket.join(meeting_id);
            socket.emit("joined", person_name);
        } else {
            socket.emit("full");
        }


    })

    // let doctor know patient joined the room with the help of ready event


    socket.on("ready", (meeting_id, person_name) => {

        socket.broadcast.to(meeting_id).emit("ready", person_name);
    })


    // doctor and patient needs to send thier ice candidates with the help of candidate event

    socket.on("candidate", (candidate, meeting_id) => {

        socket.broadcast.to(meeting_id).emit("candidate", candidate);
    })



    //doctor patient needs to send his offer which is a sdp (medias, encoding details, etc) to patient with the help of offer event

    socket.on("offer", (offer, meeting_id) => {
        console.log(offer);
        socket.broadcast.to(meeting_id).emit("offer", offer);
    })



    socket.on("answer", (answer, meeting_id) => {

        socket.broadcast.to(meeting_id).emit("answer", answer);
    })


    socket.on("leave", (meeting_id) => {




        socket.leave(meeting_id);
        socket.broadcast.to(meeting_id).emit("leave");
    })


})