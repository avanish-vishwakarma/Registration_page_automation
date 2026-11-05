describe("Registration Management System - Registration Tests", () => {

  const baseUrl = "http://127.0.0.1:5500/index.html";

  const timestamp = Date.now();

  const users = [
    {
      firstName: "TestOne",
      lastName: "UserOne",
      email: `testone${timestamp}@gmail.com`,
      username: `testone${timestamp}`
    },
    {
      firstName: "TestTwo",
      lastName: "UserTwo",
      email: `testtwo${timestamp}@gmail.com`,
      username: `testtwo${timestamp}`
    },
    {
      firstName: "TestThree",
      lastName: "UserThree",
      email: `testthree${timestamp}@gmail.com`,
      username: `testthree${timestamp}`
    },
    {
      firstName: "TestFour",
      lastName: "UserFour",
      email: `testfour${timestamp}@gmail.com`,
      username: `testfour${timestamp}`
    },
    {
      firstName: "TestFive",
      lastName: "UserFive",
      email: `testfive${timestamp}@gmail.com`,
      username: `testfive${timestamp}`
    },
    {
      firstName: "TestSix",
      lastName: "UserSix",
      email: `testsix${timestamp}@gmail.com`,
      username: `testsix${timestamp}`
    },
    {
      firstName: "TestSeven",
      lastName: "UserSeven",
      email: `testseven${timestamp}@gmail.com`,
      username: `testseven${timestamp}`
    },
    {
      firstName: "TestEight",
      lastName: "UserEight",
      email: `testeight${timestamp}@gmail.com`,
      username: `testeight${timestamp}`
    },
    {
      firstName: "TestNine",
      lastName: "UserNine",
      email: `testnine${timestamp}@gmail.com`,
      username: `testnine${timestamp}`
    },
    {
      firstName: "TestTen",
      lastName: "UserTen",
      email: `testten${timestamp}@gmail.com`,
      username: `testten${timestamp}`
    }
  ];

  users.forEach((user, index) => {

    it(`Register User ${index + 1}`, () => {

      // 1. API Intercepts

      cy.intercept("GET", "**/countries/iso").as("countriesAPI");

      cy.intercept("GET", "**/countries/states/q*").as("statesAPI");

      cy.intercept("POST", "**/countries/state/cities").as("citiesAPI");

      cy.intercept("POST", "**/api/register").as("registerAPI");


      // 2. Open Application

      cy.visit(baseUrl);


      // 3. Open Registration Form

      cy.get("#openRegistrationBtn")
        .should("be.visible")
        .click();


      // 4. Fill Personal Details

      cy.get("#title").select("Mr.");

      cy.get("#firstName").type(user.firstName);

      cy.get("#middleName").type("Automation");

      cy.get("#lastName").type(user.lastName);

     // Enter Date of Birth
cy.get("#dob")
  .should("be.visible")
  .type("2002-05-15")
  .blur();

// Trigger change event
cy.get("#dob").trigger("change");

// Verify Age is calculated
cy.get("#age")
  .should("not.have.value", "")
  .and("be.visible");

      cy.get("#genderMale").check();


      // 5. Contact Details

      cy.get("#mobile").type("9876543210");

      cy.get("#alternateMobile").type("9876543211");

      cy.get("#contactEmail").type(user.email);

      cy.get("#address").type("Patna, Bihar, India");


      // 6. Country Selection

      cy.wait("@countriesAPI");

      cy.get("#country")
        .should("be.visible")
        .select("India");


      // 7. State Selection

      cy.wait("@statesAPI").then(({ response }) => {

        expect(response, "States API response").to.exist;

        expect(response.statusCode).to.equal(200);

      });

      cy.get("#state")
        .should("be.enabled")
        .select("Bihar");


      // 8. City Selection
cy.wait("@citiesAPI").then(({ request, response }) => {
  cy.log("Cities API Method: " + request.method);
  cy.log("Cities API URL: " + request.url);
  cy.log("Cities API Status: " + response.statusCode);
  cy.log("Redirect Location: " + response.headers.location);
});
      cy.get("#city")
        .should("be.enabled")
        .select("Patna");


      // 9. Other Details

      cy.get("#pincode").type("800001");

      cy.get("#qualification").select("Graduate");

      cy.get("#occupation").select("Student");


      // 10. Login Details

      cy.get("#username").type(user.username);

      cy.get("#password").type("Test@12345");

      cy.get("#confirmPassword").type("Test@12345");

      cy.get("#terms").check();


      // 11. Submit Registration Form

      cy.get(".btn-submit")
        .should("be.visible")
        .and("be.enabled")
        .click();


      // 12. Check Confirmation Popup

      cy.get("#popupOverlay")
        .should("be.visible");


      // 13. Enter Confirmation Email

   cy.get("#confirmationEmail")
  .should("be.visible")
  .clear()
  .type(user.email)
  .should("have.value", user.email);

      // 14. Confirm Registration

      cy.get("#emailForm .btn-confirm")
        .click();


      // 15. Check Registration API

      cy.wait("@registerAPI").then(({ request, response }) => {

        expect(request.method).to.equal("POST");

        expect(request.body).to.exist;

        expect(response.statusCode).to.equal(201);

      });


      // 16. Verify Popup Closed

      cy.get("#popupOverlay")
        .should("not.be.visible");


      // 17. Verify Success Toast

      cy.get("#successToast")
        .should("be.visible")
        .and("contain.text", "Registration successful!");

    });

  });

});