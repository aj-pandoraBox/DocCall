let person_name = document.getElementById("person_name");
let meeting_no = document.getElementById("meeting_no");

let connectNow = () => {

    if (person_name.value != "" && person_name != "") {
        window.location.replace(`call.html?username=${person_name.value}&meeting_id=${meeting_no.value}`);

    } else {
        alert("please enter all the fields to enter in a meeting");
    }

}

let createACall = () => {
    let math1 = Math.floor(Math.random() * 100000);
    let math2 = Math.floor(Math.random() * 1000000);
    let math3 = Math.floor(Math.random() * 100000);

    let sum = math1 + math2 + math3;
    window.location.replace(`call.html?meeting_id=${sum}`);

}