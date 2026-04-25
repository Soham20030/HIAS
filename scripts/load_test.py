import requests
import time
import uuid
import concurrent.futures

BASE_URL = "http://127.0.0.1:8000"
TOTAL_EVENTS = 1000
CONCURRENT_THREADS = 10

def send_event(i):
    payload = {
        "user_id": f"S{str(i).zfill(3)}",
        "method": "RFID",
        "device_id": f"test_device_{i % 5}"
    }
    start = time.time()
    try:
        response = requests.post(f"{BASE_URL}/access/event", json=payload, timeout=5)
        latency = (time.time() - start) * 1000
        return response.status_code, latency
    except Exception as e:
        return 500, 0

def run_load_test():
    print(f"Starting Load Test: {TOTAL_EVENTS} events...")
    start_time = time.time()
    
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_THREADS) as executor:
        futures = [executor.submit(send_event, i) for i in range(TOTAL_EVENTS)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
    
    total_time = time.time() - start_time
    success_count = sum(1 for status, _ in results if status == 200)
    latencies = [lat for status, lat in results if status == 200]
    
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    max_latency = max(latencies) if latencies else 0
    min_latency = min(latencies) if latencies else 0
    
    print("\n" + "="*40)
    print("LOAD TEST RESULTS")
    print("="*40)
    print(f"Total Events:     {TOTAL_EVENTS}")
    print(f"Success Rate:    {success_count}/{TOTAL_EVENTS} ({success_count/TOTAL_EVENTS*100:.1f}%)")
    print(f"Total Time:      {total_time:.2f} seconds")
    print(f"Throughput:      {TOTAL_EVENTS/total_time:.2f} events/sec")
    print("-" * 40)
    print(f"Avg Latency:     {avg_latency:.2f} ms")
    print(f"Min Latency:     {min_latency:.2f} ms")
    print(f"Max Latency:     {max_latency:.2f} ms")
    print("="*40)

    if avg_latency < 500:
        print("SUCCESS: PERFORMANCE TARGET MET (<500ms)")
    else:
        print("FAILURE: PERFORMANCE TARGET FAILED (>500ms)")

if __name__ == "__main__":
    try:
        # Check health first
        requests.get(f"{BASE_URL}/health", timeout=2)
        run_load_test()
    except requests.exceptions.ConnectionError:
        print("ERROR: Controller is not running at http://127.0.0.1:8000")
