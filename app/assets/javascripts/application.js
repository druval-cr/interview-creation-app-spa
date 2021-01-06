// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require turbolinks
//= require_tree .

"use strict";

// helper functions
function parseRequestURL(){
    let url = location.hash.slice(1).toLowerCase() || '/';
    let r = url.split("/")
    let request = {
        resource    : null,
        id          : null,
        verb        : null
    }
    request.resource    = r[1]
    request.id          = r[2]
    request.verb        = r[3]
    return request
}

// Pages
let Index = `
    <div class = "main-link">
        <a href = "/#/createInterview">Create Interview</a>
    </div>
    <div id = "index__content"></div>
`
let Error404 = `
    <h4>Error404</h4>
    <a href = "/">Home</a>
`

let Create = `
    <div class = "main-link">
        <a href = "/">All Interviews</a>
    </div>
    <div class = "create__content" id = "create__content">
        <form id = "create-interview-form">
            <p>
                <label>Title:</label>
                <input type = "text" id = "title" />
            </p>
            <p>
                <label>Start time:</label>
                <input type = "datetime-local" id = "start_time" />
            </p>
            <p>
                <label>End time:</label>
                <input type = "datetime-local" id = "end_time" />
            </p>

            <p>
                <label>Participants:</label>
                <input type = "text" id = "participants" />
            </p>

            <p>
                <label>Resume (pdf format):</label>
                <input type = "file" id = "resume" name="uploadResume" />
            </p>

            <button type = "submit">Create Interview</button>
        </form>
    </div>
`

let Edit = `
    <div class = "main-link">
        <a href = "/">All Interviews</a>
    </div>
    <div class = "edit__content" id = "edit__content">
        <form id = "edit-interview-form">
            <p>
                <label>Title:</label>
                <input type = "text" id = "title" />
            </p>
            <p>
                <label>Start time:</label>
                <input type = "datetime-local" id = "start_time" />
            </p>
            <p>
                <label>End time:</label>
                <input type = "datetime-local" id = "end_time" />
            </p>

            <p>
                <label>Participants:</label>
                <input type = "text" id = "participants" />
            </p>

            <p>
                <label>Resume (pdf format):</label>
                <input type = "file" id = "resume" name="uploadResume" />
            </p>
            <button type = "submit">Edit Interview</button>
        </form>
    </div>
`

let Delete = `
    <div id = "delete__content">
    </div>
`

const routes = {
    '/': Index,
    '/createinterview': Create,
    '/edit/:id': Edit,
    '/delete/:id': Delete
};

function router() {

    // Lazy load view element:
    const content = null || document.getElementById('main-container');

    // Get the parsed URl from the addressbar
    let request = parseRequestURL()

    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '')
    console.log("parsedURL: ", parsedURL);

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    let page = routes[parsedURL] ? routes[parsedURL] : Error404
    // console.log(page);

    content.innerHTML = page

    if(page == Index){
        fetch(`http://localhost:3000/interviews`, {
            method: 'GET',
        })
        .then(
            function(response){
                if (response.status !== 200) {
                    alert('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                    var interviews = data.interviews
                    var map_interview_participants = data.map_interview_participants
                    var map_interview_resumes = data.map_interview_resumes
                    document.getElementById("index__content").innerHTML = ``
                    for (let index = 0; index < interviews.length; index++) {
                        document.getElementById("index__content").innerHTML += `
                        <div class = "interview-container">
                            <h3>${interviews[index].title}</h3>
                            <p>Start time: ${interviews[index].start_time}<p>
                            <p>End time: ${interviews[index].end_time}<p>
                            <p>Participants: ${map_interview_participants[interviews[index].id]}<p>
                            <a href = "http://localhost:3000/#/edit/${interviews[index].id}">Edit</a>
                            <a href = "http://localhost:3000/#/delete/${interviews[index].id}">Delete</a>
                            <a id = "${interviews[index].id}_resume"></a>
                        </div>
                        `
                        if(map_interview_resumes[interviews[index].id] !== ""){
                            document.getElementById(`${interviews[index].id}_resume`).innerHTML = "View Resume"
                            document.getElementById(`${interviews[index].id}_resume`).href = map_interview_resumes[interviews[index].id]
                        }
                    }
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    }
    else if(page == Create){
        let form = document.getElementById("create-interview-form");
        form.addEventListener("submit", function(event){
            event.preventDefault();

            let title = document.getElementById('title');
            let start_time = document.getElementById('start_time'); 
            let end_time = document.getElementById('end_time');
            let participants = document.getElementById('participants');
            let files = event.target.uploadResume.files
            let resume = ""
            if(files.length > 0) resume = files[0]

            let formData = new FormData()

            formData.append("title", title.value)
            formData.append("start_time", start_time.value)
            formData.append("end_time", end_time.value)
            formData.append("participants", participants.value)
            formData.append("resume", resume)

            fetch('http://localhost:3000/interviews', {
                method: 'POST',
                body: formData
            })
            .then(
                function(response){
                    if (response.status !== 200) {
                        alert('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        if(data.code === 3000) alert(data.message);
                        else window.history.pushState({}, null, "http://localhost:3000/");
                    });
                }
            )
            .catch(function(err) {
              console.log('Fetch Error :-S', err);
            });
        });
    }
    else if(page == Edit){
        var xhr = new XMLHttpRequest()
        xhr.onload = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText)
                var interview = response.interview
                var participants = response.participants
                var start_time = interview.start_time.split(":00.000Z")[0]
                var end_time = interview.end_time.split(":00.000Z")[0]

                document.getElementById("title").value = `${interview.title}`
                document.getElementById("start_time").value = start_time
                document.getElementById("end_time").value = end_time
                document.getElementById("participants").value = participants
            }
        };
        xhr.open('GET', `http://localhost:3000/interviews/${request.id}`)
        xhr.send()

        let form = document.getElementById("edit-interview-form");
        form.addEventListener("submit", function(event){
            event.preventDefault();

            let title = document.getElementById('title');
            let start_time = document.getElementById('start_time'); 
            let end_time = document.getElementById('end_time');
            let participants = document.getElementById('participants');
            let files = event.target.uploadResume.files
            let resume = ""
            if(files.length > 0) resume = files[0]

            let formData = new FormData()

            formData.append("title", title.value)
            formData.append("start_time", start_time.value)
            formData.append("end_time", end_time.value)
            formData.append("participants", participants.value)
            formData.append("resume", resume)

            fetch(`http://localhost:3000/interviews/${request.id}`, {
                method: 'PUT',
                body: formData
            })
            .then(
                function(response){
                    if (response.status !== 200) {
                        alert('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        if(data.code === 3000) alert(data.message);
                        else window.history.pushState({}, null, "http://localhost:3000/");
                    });
                }
            )
            .catch(function(err) {
              console.log('Fetch Error :-S', err);
            });
        });
    }
    else if(page == Delete){
        fetch(`http://localhost:3000/interviews/${request.id}`, {
            method: 'DELETE',
        })
        .then(
            function(response){
                if (response.status !== 200) {
                    alert('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                    if(data.code === 3000) alert(data.message);
                    else window.history.pushState({}, null, "http://localhost:3000/");
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    }
}

// Listen on hash change:
window.onhashchange = function() {
    router();
}

// Listen on page load:
window.addEventListener('load', router);