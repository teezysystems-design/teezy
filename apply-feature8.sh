#!/usr/bin/env bash
set -euo pipefail

# ══════════════════════════════════════════════════════════════════════════════
# PAR-Tee — Feature 8: Notifications + Polish
# Apply script — copies new/updated files into the monorepo
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$SCRIPT_DIR/feature8-files"

REQUIRED_FILES=(
  0018_notifications_polish.sql
  notifications.ts
  usePushNotifications.ts
  notifications_index.tsx
  notifications_preferences.tsx
  TRIGGER_PATCHES.md
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$SRC/$f" ]]; then
    echo "❌ Missing $SRC/$f"; exit 1
  fi
done
echo "✅ All source files found (${#REQUIRED_FILES[@]} files)"

# ─── 1. SQL Migration ────────────────────────────────────────────────────────

mkdir -p supabase/migrations
cp "$SRC/0018_notifications_polish.sql" supabase/migrations/0018_notifications_polish.sql
echo "   ✅ 0018_notifications_polish.sql → supabase/migrations/"

# ─── 2. API Notifications Route ──────────────────────────────────────────────

cp "$SRC/notifications.ts" apps/api/src/routes/notifications.ts
echo "   ✅ notifications.ts → apps/api/src/routes/"

# ─── 3. Mobile: Push hook + notification screens ─────────────────────────────

mkdir -p apps/mobile/src/context
mkdir -p apps/mobile/app/notifications

cp "$SRC/usePushNotifications.ts" apps/mobile/src/context/usePushNotifications.ts
echo "   ✅ usePushNotifications.ts → apps/mobile/src/context/"

cp "$SRC/notifications_index.tsx" apps/mobile/app/notifications/index.tsx
echo "   ✅ notifications_index.tsx → apps/mobile/app/notifications/index.tsx"

cp "$SRC/notifications_preferences.tsx" apps/mobile/app/notifications/preferences.tsx
echo "   ✅ notifications_preferences.tsx → apps/mobile/app/notifications/preferences.tsx"

# ─── 4. Copy trigger patches reference doc ───────────────────────────────────

cp "$SRC/TRIGGER_PATCHES.md" TRIGGER_PATCHES.md
echo "   ✅ TRIGGER_PATCHES.md → repo root (reference doc)"

# ─── 5. Register notifications route in API index ────────────────────────────

echo "🔧 Patching apps/api/api/index.ts to register notifications route..."
API_INDEX="apps/api/api/index.ts"
if [[ -f "$API_INDEX" ]]; then
  if grep -q 'notificationsRouter' "$API_INDEX"; then
    echo "   ⏭  notificationsRouter already registered"
  else
    sed -i '' '/^import.*from.*routes/a\
import notificationsRouter from '"'"'../src/routes/notifications'"'"';
' "$API_INDEX"

    # Mount at /notifications — insert after last .route() call
    sed -i '' '/\.route.*social/a\
  .route('"'"'/notifications'"'"', notificationsRouter)
' "$API_INDEX"

    echo "   ✅ Registered notificationsRouter"
    echo "   ⚠️  VERIFY: apps/api/api/index.ts has the import and .route('/notifications', ...) call"
  fi
else
  echo "   ⚠️  $API_INDEX not found — register manually"
fi

# ─── 6. Register notifications screens in _layout.tsx ────────────────────────

echo "🔧 Patching apps/mobile/app/_layout.tsx to register notifications screens..."
ROOT_LAYOUT="apps/mobile/app/_layout.tsx"
if [[ -f "$ROOT_LAYOUT" ]]; then
  if grep -q 'notifications/index' "$ROOT_LAYOUT"; then
    echo "   ⏭  Notifications screens already registered"
  else
    sed -i '' '/+not-found/i\
        <Stack.Screen name="notifications/index" options={{ headerShown: false }} />\
        <Stack.Screen name="notifications/preferences" options={{ headerShown: false }} />
' "$ROOT_LAYOUT"
    echo "   ✅ Registered notifications/index and notifications/preferences screens"
  fi
else
  echo "   ⚠️  $ROOT_LAYOUT not found"
fi

# ─── 7. Install Expo notification deps ───────────────────────────────────────

echo ""
echo "📦 Installing mobile dependencies..."
echo "   Run these in apps/mobile/ if not already installed:"
echo ""
echo "   cd apps/mobile"
echo "   npx expo install expo-notifications expo-device expo-constants"
echo "   cd ../.."
echo ""

# ─── Done ────────────────────────────────────────────────────────────────────

echo ""
echo "══════════════════════════════════════════════════════════════════════"
echo "✅ Feature 8 core files applied!"
echo ""
echo "⚠️  REQUIRED NEXT STEPS (in order):"
echo ""
echo "  1. Run the SQL migration in Supabase SQL Editor:"
echo "     supabase/migrations/0018_notifications_polish.sql"
echo ""
echo "  2. Install mobile deps:"
echo "     cd apps/mobile"
echo "     npx expo install expo-notifications expo-device expo-constants"
echo "     cd ../.."
echo ""
echo "  3. Add usePushNotifications() to apps/mobile/app/_layout.tsx"
echo "     (or wherever AuthContext is set up) — call it inside authed UI:"
echo ""
echo "       import { usePushNotifications } from '../src/context/usePushNotifications';"
echo "       // ... inside component body: usePushNotifications();"
echo ""
echo "  4. VERIFY apps/mobile/app.json (or app.config.ts) has:"
echo "     - 'expo.extra.eas.projectId' set to your EAS project ID"
echo "     - 'expo.notification' config for iOS push credentials"
echo ""
echo "  5. OPTIONAL — Wire up notification triggers in existing routes:"
echo "     See TRIGGER_PATCHES.md for exact code snippets to paste into:"
echo "     - apps/api/src/routes/social.ts (friend, like, comment notifs)"
echo "     - apps/api/src/routes/parties.ts (invite, round finish, rank)"
echo "     - apps/api/src/routes/leagues.ts (invite, match result)"
echo "     - apps/api/src/routes/tournaments.ts (results)"
echo "     - apps/api/src/routes/bookings.ts (confirm, cancel)"
echo ""
echo "  6. Commit + push:"
echo "     git add -A && git commit -m 'feat: notifications + polish (Feature 8)'"
echo "     git push origin feature/8-notifications-polish"
echo ""
echo "══════════════════════════════════════════════════════════════════════"
