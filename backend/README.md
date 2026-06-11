# FloatCal Backend

## How to run
```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## For development

All in One
```bash
uv run ruff check . && uv run ruff format . && uv run mypy .
```
Syntax and Formatting
```bash
uv run ruff check
```
```bash
uv run ruff format .
```
Type problems and structural Flaws
```bash
uv run mypy .
```