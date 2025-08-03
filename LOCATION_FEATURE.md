# Location Feature Documentation

## New Features

Added location selection functionality to the Dashboard page, allowing users to freely change device locations.

### Feature Highlights

1. **Preset Location Options**
   - Field A
   - Field B  
   - Field C
   - Greenhouse 1
   - Greenhouse 2
   - Custom Location

2. **Custom Location Input**
   - When "Custom Location" is selected, a text input field appears
   - Users can enter any location name
   - Click "Save" button to save the custom location

3. **Real-time Synchronization**
   - Location information is saved to Firebase database in real-time
   - Location changes are immediately reflected in the interface
   - Supports multi-device location management

### How to Use

1. On the Dashboard page, select the device you want to configure
2. Choose a preset location from the dropdown or select "Custom Location"
3. If selecting custom location, enter the location name in the text field
4. Click "Save" button to save the location settings
5. Location information will be displayed below the device information

### Technical Implementation

- Uses React Context for state management
- Firebase Realtime Database for location information storage
- Material-UI components for modern user interface
- Real-time data change monitoring

### Database Structure

Location information is stored in Firebase at the following path:
```
{device_id}/location
```

Examples:
```
device_001/location: "Field A"
device_002/location: "Greenhouse 1"
```

### Files Modified

1. `src/types/DeviceContext.ts` - Added location-related type definitions
2. `src/components/DeviceProvider.tsx` - Added location state management
3. `src/components/Dashboard.tsx` - Added location selection UI and logic 