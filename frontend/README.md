# FloatCal Frontend

## How to run

Create `.env` file in frontend/ directory
It should have

API_URL={your_api_url}

Example:

```.env
API_URL=xxx.yyy.xx.yyy:8000/api
```

```bash
npx expo start
```

## For development

Find flaws in code

```bash
npm run lint
```

Format code

```bash
npm run format
```

All in one

```bash
npm run format && npm run lint
```

Run app

```bash
npx expo start
```
