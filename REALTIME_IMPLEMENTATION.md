# Real-Time Sensor Monitoring Implementation

## What Changed

### 1. **Real-Time Device Tracking** (`/app/api/predict/route.ts`)
   - Added in-memory storage for active devices
   - Tracks device ID, last update time, and sensor readings
   - Automatically cleans up inactive devices (>5 minutes)
   - Added GET endpoint to fetch all active devices and their latest readings

### 2. **New Components**
   - **`RealtimeSensorStatus`** (`components/realtime-sensor-status.tsx`)
     - Displays active device count (updates every 3 seconds)
     - Shows "Live" or "Offline" status with color indicators
     - Displays latest sensor readings in real-time
     - Shows "Not connected" message when no devices active
   
### 3. **Custom Hook** (`hooks/use-active-devices.ts`)
   - `useActiveDevices()` - Polls the `/api/predict` endpoint for active devices
   - Configurable poll interval (default: 5 seconds)
   - Returns device list, loading, and error states

### 4. **Updated Dashboard** (`app/dashboard/page.tsx`)
   - Replaced static "4 Sensors" card with dynamic real-time component
   - Now shows actual number of connected devices
   - Displays live sensor readings when devices are connected
   - Shows appropriate message when disconnected

### 5. **Updated Middleware** (`middleware.ts`)
   - Added `/api/predict` to public routes (no authentication required)
   - ESP32 can now send data without login

### 6. **ESP32 Updates** (`esp32_biofloc_monitor.ino`)
   - Added device ID header (`x-device-id: esp32-biofloc-01`)
   - Improved error messaging
   - Added WiFi status checks in loop

## How It Works

### Real-Time Flow:
1. ESP32 sends sensor data to `/api/predict` with device ID
2. API stores reading with timestamp in memory
3. Dashboard polls `/api/predict` (GET) every 3 seconds
4. Gets list of active devices and their latest readings
5. Displays real-time status and readings

### Device Status Logic:
- **Active**: Device sent data within last 2 minutes
- **Inactive**: No data for 2+ minutes
- **Cleaned Up**: Removed from memory after 5 minutes

### Multiple Device Support:
- Each ESP32 sends unique `x-device-id` header
- Dashboard shows all active devices
- Displays latest reading from most recent device

## Files Created/Modified

✅ Created:
- `lib/db-schema.ts` - Type definitions
- `hooks/use-active-devices.ts` - Real-time polling hook
- `components/realtime-sensor-status.tsx` - Real-time status component

✅ Modified:
- `app/api/predict/route.ts` - Added device tracking
- `app/dashboard/page.tsx` - Integrated real-time components
- `middleware.ts` - Made `/api/predict` public
- `esp32_biofloc_monitor.ino` - Added device ID header

## Testing

1. Start your dev server: `npm run dev`
2. Upload updated ESP32 code
3. Dashboard should now show:
   - Device count (updates in real-time)
   - Live sensor readings when connected
   - "Not connected" when no devices active

## Future Improvements

- Move to Supabase real-time subscriptions (instead of polling)
- Store readings in database for history
- Add device management (register/name devices)
- Multi-user support with device permissions
- WebSocket for true real-time updates
