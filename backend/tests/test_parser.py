import pytest
from app.adapters.cosec import COSECAdapter
from app.schemas import Method

@pytest.fixture
def adapter():
    return COSECAdapter("http://localhost:8080", "admin", "password")

def test_parse_xml_events(adapter):
    xml_data = """
    <events>
        <event index="105" userid="12" timestamp="2023-10-27 12:00:00" type="face" />
        <event index="106" userid="101" timestamp="2023-10-27 12:05:00" type="rfid" />
    </events>
    """
    events = adapter._parse_events(xml_data)
    
    assert len(events) == 2
    assert events[0]["index"] == 105
    assert events[0]["device_user_id"] == "12"
    assert events[0]["method"] == Method.FACE
    assert events[1]["index"] == 106
    assert events[1]["method"] == Method.RFID

def test_parse_malformed_xml(adapter):
    malformed_data = "<events><event index='101' userid='12'" # Missing closing tag
    events = adapter._parse_events(malformed_data)
    assert len(events) == 0

def test_method_mapping(adapter):
    assert adapter._map_method("face") == Method.FACE
    assert adapter._map_method("rfid") == Method.RFID
    assert adapter._map_method("unknown") == Method.RFID # Default fallback

def test_parse_text_csv(adapter):
    # COSEC sometimes returns CSV-like text
    text_data = "101,12,2023-10-27 10:00:00,face\n102,15,2023-10-27 10:01:00,rfid"
    events = adapter._parse_events(text_data)
    
    assert len(events) == 2
    assert events[0]["index"] == 101
    assert events[0]["device_user_id"] == "12"
    assert events[1]["index"] == 102
