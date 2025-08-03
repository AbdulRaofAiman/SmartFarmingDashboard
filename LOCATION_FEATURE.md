# Location Feature Documentation

## New Features

Added location input functionality to the Dashboard page, allowing users to freely enter and save device locations.

### Feature Highlights

1. **Simple Location Input**
   - Text input field for entering any location name
   - Placeholder text: "Enter device location"
   - Real-time validation (Save button disabled when empty)

2. **Save Functionality**
   - Save button to store location in Firebase database
   - Button is disabled when input is empty or only whitespace
   - Automatic trimming of whitespace from location names

3. **Real-time Synchronization**
   - Location information is saved to Firebase database in real-time
   - Location changes are immediately reflected in the interface
   - Supports multi-device location management

### How to Use

1. On the Dashboard page, select the device you want to configure
2. Type the desired location name in the location text field
3. Click "Save" button to save the location settings
4. Location information will be displayed below the device information

### Technical Implementation

- Uses React Context for state management
- Firebase Realtime Database for location information storage
- Material-UI components for modern user interface
- Real-time data change monitoring
- Input validation and error handling

### Database Structure

Location information is stored in Firebase at the following path:
```
{device_id}/location
```

Examples:
```
device_001/location: "Field A"
device_002/location: "Greenhouse 1"
device_003/location: "Backyard Garden"
```

### Files Modified

1. `src/types/DeviceContext.ts` - Added location-related type definitions
2. `src/components/DeviceProvider.tsx` - Added location state management
3. `src/components/Dashboard.tsx` - Added location input UI and logic 