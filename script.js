// GET HTML ELEMENTS
let editingUserId = null;
const registrationForm =
    document.getElementById("registrationForm");

const popupOverlay =
    document.getElementById("popupOverlay");

const emailForm =
    document.getElementById("emailForm");

const confirmationEmail =
    document.getElementById("confirmationEmail");

const dobInput =
    document.getElementById("dob");

const ageInput =
    document.getElementById("age");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const formControls = [
    ...registrationForm.querySelectorAll("input, select, textarea")
];

const countrySelect = document.getElementById("country");
const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");
const pinInput = document.getElementById("pincode");

//api for state and country 
const API_URL = "https://countriesnow.space/api/v0.1";



// ERROR MESSAGES

const errorMessages = {
    valueMissing: "Please fill out this field.",
    typeMismatch: "Please enter a valid value.",
    patternMismatch: "Please follow the required format.",
    tooShort: "This value is too short.",
    tooLong: "This value is too long.",
    rangeUnderflow: "Please enter a valid value.",
    rangeOverflow: "Please enter a valid value."
};


// GET ERROR MESSAGE

function getErrorMessage(input) {

    // Custom required field messages
    const requiredMessages = {
        title: "Please select your title.",
        firstName: "Please enter your first name.",
        lastName: "Please enter your last name.",
        dob: "Please select your date of birth.",
        mobile: "Please enter your mobile number.",
        contactEmail: "Please enter your email address.",
        address: "Please enter your address.",
        city: "Please enter your city.",
        state: "Please enter your state.",
        pincode: "Please enter your PIN code.",
        occupation: "Please select your occupation.",
        username: "Please enter your username.",
        password: "Please enter your password.",
        confirmPassword: "Please confirm your password.",
        terms: "Please accept the terms and conditions."
    };

    // Empty mandatory field
    if (input.validity.valueMissing) {

        return requiredMessages[input.id] ||
            "Please enter a value in this field.";
    }

    // Email validation
    if (
        input.id === "contactEmail" &&
        input.validity.typeMismatch
    ) {
        return "Please enter a valid email address.";
    }

    // Mobile validation
    if (
        input.id === "mobile" &&
        input.validity.patternMismatch
    ) {
        return "Mobile number must contain exactly 10 digits.";
    }

    // Alternate mobile validation
    if (
        input.id === "alternateMobile" &&
        input.validity.patternMismatch
    ) {
        return "Please enter a valid 10-digit mobile number.";
    }

    // PIN validation
if (input.id === "pincode" && input.validity.customError) {
    return input.validationMessage;
}


    // Username validation
    if (
        input.id === "username" &&
        input.validity.tooShort
    ) {
        return "Username must contain at least 4 characters.";
    }

    // Password validation
    if (
        (input.id === "password" ||
         input.id === "confirmPassword") &&
        input.validity.tooShort
    ) {
        return "Password must contain at least 8 characters.";
    }

    // Password match validation
    if (
        input.id === "confirmPassword" &&
        input.validity.customError
    ) {
        return "Passwords do not match.";
    }

    // URL validation
    if (
        (input.id === "website" ||
         input.id === "linkedin") &&
        input.validity.typeMismatch
    ) {
        return "Please enter a valid URL.";
    }

    return "Please enter a valid value.";
}

//validate pincode
function validatePincode(value, country) {

    if (country === "India" && !/^[0-9]{6}$/.test(value)) {
        return "Indian PIN Code must contain exactly 6 digits.";
    }

    return "";
}
// VALIDATE INDIVIDUAL FIELD

function validateField(input, forceShow = false) {

    // Ignore other radio buttons in the same group
    if (
        input.type === "radio" &&
        input.id !== "genderMale"
    ) {
        return true;
    }

    // Ignore readonly field
    if (input.readOnly) {
        return true;
    }

    // PASSWORD MATCH VALIDATION
    if (input.id === "confirmPassword") {

        input.setCustomValidity(
            input.value &&
            input.value !== passwordInput.value
                ? "Passwords do not match."
                : ""
        );
    }

// PIN CODE VALIDATION
if (input.id === "pincode") {

    const pinError = validatePincode(
        input.value,
        countrySelect.value
    );

    input.setCustomValidity(pinError);
}

    const isRadio = input.type === "radio";
    const isTerms = input.id === "terms";

    let target = input;

    let container =
        input.closest(".field") || input.parentElement;

    // GENDER FIELD
    if (isRadio) {

        target = input.closest(".field")
            .querySelector(".gender-options");

        container = input.closest(".field");
    }

    // TERMS CHECKBOX
    if (isTerms) {

        target = input.closest(".terms");

        container = input.closest(".form-actions");
    }

    const invalid = !input.checkValidity();

    const shouldShow =
        forceShow || input.dataset.touched === "true";

    // ADD / REMOVE RED BORDER
    target.classList.toggle(
        "is-invalid",
        invalid && shouldShow
    );

    // FIND EXISTING ERROR
    let error = container.querySelector(
        `[data-error-for="${input.id || input.name}"]`
    );

    // SHOW ERROR
    if (invalid && shouldShow) {

        if (!error) {

            error = document.createElement("small");

            error.className = "field-error";

            error.dataset.errorFor =
                input.id || input.name;
        }

        if (isRadio) {

            error.textContent = "Please select a gender.";

        } else if (isTerms) {

            error.textContent =
                "Please accept the terms to continue.";

        } else {

            error.textContent = getErrorMessage(input);
        }

        // INSERT ERROR MESSAGE
        if (isRadio || isTerms) {

            target.insertAdjacentElement("afterend", error);

        } else {

            const wrapper =
                input.closest(".input-with-icon") || input;

            wrapper.insertAdjacentElement("afterend", error);
        }

    } else if (error) {

        error.remove();
    }

    return !invalid;
}


// When user leaves a field, validate it.

formControls.forEach(input => {

    input.addEventListener("blur", function () {

        input.dataset.touched = "true";

        validateField(input);
    });


    // CHANGE EVENT
    input.addEventListener("change", function () {

        if (input.dataset.touched === "true") {

            validateField(input);
        }
    });


    // INPUT EVENT
    // Remove error when user corrects the value.

    input.addEventListener("input", function () {

        if (input.dataset.touched === "true") {

            validateField(input);
        }
    });

});


// RECHECK CONFIRM PASSWORD WHEN PASSWORD CHANGES

passwordInput.addEventListener("input", function () {

    if (confirmPasswordInput.dataset.touched === "true") {

        validateField(confirmPasswordInput);
    }
});


// AGE CALCULATION
dobInput.addEventListener("change", function () {

    if (!this.value) {

        ageInput.value = "";

        return;
    }

    const birthDate =
        new Date(this.value + "T00:00:00");

    const today = new Date();

    let age =
        today.getFullYear() - birthDate.getFullYear();

    if (
        today.getMonth() < birthDate.getMonth() ||
        (
            today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    ageInput.value = age >= 0 ? age : "";
});


//load validate pincode 

// Load countries
async function loadCountries() {
    try {
        const response = await fetch(`${API_URL}/countries/iso`);
        const result = await response.json();

        if (result.error) {
            throw new Error(result.msg);
        }

        result.data.forEach(country => {
            const option = document.createElement("option");

            option.value = country.name;
            option.textContent = country.name;

            countrySelect.appendChild(option);
        });

    } catch (error) {
        console.error("Country API Error:", error);
    }
}


// Load states according to selected country

async function loadStates(country) {

    stateSelect.innerHTML =
        '<option value="">Loading...</option>';

    stateSelect.disabled = true;

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    citySelect.disabled = true;

    try {

        const response = await fetch(
            `${API_URL}/countries/states/q?country=${encodeURIComponent(country)}`
        );

        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.msg || "Failed to load states");
        }

        stateSelect.innerHTML =
            '<option value="">Select State</option>';

        result.data.states.forEach(state => {

            const option = document.createElement("option");

            option.value = state.name;
            option.textContent = state.name;

            stateSelect.appendChild(option);

        });

        stateSelect.disabled = false;

        return true;

    } catch (error) {

        console.error("State API Error:", error);

        stateSelect.innerHTML =
            '<option value="">Unable to load states</option>';

        return false;
    }
}



// Load cities according to selected country and state
async function loadCities(country, state) {
    citySelect.innerHTML =
        '<option value="">Loading...</option>';

    citySelect.disabled = true;

    try {
        const response = await fetch(
            `${API_URL}/countries/state/cities`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    country: country,
                    state: state
                })
            }
        );

        const result = await response.json();

        if (result.error) {
            throw new Error(result.msg);
        }

        citySelect.innerHTML =
            '<option value="">Select City</option>';

        result.data.forEach(city => {
            const option = document.createElement("option");

            option.value = city;
            option.textContent = city;

            citySelect.appendChild(option);
        });

        citySelect.disabled = false;

    } catch (error) {
        console.error("City API Error:", error);

        citySelect.innerHTML =
            '<option value="">Unable to load cities</option>';
    }
}


// EVENT LISTENER 1: Country change
countrySelect.addEventListener("change", function () {

    // Reset State
    stateSelect.innerHTML =
        '<option value="">Select State</option>';

    stateSelect.disabled = true;

    // Reset City
    citySelect.innerHTML =
        '<option value="">Select City</option>';

    citySelect.disabled = true;

    // Load selected country's states
    if (this.value) {
        loadStates(this.value);
    }

    if (pinInput.dataset.touched === "true") {
        validateField(pinInput);
    }
});



// EVENT LISTENER 2: State change
stateSelect.addEventListener("change", function () {

    // Reset City
    citySelect.innerHTML =
        '<option value="">Select City</option>';

    citySelect.disabled = true;

    // Load selected state's cities
    if (this.value && countrySelect.value) {
        loadCities(countrySelect.value, this.value);
    }
});


// Load countries when page loads
loadCountries();


// valildate pincode 


function validatePincode(value, country) {

    const pincode = value.trim();
    let pattern;
    let errorMessage = "";

    if (!pincode) {
        errorMessage = "PIN Code is required.";
    }
    else if (country === "India") {
        pattern = /^[0-9]{6}$/;

        if (!pattern.test(pincode)) {
            errorMessage = "Indian PIN Code must contain exactly 6 digits.";
        }
    }
    else if (country === "United States") {
        pattern = /^[0-9]{5}(-[0-9]{4})?$/;

        if (!pattern.test(pincode)) {
            errorMessage = "Enter a valid US ZIP Code.";
        }
    }
    else if (country === "United Kingdom") {
        pattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

        if (!pattern.test(pincode)) {
            errorMessage = "Enter a valid UK postcode.";
        }
    }
    else if (!/^[A-Za-z0-9 -]{2,12}$/.test(pincode)) {
        errorMessage = "Enter a valid postal code.";
    }

    return errorMessage;
}

// FORM SUBMIT

registrationForm.addEventListener("submit", function (event) {

    event.preventDefault();

    let formIsValid = true;

    // Check all fields
    formControls.forEach(input => {

        input.dataset.touched = "true";

        if (!validateField(input, true)) {

            formIsValid = false;
        }
    });

    // Stop if form is invalid
    if (!formIsValid) {

        const firstInvalidInput = formControls.find(
            input => !input.checkValidity()
        );

        if (firstInvalidInput) {

            firstInvalidInput.focus();
        }

        return;
    }

    // OPEN EMAIL POPUP
    popupOverlay.classList.add("show");

    confirmationEmail.value =
        document.getElementById("contactEmail").value;

    confirmationEmail.focus();
});


// CLOSE POPUP

function closePopup() {

    popupOverlay.classList.remove("show");
}


// CLOSE BUTTON

document.getElementById("closePopup").addEventListener(
    "click",
    closePopup
);


// CANCEL BUTTON

document.getElementById("cancelPopup").addEventListener(
    "click",
    closePopup
);


// CLICK OUTSIDE POPUP

popupOverlay.addEventListener("click", function (event) {

    if (event.target === popupOverlay) {

        closePopup();
    }
});


// EMAIL CONFIRMATION

emailForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = confirmationEmail.value.trim();

    console.log("Confirmed Email:", email);

    // Get Gender
    const gender = document.querySelector(
        'input[name="gender"]:checked'
    )?.value || "";

    // Get Alternate Mobile
    const alternateMobile = document
        .getElementById("alternateMobile")
        .value.trim();

    // Get Pincode
    const pincode = document
        .getElementById("pincode")
        .value.trim();

    // Collect Registration Form Data
    const registrationData = {
        title: document.getElementById("title").value,
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        dob: dobInput.value,
        gender: gender,
        mobile: document.getElementById("mobile").value.trim(),
        alternateMobile: alternateMobile,
        contactEmail: document.getElementById("contactEmail").value.trim(),
        address: document.getElementById("address").value.trim(),
        country: document.getElementById("country").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        pincode: pincode,
        occupation: document.getElementById("occupation").value,
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value,
        website: document.getElementById("website").value.trim(),
        linkedin: document.getElementById("linkedin").value.trim(),
        terms: document.getElementById("terms").checked
    };

    // Send Data to Backend
    try {
        const response = await fetch(
    editingUserId
        ? `http://localhost:5000/api/users/${editingUserId}`
        : "http://localhost:5000/api/register",
    {
        method: editingUserId ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(registrationData)
    }
);

        const result = await response.json();

        // Check API Response
        if (!response.ok) {
            alert(result.message || "Registration failed!");
            return;
        }

        // Date format DD/MM/YYYY
        const dob = dobInput.value;

        console.log(
            "Date of Birth:",
            dob ? dob.split("-").reverse().join("/") : ""
        );

        // CLOSE POPUP
        closePopup();

        // SHOW SUCCESS TOAST
      const toastElement = document.getElementById("successToast");

// Check whether user was updated or newly registered
const successMessage = editingUserId
    ? "User updated successfully!"
    : "Registration successful!";

toastElement.querySelector(".toast-body").textContent = successMessage;

// Show toast
const successToast = bootstrap.Toast.getOrCreateInstance(toastElement);
successToast.show();

        // RESET FORM
        registrationForm.reset();
        emailForm.reset();
        ageInput.value = "";

         registrationPage.style.display = "none";
         homePage.style.display = "block";

            await loadUsers();
        console.log(result.message);



    } catch (error) {
        console.error("API Error:", error);
        alert("Cannot connect to server. Please try again.");
    }
});


// RESET FORM

registrationForm.addEventListener("reset", function () {

    setTimeout(() => {

        ageInput.value = "";

        // Remove red borders
        registrationForm
            .querySelectorAll(".is-invalid")
            .forEach(element => {
                element.classList.remove("is-invalid");
            });

        // Remove error messages
        registrationForm
            .querySelectorAll(".field-error")
            .forEach(element => {
                element.remove();
            });

        // Clear touched status
        formControls.forEach(input => {

            delete input.dataset.touched;

            input.setCustomValidity("");
        });

    }, 0);
});


// DARK / LIGHT MODE TOGGLE

const homePage = document.getElementById("homePage");
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {

    homePage.classList.toggle("light-theme");

    if (homePage.classList.contains("light-theme")) {
        themeToggle.textContent = "🌙 Dark Mode";
    } else {
        themeToggle.textContent = "☀️ Light Mode";
    }

});


// PAGE NAVIGATION

const registrationPage = document.getElementById("registrationPage");
const openRegistrationBtn = document.getElementById("openRegistrationBtn");
const backHomeBtn = document.getElementById("backHomeBtn");

// Open Registration Page
openRegistrationBtn.addEventListener("click", function () {

    editingUserId = null;

    homePage.style.display = "none";
    registrationPage.style.display = "block";

});

// Back to Home Page
backHomeBtn.addEventListener("click", function () {
    registrationPage.style.display = "none";
    homePage.style.display = "block";

    loadUsers();
});

let currentPage = 1;
let totalPages = 1;

const limit = 4;

// GET API - Load Registered Users
async function loadUsers(page = 1) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/users?page=${page}&limit=${limit}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch users");
        }

        console.log("Registered Users:", data.users);

        // Save pagination information
        currentPage = data.currentPage;
        totalPages = data.totalPages;

        // Display current page users
        displayUsers(data.users);

        displayPagination();

    document.getElementById("totalUsers").textContent =
    data.totalUsers;

    } catch (error) {
        console.error("Load Users Error:", error);
    }
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}


function displayPagination() {

    const pageNumbers = document.getElementById("pageNumbers");

    pageNumbers.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {

        const button = document.createElement("button");

        button.textContent = i;

        if (i === currentPage) {
            button.classList.add("active");
        }

        button.addEventListener("click", function () {
            loadUsers(i);
        });

        pageNumbers.appendChild(button);
    }
}


const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
        loadUsers(currentPage - 1);
    }
});

nextBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
        loadUsers(currentPage + 1);
    }
});
// Display Users in Dashboard Table


function displayUsers(users) {

    const usersTableBody = document.getElementById("usersTableBody");

    // Clear previous table data
    usersTableBody.replaceChildren();

    // Update dashboard statistics
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("activeUsers").textContent = users.length;
    document.getElementById("userCount").textContent = `${users.length} Users`;

    // If no users exist
    if (users.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-message";
        cell.textContent = "No users found. Register your first user!";

        row.appendChild(cell);
        usersTableBody.appendChild(row);

        return;
    }

    // Display each user
    users.forEach(function (user) {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const emailCell = document.createElement("td");
        const mobileCell = document.createElement("td");
        const usernameCell = document.createElement("td");
        const actionCell = document.createElement("td");

        nameCell.textContent = `${user.firstName} ${user.lastName}`;
        emailCell.textContent = user.contactEmail;
        mobileCell.textContent = user.mobile;
        usernameCell.textContent = user.username;

        // CREATE EDIT BUTTON
        const editBtn = document.createElement("button");

        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="18" height="18"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
            </svg>
        `;

        editBtn.className = "edit-btn";
        editBtn.title = "Edit User";



editBtn.addEventListener("click", async function () {

    editingUserId = user._id;

    homePage.style.display = "none";
    registrationPage.style.display = "block";

    // Fill normal fields
    document.getElementById("title").value = user.title || "";
    document.getElementById("firstName").value = user.firstName || "";
    document.getElementById("lastName").value = user.lastName || "";

    document.getElementById("dob").value =
        user.dob ? user.dob.split("T")[0] : "";

    document.getElementById("mobile").value = user.mobile || "";
    document.getElementById("alternateMobile").value = user.alternateMobile || "";
    document.getElementById("contactEmail").value = user.contactEmail || "";
    document.getElementById("address").value = user.address || "";
    document.getElementById("pincode").value = user.pincode || "";
    document.getElementById("occupation").value = user.occupation || "";
    document.getElementById("username").value = user.username || "";
    document.getElementById("website").value = user.website || "";
    document.getElementById("linkedin").value = user.linkedin || "";

    // Select Gender
    document.querySelectorAll('input[name="gender"]').forEach(function (radio) {
        radio.checked = radio.value === user.gender;
    });

    // Password stays empty
    document.getElementById("password").value = "";

    try {

        // STEP 1: Select Country
        countrySelect.value = user.country || "";

        // STEP 2: Load States
        const statesLoaded = await loadStates(user.country);

        if (!statesLoaded) {
            throw new Error("States could not be loaded");
        }

        // STEP 3: Select State
        stateSelect.value = user.state || "";

        if (!stateSelect.value) {
            throw new Error("Saved state was not found in dropdown");
        }

        // STEP 4: Load Cities
        const citiesLoaded = await loadCities(
            user.country,
            user.state
        );

        if (!citiesLoaded) {
            throw new Error("Cities could not be loaded");
        }

        // STEP 5: Select City
        citySelect.value = user.city || "";

        if (!citySelect.value) {
            console.warn("Saved city was not found in dropdown:", user.city);
        }

        console.log("Editing User:", user._id);
        console.log("Country:", countrySelect.value);
        console.log("State:", stateSelect.value);
        console.log("City:", citySelect.value);

    } catch (error) {
        console.error("Edit Dropdown Error:", error);
        alert(error.message);
    }

});


        // CREATE DELETE BUTTON
        const deleteBtn = document.createElement("button");

        deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="18" height="18"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
            </svg>
        `;

        deleteBtn.title = "Delete User";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", async function () {

            const confirmDelete = confirm(
                `Are you sure you want to delete ${user.firstName}?`
            );

            if (!confirmDelete) {
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/users/${user._id}`,
                    {
                        method: "DELETE"
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    alert(result.message || "Delete failed!");
                    return;
                }

                alert("User deleted successfully!");

                await loadUsers();

            } catch (error) {
                console.error("Delete Error:", error);
                alert("Cannot connect to server!");
            }
        });

        // ADD BOTH BUTTONS TO TABLE
        actionCell.append(editBtn, deleteBtn);

        row.append(
            nameCell,
            emailCell,
            mobileCell,
            usernameCell,
            actionCell
        );

        usersTableBody.appendChild(row);
    });
}

// Load users when dashboard opens
loadUsers();
