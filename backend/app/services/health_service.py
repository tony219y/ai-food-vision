import time

class ServerHealth:
    def health_check_status(self):
        try:
            print("ping")
            time.sleep(0.5)
            print("pong")
            time.sleep(0.5)
            print("ping")
            time.sleep(0.5)
            print("pong")
            return {"status": "ok"}, 200
        except Exception:
            return {"status": "unhealthy"}, 503