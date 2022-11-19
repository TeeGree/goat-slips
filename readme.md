# Summary

G.O.A.T. Slips or Greatest Of All Time Slips is a time tracking application. It allows users to enter hours and minutes categorized by date, project code, task code, and labor code.

The application is split into 3 parts:

- Database: SQL Server database
- Server: .NET 6 Web API
- Client: React Application build with TypeScript, utilizing Material UI.

# Debugging the application

## Database

Begin by creating a blank SQL Server database and deploying the scripts in the `db` folder to it. You can use the database project (`db/GoatSlipsDb.sln`) to deploy these scripts.

Ensure that the `db/GoatSlipsDb/AddAccessRights.sql` script is ran on the target db once the schema has been deployed.

## Server

Open the .NET 6 Web API solution (`src/GoatSlips.sln`).

Edit the `src/GoastSlips/appsettings.Development.json` file.

- Set the "Secret" configuration with any string that is at least 25 characters long. This is used to sign the JWT security token. _It is **not** used to hash the user passwords._
- Set the `ConnectionStrings/ConnectionString` configuration to a connection string pointing to the database created in the steps outlined above. A sample connection string is `"Server=localhost\\SQLEXPRESS;Database=GoatSlipsDb;Trusted=Connection=True"`.

Begin debugging the `GoatSlips` project.

## Client

The client React app can be found in the `src/GoatSlips/Client` folder.

Edit the `src//.env` file and ensure the `REACT_APP_API_ENDPOINT` is set to the URL of the debugging instance of the `GoatSlips` project from the steps above.

Debugging the GoatSlips .NET project will automatically run the following commands to install dependencies for and start up the react app:

1. `npm install`
2. `npm run start`

# Deploying the application

Deploying the application requires:

1. Updating the `src/GoatSlips/Client/.env` file to point to the target URL of the application.
2. Publishing the GoatSlips.csproj.
3. Setting necessary configurations in the published `appsettings.json` file.
4. Creating a website in IIS that points to the published directory.

Steps 1, 2, and 3 are handled by the `deploy.sh` script. Run this interactive script and it will prompt you for all necessary configuration options and the directory where the published application should be placed.

In IIS, a website or application must be pointed to the folder location of the published files. The application pool used by that website should use an identity user with access to the GoatSlipsDb server. This can be found in the advanced settings of the application pool, under `Process Model` > `Identity`.

# License

G.O.A.T. Slips is licensed under the [GNU GPLv3 License](https://github.com/TeeGree/goat-slips/blob/main/LICENSE.md).
