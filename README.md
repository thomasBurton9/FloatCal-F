# FloatCal

Expo Go based calendar with automatic scheduling.


Fast API backend located in backend/

Expo Go react native frontend located in frontend/

## How to run

### Backend

```bash
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
npx expo start
```

## Development

### Naming Conventions

#### Backend
All classes, objects and database models should use PascalCase

All methods, variables and functions should use snake_case

All constants should use UPPERCASE

#### Frontend
All React Components must be PascalCase as dictated by React

All variable and function names should use CamelCase

### Other conventions
Use comments in the format `TODO: {content}` to indicate future work needs to be done