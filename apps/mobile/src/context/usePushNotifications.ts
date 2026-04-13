/**
 * Push Notifications Hook — Feature 8
 *
 * Requests notification permissions, retrieves the Expo push token,
 * registers it with our API, and wires up foreground/response listeners.
 *
 * Usage: call usePushNotifications() from your root (_layout.tsx) once
 * the user is authenticated.
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { router } from 'expo-router';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

// Configure how notifications are shown when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push only works on physical devices
    return null;
  }

  // Android: setup default channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B6B3A',
    });
  }

  // Check existing permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  // Request if not granted
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Retrieve Expo push token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;

    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResult.data;
  } catch (err) {
    console.warn('Failed to get Expo push token:', err);
    return null;
  }
}

export function usePushNotifications() {
  const { session } = useAuth();
  const tokenRef = useRef<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!session) return;

    // 1. Register for push and send token to server
    registerForPushNotificationsAsync().then((token) => {
      if (!token) return;
      tokenRef.current = token;

      fetch(`${API_URL}/v1/notifications/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          expoPushToken: token,
          deviceType: Platform.OS,
          deviceName: Device.deviceName ?? null,
        }),
      }).catch(() => {});
    });

    // 2. Listen for notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      // Notification received — system handles the banner via handler above
      console.log('Notification received:', notif.request.content.title);
    });

    // 3. Listen for notification taps (deep linking)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      handleNotificationTap(data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [session]);

  return { pushToken: tokenRef.current };
}

// ─── Deep link routing based on notification type ───────────────────────────

function handleNotificationTap(data: Record<string, unknown> | undefined) {
  if (!data) return;

  const type = data['type'] as string | undefined;

  switch (type) {
    case 'friend_request':
    case 'friend_accepted':
      router.push('/(tabs)/social');
      break;
    case 'party_invite':
    case 'party_starting':
      if (data['partyId']) router.push(`/party/${data['partyId']}` as any);
      break;
    case 'round_finished':
    case 'rank_up':
    case 'rank_down':
      router.push('/(tabs)/compete');
      break;
    case 'league_invite':
    case 'league_match_result':
      router.push('/leagues' as any);
      break;
    case 'tournament_starting':
    case 'tournament_result':
      router.push('/tournaments' as any);
      break;
    case 'social_like':
    case 'social_comment':
      router.push('/(tabs)/social');
      break;
    case 'booking_confirmed':
    case 'booking_reminder':
    case 'booking_cancelled':
      router.push('/(tabs)/bookings' as any);
      break;
    default:
      router.push('/notifications' as any);
  }
}
