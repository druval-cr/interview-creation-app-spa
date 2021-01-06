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

    var xhr = new XMLHttpRequest()

    if(page == Index){
        xhr.onload = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText)
                var interviews = response.interviews
                var map_interview_participants = response.map_interview_participants
                document.getElementById("index__content").innerHTML = ``
                for (let index = 0; index < interviews.length; index++) {
                    document.getElementById("index__content").innerHTML += `
                    <div class = "interview-container">
                        <h3>${interviews[index].title}</h3>
                        <p>Start time: ${interviews[index].start_time}<p>
                        <p>End time: ${interviews[index].end_time}<p>
                        <p>Participants: ${map_interview_participants[interviews[index].id]}<p>
                        <a href = "http://localhost:3000/#/edit/${interviews[index].id}">Edit<a>
                        <a href = "http://localhost:3000/#/delete/${interviews[index].id}">Delete<a>
                    </div>
                    `
                }
            }
        };
        xhr.open('GET', 'http://localhost:3000/interviews')
        xhr.send()
    }
    else if(page == Create){
        function createInterview(){
            let title = document.getElementById('title'); 
            let start_time = document.getElementById('start_time'); 
            let end_time = document.getElementById('end_time');
            let participants = document.getElementById('participants');

            xhr.onload = function () {
                var response = JSON.parse(this.responseText);
                if(response.code == 3000){
                    console.log(response.message);
                }
                else if(response.code == 200){
                    window.history.pushState({}, null, "http://localhost:3000/");
                    //window.location.replace("http://localhost:3000/");
                }
            };
            xhr.open("POST", "http://localhost:3000/interviews", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            var data = JSON.stringify({ "title": title.value, "start_time": start_time.value, "end_time": end_time.value, "participants": participants.value }); 
            xhr.send(data);
        }
        let form = document.getElementById("create-interview-form");
        form.addEventListener("submit", function(event){
            event.preventDefault();
            createInterview();
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

        function editInterview(){
            let title = document.getElementById('title'); 
            let start_time = document.getElementById('start_time'); 
            let end_time = document.getElementById('end_time');
            let participants = document.getElementById('participants');

            xhr.onload = function () {
                var response = JSON.parse(this.responseText);
                if(response.code == 3000){
                    console.log(response.message);
                }
                else if(response.code == 200){
                    window.history.pushState({}, null, "http://localhost:3000/");
                    //window.location.replace("http://localhost:3000/");
                }
            };
            xhr.open("PUT", `http://localhost:3000/interviews/${request.id}`, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            var data = JSON.stringify({ "title": title.value, "start_time": start_time.value, "end_time": end_time.value, "participants": participants.value }); 
            xhr.send(data);
        }
        let form = document.getElementById("edit-interview-form");
        form.addEventListener("submit", function(event){
            event.preventDefault();
            editInterview();
        });
    }
    else if(page == Delete){
        xhr.onload = function() {
            window.history.pushState({}, null, "http://localhost:3000/");
            //window.location.replace("http://localhost:3000/");
        };
        xhr.open('DELETE', `http://localhost:3000/interviews/${request.id}`);
        xhr.send(null);
    }
}

// Listen on hash change:
window.onhashchange = function() {
    router();
}

// Listen on page load:
window.addEventListener('load', router);