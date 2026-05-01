from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import Response
import time
import random

app = FastAPI(title="COSEC Device Simulator")

# In-memory event store
EVENTS = [
    {"index": 101, "userid": "12", "timestamp": "2023-10-27 10:30:01", "type": "face"},
    {"index": 102, "userid": "15", "timestamp": "2023-10-27 10:35:10", "type": "rfid"},
]

@app.get("/device.cgi/events")
async def get_events(
    action: str = Query(...),
    index: int = Query(0),
    delay: float = Query(0.0),
    fail: bool = Query(False)
):
    if action != "get":
        raise HTTPException(status_code=400, detail="Invalid action")
    
    # Simulation: Delay
    if delay > 0:
        time.sleep(delay)
    
    # Simulation: Random Failure
    if fail:
        raise HTTPException(status_code=500, detail="Internal Device Error")

    # Filter events newer than index
    new_events = [e for e in EVENTS if e["index"] > index]

    # Generate XML Response
    xml_output = "<events>"
    for e in new_events:
        xml_output += f'<event index="{e["index"]}" userid="{e["userid"]}" timestamp="{e["timestamp"]}" type="{e["type"]}" />'
    xml_output += "</events>"

    return Response(content=xml_output, media_type="application/xml")

@app.get("/device.cgi/commands")
async def execute_command(
    action: str = Query(...),
    cmd: str = Query(...),
    doorid: str = Query("1")
):
    if action == "set" and cmd == "open-door":
        print(f"[MOCK_DEVICE] Door {doorid} opened!")
        return {"status": "success", "message": f"Door {doorid} opened"}
    
    raise HTTPException(status_code=400, detail="Invalid command")

@app.post("/simulate/swipe")
async def simulate_swipe(userid: str, type: str = "rfid"):
    """Internal endpoint to trigger a new event on the mock device."""
    new_index = (EVENTS[-1]["index"] + 1) if EVENTS else 100
    event = {
        "index": new_index,
        "userid": userid,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "type": type
    }
    EVENTS.append(event)
    return event

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
