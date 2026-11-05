const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'yrr73p',
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
