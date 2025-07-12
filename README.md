## Create virtual environment (Backend)
```
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```
**install Dependencies**
```
pip install -r requirements.txt
```

**How to run**
```
docker-compose down
docker-compose up -d --build
```