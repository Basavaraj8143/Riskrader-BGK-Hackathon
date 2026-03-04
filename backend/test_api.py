import urllib.request, json, time

test_cases = [
    "Congratulations! Pay Rs 1 via UPI to claim your Rs 50000 BHIM lottery prize. Scan QR code now. Offer expires in 24 hours!",
    "Your SBI KYC is expired. Click bit.ly/sbixyz to update or account blocked in 24 hours.",
    "Meeting at 5pm tomorrow at office",
    "Join our WhatsApp group! Guaranteed 5% daily returns. Invest Rs 5000 get Rs 50000 in 30 days!",
    "TRAI will disconnect your SIM in 2 hours due to illegal activity. Press 9 now to speak to the cyber officer.",
]

for msg in test_cases:
    data = json.dumps({"message": msg}).encode()
    req = urllib.request.Request(
        "http://localhost:8000/api/analyze",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        res = json.loads(r.read())
        print(f"Score:{res['score']:3d} | {res['level']:6s} | {res['category'][:22]:22s} | by: {res['powered_by'][:15]}")
        print(f"  Msg: {msg[:65]}...")
        if res.get("explanation"):
            print(f"  AI:  {res['explanation'][:100]}...")
        print()
    time.sleep(0.5)
