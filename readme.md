# Summary

G.O.A.T. Slips or Greatest Of All Time Slips is a time tracking application. It allows users to enter hours and minutes categorized by date, project code, task code, and labor code.

The application is split into 3 parts:

- Database: SQL Server database
- Server: .NET 6 Web API
- Client: React Application build with TypeScript, utilizing Material UI.

# Running the application

## Database

Begin by creating a blank SQL Server database and deploying the scripts in the `db` folder to it. You can use the database project (`db/GoatSlipsDb.sln`) to deploy these scripts.

## Server

Open the .NET 6 Web API solution (`api/GoatSlipsApi.sln`).

Edit the `api/GoastSlipsApi/appsettings.Development.json` file.

- Set the "Secret" configuration with any string that is at least 20 characters long. This is used to sign the JWT security token. _It is **not** used to hash the user password._
- Set the `ConnectionStrings/ConnectionString` configuration to a connection string pointing to the database created in the steps outlined above. A sample connection string is `"Server=localhost\\SQLEXPRESS;Database=GoatSlipsDb;Trusted=Connection=True"`.

Begin debugging the `GoatSlipsApi` project.

## Client

Edit the `client/.env` file and ensure the `REACT_APP_API_ENDPOINT` is set to the URL of the debugging instance of the `GoatSlipsApi` project from the steps above.

Open a terminal and navigate to the `client` folder.

1. Run `npm install` to install dependencies.

2. Run `npm start` from the terminal.
