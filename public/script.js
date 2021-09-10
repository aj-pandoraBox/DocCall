let person_name = document.getElementById("person_name");
let meeting_no = document.getElementById("meeting_no");

let connectNow = () => {

    if (person_name.value != "" && person_name != "") {
        window.location.replace(`call.html?meeting_id=${meeting_no.value}`);

    } else {
        alert("please enter all the fields to enter in a meeting");
    }

}
