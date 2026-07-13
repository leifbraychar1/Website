//grabs file path or whatever
const currentPage = window.location.pathname.split("/").pop();


if (currentPage === "index.html" || currentPage === "" || currentPage === "/") {
        runHomePage();
    } else if (currentPage === "contact.html") {
        runContactPage();
    } else if (currentPage === "login.html") {
        runLoginPage(); 
    } else if (currentPage === "toDo.html") {
        runTodoPage();
    }


function runHomePage() {

}

function runLoginPage() {
    console.log("Login page JavaScript is active!");

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (event) => {
        //stop browser from refreshing
        event.preventDefault();

        //get username and password
        const usernameTyped = document.getElementById('userName').value;
        const passwordTyped = document.getElementById('userPassword').value;

        //debug
        console.log("The password captured by JS is:", passwordTyped);
        console.log("The username captured by JS is:", usernameTyped)

        //fetch reaches out to backend
        fetch('http://localhost:3000/api/v1/login', {
            method: 'POST', //we're sending data
            headers: {
                'Content-Type': 'application/json' //we're sending JSON data
            },
            body: JSON.stringify({
                username: usernameTyped, //(req.body.username)
                password: passwordTyped  //((req.body.password))
            })
        })
        .then(response => {
            //wait for server to reply, then "translate" to JSON
            return response.json(); 
        })
        .then(data => {
            //Check for success
            if (data.message === "Authentication successful!") {
                //point browser towards private
                window.location.href = "/private/dashboard.html"; 
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            //network broke
            console.error("Network Communication Error:", error);
            alert("Could not connect to the backend server. Make sure it's running via npm start!");
        });
        
    });
}


function runContactPage() {
    console.log("Contact page JavaScript is active!");
}