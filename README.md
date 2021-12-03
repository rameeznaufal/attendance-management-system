
# DBMS Project: Attendance Management System
## Project Description

This is a Web Application used for the Attendance Management of a Educational Institution. It is a unified interface for all features to take and mark the attendance.

## Table of Contents
* [Programming Language Requirements](#programmingLanguageRequirements)
* [Downloading Important Modules](#downloadingImportantModules)
* [Server and Application Setup](#serverSetup)

## Programming Language Requirements    <a name="programmingLanguageRequirements"></a>
Use the latest version of:- [Python](https://www.python.org/), [Flask](https://flask.palletsprojects.com/en/2.0.x/), [PostgreSQL](https://www.postgresql.org/)

## Downloading Important Modules    <a name="downloadingImportantModules"></a>
First make sure you have the latest version of the Languages mentioned above installed into your system.

Now we will install node and npm package.

To download the latest version of npm, on the command line, run the following command:

* ```npm install -g npm```

To download the latest version of node go to [Node.js Download Webpage](https://nodejs.org/en/download/) and download the lasted version of node.

If you already have node and npm installed, you can check the version by going into the terminal and using the following commands:

* ```node -v```
* ```npm -v```

## Server and Application Setup    <a name="serverSetup"></a>
Open two terminals and navigate into the directory that holds the code for the application, type the command:
* ```cd (file path for the directory)``` for example: C:\Reuben\NITC\Sem5\DBMS\DBMS Project\attendance-management-system

In one terminal, move into the backend folder using ```cd backend```. We will be creating a Virtual Environment and downloading all the Required Modules in there. To open a Virtual Environment in python, type the command in this terminal:
* ```python -m venv env```
In order to activate the newly created Virtual Environment, type the command:
* ```. env/scripts/activate```
Now we will download all the required modules into the Virtual Environment. To do this, type the command:
* ```pip install -r requirements.txt```
After all requirements are installed, run the flask server using the command:
* ```flask run```
With this, the terminal should look like this:
```
PS C:\Reuben\NITC\Sem5\DBMS\DBMS Project\attendance-management-system> cd backend
PS C:\Reuben\NITC\Sem5\DBMS\DBMS Project\attendance-management-system\backend> . env/scripts/activate
(env) PS C:\Reuben\NITC\Sem5\DBMS\DBMS Project\attendance-management-system\backend> flask run 
 * Serving Flask app 'attendanceapp' (lazy loading)
 * Environment: development
 * Debug mode: on
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 108-982-397
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

In the other terminal, move into the frontend folder using ```cd frontend```. Type the command in this terminal:
* ```yarn start```

With this, your development server should start in the default web browser. If it doesnt, go into your prefered web browser and type:
* ```http://localhost:3000/```

