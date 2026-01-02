# Notification System Documentation

## Overview

The PC Remote Control app now has a fully functional notification system that alerts you about important events related to your PCs. All notification settings are persisted and can be customized through the Settings screen.

## Features

### 1. **Master Notification Toggle**

- Enable or disable all app notifications
- Automatically requests notification permissions when enabled
- All other notification settings are disabled when master toggle is off

### 2. **Status & Availability Notifications**

#### Device Online (WOL)

- **When**: Triggered when a PC successfully wakes up and connects after a Wake-on-LAN command
- **Notification**: "PC Online - [PC Name] is now online and ready to use."
- **Also triggers**: When sending a WOL packet to inform you the wake command was sent

#### Unexpected Disconnect

- **When**: Triggered when a monitored PC goes offline unexpectedly
- **Notification**: "PC Disconnected - [PC Name] has gone offline unexpectedly."
- **Use case**: Helps you know if your PC crashed, lost power, or lost network connection

#### SSH Connection Ready

- **When**: Future feature - will notify when port 22 is open for secure commands
- **Status**: Not yet implemented (placeholder for future development)

### 3. **Automation & Geofencing** (Future Features)

#### Arrival Suggestions

- **When**: Future feature - will prompt to wake devices when you arrive home
- **Status**: Not yet implemented (requires location permissions)

#### Departure Warnings

- **When**: Future feature - will remind you to shut down PCs when you leave
- **Status**: Not yet implemented (requires location permissions)

## Technical Implementation

### Architecture

```
contexts/notifications-context.tsx
├── NotificationsProvider - Main context provider
├── NotificationSettings - Type definitions for all settings
└── useNotifications - Hook to access notification functionality
```

### Key Components

1. **NotificationsContext** (`contexts/notifications-context.tsx`)

   - Manages all notification settings
   - Handles permission requests
   - Provides `sendNotification` function
   - Persists settings using SecureStore

2. **PC Status Hook** (`hooks/use-pc-status.ts`)

   - Monitors PC status every 10 seconds
   - Detects status changes (online ↔ offline)
   - Sends notifications based on user preferences
   - Tracks previous status to avoid duplicate notifications

3. **Notification Settings Screen** (`components/settings/notification-settings.tsx`)
   - User interface for managing notification preferences
   - Real-time updates to notification settings
   - Visual feedback when master toggle is disabled

### Data Flow

```
PC Status Change → usePCStatus Hook → Check Settings → Send Notification
                                    ↓
                            Update PC Context
```

## Usage

### For Users

1. **Enable Notifications**

   - Go to Settings → Notifications
   - Toggle "Allow Notifications" on
   - Grant notification permissions when prompted

2. **Customize Alerts**

   - Enable/disable specific notification types
   - Each setting has a descriptive subtitle explaining when it triggers

3. **Receive Notifications**
   - Notifications appear even when app is in background
   - Tap notification to open the app
   - Notifications include PC name and status information

### For Developers

#### Sending a Custom Notification

```typescript
import { useNotifications } from "@/contexts/notifications-context";

function MyComponent() {
  const { sendNotification, settings } = useNotifications();

  const handleEvent = async () => {
    // Check if notifications are enabled
    if (settings.masterEnabled) {
      await sendNotification("Title", "Body message", {
        customData: "optional",
      });
    }
  };
}
```

#### Adding a New Notification Setting

1. Update `NotificationSettings` interface in `notifications-context.tsx`:

```typescript
export interface NotificationSettings {
  // ... existing settings
  myNewSetting: boolean;
}
```

2. Update `DEFAULT_SETTINGS`:

```typescript
const DEFAULT_SETTINGS: NotificationSettings = {
  // ... existing defaults
  myNewSetting: false,
};
```

3. Add UI in `notification-settings.tsx`:

```tsx
<SettingItem
  label="My New Setting"
  subtitle="Description of when this triggers"
  icon={<Ionicons name="icon-name" size={20} color="#color" />}
  iconBg="bg-color-500/10"
  rightElement={
    <Switch
      value={settings.myNewSetting}
      onValueChange={(value) => updateSetting("myNewSetting", value)}
      trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
    />
  }
/>
```

4. Use the setting in your logic:

```typescript
if (settings.myNewSetting) {
  await sendNotification("Title", "Message");
}
```

## Permissions

### iOS

- Automatically requests notification permissions when user enables notifications
- Permissions are handled by expo-notifications
- Users can revoke permissions in iOS Settings

### Android

- Notification permissions are requested at runtime (Android 13+)
- For Android 12 and below, notifications work by default
- Users can manage permissions in Android Settings

## Configuration

### app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#3b82f6",
          "sounds": []
        }
      ]
    ]
  }
}
```

### Notification Handler

Configured in `notifications-context.tsx`:

```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

## Storage

All notification settings are persisted using `expo-secure-store`:

- Storage key: `pc_remote_notifications`
- Format: JSON string of `NotificationSettings`
- Encrypted on device
- Survives app restarts

## Future Enhancements

1. **SSH Connection Detection**

   - Monitor port 22 availability
   - Notify when SSH becomes available

2. **Geofencing**

   - Location-based automation
   - Arrival/departure triggers
   - Requires "Always Allow" location permissions

3. **Scheduled Notifications**

   - Reminder to shut down PCs at specific times
   - Daily/weekly schedules

4. **Rich Notifications**

   - Action buttons (e.g., "Turn Off Now", "Dismiss")
   - Images/icons for different PC types
   - Custom sounds per notification type

5. **Notification History**
   - View past notifications
   - Filter by type and PC
   - Export notification logs

## Troubleshooting

### Notifications Not Appearing

1. **Check Master Toggle**

   - Ensure "Allow Notifications" is enabled in Settings

2. **Verify Permissions**

   - Check device Settings → Apps → PC Remote Control → Notifications
   - Ensure notifications are allowed

3. **Check Specific Settings**

   - Verify the specific notification type is enabled
   - Example: "Device Online (WOL)" must be on to receive online alerts

4. **Rebuild App**
   - After adding expo-notifications, run:
   ```bash
   bun run prebuild
   bun run ios  # or android
   ```

### Duplicate Notifications

- The system tracks previous status to prevent duplicates
- If you receive duplicates, check if multiple instances of the app are running

### Delayed Notifications

- PC status is checked every 10 seconds
- Notifications may appear up to 10 seconds after status change
- This is by design to reduce battery usage

## Dependencies

- `expo-notifications`: ^0.32.15
- `expo-secure-store`: For settings persistence
- `react-native-safe-area-context`: For UI layout

## Testing

### Manual Testing

1. **Online Alert**

   - Turn off a PC
   - Wait for status to show offline
   - Turn on the PC
   - Should receive "PC Online" notification

2. **Disconnect Alert**

   - Ensure PC is online
   - Disconnect PC from network or shut it down
   - Should receive "PC Disconnected" notification

3. **WOL Notification**
   - Send Wake-on-LAN to offline PC
   - Should receive "Wake-on-LAN Sent" notification
   - When PC comes online, should receive "PC Online" notification

### Automated Testing (Future)

```typescript
// Example test structure
describe("Notifications", () => {
  it("should send notification when PC comes online", async () => {
    // Test implementation
  });

  it("should respect master toggle setting", async () => {
    // Test implementation
  });
});
```

## Performance Considerations

- Notifications are only sent when settings allow
- Status checks run every 10 seconds (configurable)
- Previous status tracking prevents unnecessary notifications
- Settings are cached in memory after initial load

## Security

- All settings stored in SecureStore (encrypted)
- No sensitive data in notification content
- Notification data includes only PC ID and type
- No network requests for notifications (local only)
