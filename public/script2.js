let url_string = window.location.href;
var url = new URL(url_string);
let meeting_id = url.searchParams.get("meeting_id");
let person_name = url.searchParams.get("username");

let video_info = document.getElementById("video-info-tag")
let my_video = document.getElementById("my-video")
let peer_video = document.getElementById("peer-video")

let video_call_end = document.getElementById("video-call-end")
let video_mic = document.getElementById("video-mic")
let video_hide = document.getElementById("video-hide")




let socket;
let creator = false;
let patientEntered = false;
let rtcPeerConnection;
let User_streams;
let iceServers = {
    iceServers: [
        {
            urls: "stun:stun.services.mozilla.com"
        },
        {
            urls: "stun:stun1.l.google.com:19302"
        }
    ]
}

if (meeting_id) {
    socket = io.connect();
    video_info.innerText = `Your meeting number is : ${meeting_id}`;




    // making a join event to the server

    if (!person_name) {
        person_name = "";
    }
    socket.emit("join", meeting_id, person_name);


} else {
    window.location.replace(`/`);
}


socket.on("created", () => {

    // setting video into our broswer
    creator = true
    navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 1280, height: 720 } }).then((stream) => {
        my_video.srcObject = stream;
        User_streams = stream;
        my_video.onloadedmetadata = (e) => {
            my_video.play();
        }
        console.log(stream)

    }).catch((error) => {
        console.log(error);
        alert("Please allow camera");
    });



})



socket.on("joined", (person_name) => {


    // setting video into our broswer

    navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 1280, height: 720 } }).then((stream) => {
        my_video.srcObject = stream;
        User_streams = stream;
        my_video.onloadedmetadata = (e) => {
            my_video.play();
        }
        video_float_info[0].style.display = "none";
        socket.emit("ready", meeting_id, person_name);


    }).catch((error) => {
        console.log(error);
        alert("Please allow camera");
    });


})


socket.on("noSuchRoom", () => {
    alert("Please Check Your Meeting No or Contact your Doctor");
    window.location.replace(`/`);

})



socket.on("full", () => {
    alert("Sorry Doctor is in session, please try again later");
    window.location.replace(`/`);

})




socket.on("ready", (person_name) => {
    patientEntered = true;
    video_info.innerText += `\nPatient ${person_name} has entered`;
    video_float_info[0].style.display = "flex";

    if (creator) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = gettingBackIceCandidate;
        rtcPeerConnection.ontrack = geetingMediaStream;
        rtcPeerConnection.addTrack(User_streams.getTracks()[0], User_streams);
        rtcPeerConnection.addTrack(User_streams.getTracks()[1], User_streams);
        rtcPeerConnection.createOffer().then((offer) => {

            rtcPeerConnection.setLocalDescription(offer);

            socket.emit("offer", offer, meeting_id);
        }).catch(error => console.log(error));

    }



})

socket.on("candidate", (candidate) => {


    let rtciceCandi = new RTCIceCandidate(candidate)
    rtcPeerConnection.addIceCandidate(rtciceCandi);


})

socket.on("offer", (offer) => {

    if (!creator) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = gettingBackIceCandidate;
        rtcPeerConnection.ontrack = geetingMediaStream;
        rtcPeerConnection.addTrack(User_streams.getTracks()[0], User_streams);
        rtcPeerConnection.addTrack(User_streams.getTracks()[1], User_streams);
        rtcPeerConnection.setRemoteDescription(offer);
        rtcPeerConnection.createAnswer().then((answer) => {
            rtcPeerConnection.setLocalDescription(answer);
            socket.emit("answer", answer, meeting_id);
        }).catch(error => console.log(error));

    }


})

socket.on("answer", (answer) => {
    rtcPeerConnection.setRemoteDescription(answer);
})

let gettingBackIceCandidate = (event) => {
    if (event.candidate) {
        socket.emit("candidate", event.candidate, meeting_id);
    }

}

let geetingMediaStream = (event) => {

    peer_video.srcObject = event.streams[0];
    peer_video.onloadedmetadata = (e) => {
        peer_video.play();
    }
}


video_call_end.addEventListener("click", () => {


    if (creator) {
        downloadFile(meeting_id, video_info.innerText);
    }
    socket.emit("leave", meeting_id);

    if (my_video.srcObject) {
        my_video.srcObject.getTracks()[0].stop();
        my_video.srcObject.getTracks()[1].stop();
    }

    if (peer_video.srcObject) {
        peer_video.srcObject.getTracks()[0].stop();
        peer_video.srcObject.getTracks()[0].stop();
    }


    if (rtcPeerConnection) {
        rtcPeerConnection.ontrack = null;
        rtcPeerConnection.onicecandidate = null;
        rtcPeerConnection.close();
        rtcPeerConnection = null;
    }

    window.location.replace(`/`);



})


video_hide.addEventListener("click", () => {


    if (video_hide.innerText == "videocam") {
        video_hide.innerText = "videocam_off";

        User_streams.getTracks()[1].enabled = false;
    } else {
        User_streams.getTracks()[1].enabled = true;
        video_hide.innerText = "videocam";
    }
})


video_mic.addEventListener("click", () => {
    if (video_mic.innerText == "mic") {
        video_mic.innerText = "mic_off";
        User_streams.getTracks()[0].enabled = false;
    } else {
        User_streams.getTracks()[0].enabled = true;
        video_mic.innerText = "mic";
    }

})

socket.on("leave", () => {

    if (rtcPeerConnection) {
        rtcPeerConnection.ontrack = null;
        rtcPeerConnection.onicecandidate = null;
        rtcPeerConnection.close();
        rtcPeerConnection = null;
    }


    if (peer_video.srcObject) {
        peer_video.srcObject.getTracks()[0].stop();
        peer_video.srcObject.getTracks()[0].stop();
    }

    if (!creator) {

        alert("doctor has left the room");
        if (my_video.srcObject) {
            my_video.srcObject.getTracks()[0].stop();
            my_video.srcObject.getTracks()[1].stop();
        }



        window.location.replace(`/`);


    }


})


let downloadFile = (filename, data) => {

    // creating an <a> tag;
    let element = document.createElement('a');
    element.style.display = "none";
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);


}
