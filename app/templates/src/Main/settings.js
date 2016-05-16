module.exports = {
  Name: "Main",
  Description: "Main",
  Repository: "",
  Version: "0.0.0",
  "AtomicDeps": [
    {
      "Name": "Server",
      "Description": "Server",
      "Repository": "git@bitbucket.org:jasonvillalon/server.git",
      "Version": "0.0.0",
      "importAs": "*"
    }
  ],
  config: {
    // Name of the application
    name: "<%= appName %>",
    // Connection information for the database (postgresql) server
    db: {
      name: "<%= dbName %>",
      host: "<%= dbHost %>",
      user: "<%= dbUser %>",
      password: "<%= dbPass %>",
      port: <%= dbPort %>
    }
  }
};
