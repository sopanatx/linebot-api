window.onload = function () {
    const useNodeJS = true; // if you are not using a node server, set this value to false
    const defaultLiffId = "1656420524-EazeDX81"; // change the default LIFF value if you are not using a node server

    // DO NOT CHANGE THIS
    let myLiffId = "1656420524-EazeDX81";

    // if node is used, fetch the environment variable and pass it to the LIFF method
    // otherwise, pass defaultLiffId
    if (useNodeJS) {
        fetch("/api/get-liff-id")
            .then(function (reqResponse) {
                return reqResponse.json();
            })
            .then(function (jsonResponse) {
                myLiffId = jsonResponse.id;
                initializeLiffOrDie(myLiffId);
            })
            .catch(function (error) {
                document
                    .getElementById("liffAppContent")
                    .classList.add("hidden");
                document
                    .getElementById("nodeLiffIdErrorMessage")
                    .classList.remove("hidden");
            });
    } else {
        myLiffId = defaultLiffId;
        initializeLiffOrDie(myLiffId);
    }
};

/**
 * Check if myLiffId is null. If null do not initiate liff.
 * @param {string} myLiffId The LIFF ID of the selected element
 */
function initializeLiffOrDie(myLiffId) {
    if (!myLiffId) {
        document.getElementById("liffAppContent").classList.add("hidden");
        document
            .getElementById("liffIdErrorMessage")
            .classList.remove("hidden");
    } else {
        initializeLiff(myLiffId);
    }
}
/**
 * Initialize LIFF
 * @param {string} myLiffId The LIFF ID of the selected element
 */
function initializeLiff(myLiffId) {
    liff.init({
        liffId: myLiffId,
    })
        .then(() => {
            // start to use LIFF's api
            initializeApp();
        })
        .catch(err => {});
}

/**
 * Initialize the app by calling functions handling individual app components
 */
function initializeApp() {
    displayLiffData();
    registerButtonHandlers();
}
function displayLiffData() {
    //alert(liff.getOS());
    if (!liff.isLoggedIn()) {
        // set `redirectUri` to redirect the user to a URL other than the front page of your LIFF app.
        liff.login();
    } else {
        liff.getProfile()
            .then(profile => {
                console.log("profile:", profile);
                const id = profile.userId;
                document.getElementById("userId").textContent =
                    "User ID: " + id;
            })
            .catch(err => {
                console.log("error", err);
            });
        document.getElementById("deviceOS").textContent = "OS: " + liff.getOS();
        document.getElementById("isInClient").textContent =
            "isInClient: " + liff.isInClient();
        document.getElementById("isLoggedIn").textContent =
            "isLoggedIn: " + liff.isLoggedIn();
        document.getElementById("accessToken").textContent =
            "accessToken: " + liff.getAccessToken();
    }
}

function registerButtonHandlers() {
    // closeWindow call
    document
        .getElementById("closeWindowButton")
        .addEventListener("click", function () {
            if (!liff.isInClient()) {
                sendAlertIfNotInClient();
            } else {
                liff.closeWindow();
            }
        });
}
