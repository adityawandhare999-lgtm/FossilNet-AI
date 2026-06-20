// Central API configuration for FossilNet
// To access from a phone/device on the same Wi-Fi network,
// change the IP below to your laptop's local IP address.
//
// Find your IP:
//   Windows → run: ipconfig   (look for "IPv4 Address")
//   macOS   → run: ipconfig getifaddr en0
//
// Also make sure Django runs on:  python manage.py runserver 0.0.0.0:8000
// And Vite runs on:               npm run dev -- --host

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.1.7:8000';

export default API_BASE;
