# FloatCal

Expo Go based calendar with automatic scheduling.


Fast API backend located in backend/

Expo Go react native frontend located in frontend/

## Instructions to run for Windows only
Can be run on other OS's but requires different commands

### Install Applications

#### Install Node with npm if Node/Npm are not installed yet


```bash
winget install OpenJS.NodeJS.LTS
```

##### Verify installation
```bash
node -v
npm -v
```

#### Install python if python is not installed
Python version >= 3.12 is recommended
```bash
winget install -e --id Python.Python.3.14
```
##### Verify Installation
```bash
python --version
```

#### Install dependencies
In terminal go to project root
##### Install backend dependencies

Use pip if unsure
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install .
```

Finally
```bash
cd .. # Return to project root
```

##### Install frontend dependencies
```bash
cd frontend
npm install
```

### Run Backend

```bash
cd ..
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Configure IP address
In a new terminal, leaving the previous one open
```bash
ipconfig
```
Copy ipv4 adress under the active WIFI/Ethernet adapter

Note: The computer and phone need to be on the same WIFI network

Create file frontend/.env

With contents:
```text
EXPO_PUBLIC_API_URL=http://{MY_IP_ADDRESS}:8000/api
```
With {MY_IP_ADDRESS} being replaced with address from previous step


### Frontend
```bash
cd frontend
npx expo start -c
```

## IOS / Android

Install Expo Go app
#### IOS
https://apps.apple.com/us/app/expo-go/id982107779

#### Android
https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_AU&pli=1

Scan QR code from frontend terminal with device

Done
The FloatCal app should open and load via expo go
## Development

### Naming Conventions

#### Backend
All classes, objects and database models should use PascalCase

All methods, variables and functions should use snake_case

All constants should use UPPERCASE

#### Frontend
All React Components must be PascalCase as dictated by React

All variable and function names should use camelCase

### Other conventions
Use comments in the format `TODO: {content}` to indicate future work needs to be done


## Scope

Timezones are currently ignored
Components do not need to be compatible with android, though they generally still are

## TODO

Critical - Mismatch between frontend and backend when applying preferred windows. Will cause problems when implementing automatical scheduling.

### Once all code is finished
Check all variable, class and other names. Make sure they align with stated naming conventions
Check the semantic name of all variables and change any that don't make sense
Search codebase for "TODO:" and either remove or fix each of these comments