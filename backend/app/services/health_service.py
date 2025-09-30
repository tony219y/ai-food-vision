import time

class ServerHealth:
    def health_check_status(self):
        try:
            return {"status": "ok"}, 200
        except Exception:
            return {"status": "unhealthy"}, 503