# Place Feature Documentation

## New Features

Added place input functionality and online indicator to the Dashboard page, allowing users to freely enter and save device places and monitor device connectivity status.

### Feature Highlights

1. **Simple Place Input**
   - Text input field for entering any place name
   - Placeholder text: "Enter device place"
   - Real-time validation (Save button disabled when empty)

2. **Save Functionality**
   - Save button to store place in Firebase database
   - Button is disabled when input is empty or only whitespace
   - Automatic trimming of whitespace from place names

3. **Online Indicator**
   - Real-time monitoring of device connectivity status
   - Shows "Online" if device sent data within last 3 seconds
   - Shows "Offline" if device hasn't sent data for more than 3 seconds
   - Displays last update time for each device
   - Visual indicators in device dropdown and selected device info

4. **Real-time Synchronization**
   - Place information is saved to Firebase database in real-time
   - Place changes are immediately reflected in the interface
   - Supports multi-device place management
   - Device status updates automatically

### How to Use

1. On the Dashboard page, select the device you want to configure
2. Type the desired place name in the place text field
3. Click "Save" button to save the place settings
4. Place information will be displayed below the device information
5. Monitor device online status through colored chips (Green = Online, Red = Offline)

### Technical Implementation

- Uses React Context for state management
- Firebase Realtime Database for place information storage
- Material-UI components for modern user interface
- Real-time data change monitoring
- Input validation and error handling
- Time-based online status calculation using formatted_time

### Online Status Logic

The online indicator works by:
1. Parsing the `formatted_time` field from the latest data entry
2. Comparing it with the current system time
3. If the time difference is ≤ 3 seconds, device is marked as "Online"
4. If the time difference is > 3 seconds, device is marked as "Offline"

### Database Structure

Place information is stored in Firebase at the following path:
```
{device_id}/info/place
```

Device data structure (for online status):
```
{device_id}/data/{entry_id}/
  ├── formatted_time: "HH:MM:SS"
  ├── temperature: number
  ├── humidity: number
  ├── moisture: number
  └── place: string
```

Examples:
```
device_001/info/place: "Field A"
device_002/info/place: "Greenhouse 1"
device_003/info/place: "Backyard Garden"
```

### Files Modified

1. `src/types/DeviceContext.ts` - Added place-related type definitions
2. `src/components/DeviceProvider.tsx` - Added place state management
3. `src/components/Dashboard.tsx` - Added place input UI, logic, and online indicator 