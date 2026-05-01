import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Optional, Dict
from app.schemas import Method

class COSECAdapter:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.auth = (username, password)
        self.timeout = httpx.Timeout(5.0)

    async def fetch_events(self, last_index: int = 0) -> List[Dict]:
        """
        Polls COSEC device for events.
        Example URL: http://<ip>/device.cgi/events?action=get&index=<last_index>
        """
        url = f"{self.base_url}/device.cgi/events"
        params = {"action": "get", "index": last_index}
        
        try:
            async with httpx.AsyncClient(auth=self.auth, timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return self._parse_events(response.text)
        except Exception as e:
            print(f"[COSEC_ERROR] Failed to fetch events: {e}")
            return []

    async def open_door(self, door_id: str = "1") -> bool:
        """
        Triggers door open command.
        Example URL: http://<ip>/device.cgi/commands?action=set&cmd=open-door&doorid=1
        """
        url = f"{self.base_url}/device.cgi/commands"
        params = {"action": "set", "cmd": "open-door", "doorid": door_id}
        
        try:
            async with httpx.AsyncClient(auth=self.auth, timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                return response.status_code == 200
        except Exception as e:
            print(f"[COSEC_ERROR] Failed to trigger door: {e}")
            return False

    def _parse_events(self, raw_data: str) -> List[Dict]:
        """
        Parses COSEC XML/Text response.
        Expected format (simplified):
        <events>
            <event index="101" userid="12" timestamp="2023-10-27 10:30:01" type="face" />
        </events>
        """
        events = []
        try:
            # Check if it's XML
            if raw_data.strip().startswith('<'):
                root = ET.fromstring(raw_data)
                for event_node in root.findall('event'):
                    events.append({
                        "index": int(event_node.get('index', 0)),
                        "device_user_id": event_node.get('userid'),
                        "timestamp": event_node.get('timestamp'),
                        "method": self._map_method(event_node.get('type'))
                    })
            else:
                # Handle CSV/Text format if XML fails
                lines = raw_data.strip().split('\n')
                for line in lines:
                    parts = line.split(',')
                    if len(parts) >= 4:
                        events.append({
                            "index": int(parts[0]),
                            "device_user_id": parts[1],
                            "timestamp": parts[2],
                            "method": self._map_method(parts[3])
                        })
        except Exception as e:
            print(f"[COSEC_PARSER_ERROR] {e}")
        return events

    def _map_method(self, cosec_type: str) -> Method:
        mapping = {
            "face": Method.FACE,
            "rfid": Method.RFID,
            "finger": Method.FACE, # Fallback
        }
        return mapping.get(cosec_type.lower(), Method.RFID)
