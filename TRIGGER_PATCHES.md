# Feature 8 — Notification Trigger Patches

These are the hand-edits needed in existing route files to wire up notifications.
The apply script will attempt these via sed, but verify each file after.

## 1. `apps/api/src/routes/social.ts`

**Add at top (after other imports):**
```ts
import { sendNotification } from './notifications';
```

**In `POST /friends/add` handler** (after creating the friendship row, before returning):
```ts
// Fire notification to addressee
sendNotification({
  userId: addresseeId,
  type: 'friend_request',
  title: 'New friend request',
  body: `${requesterName} wants to be friends`,
  data: { requesterId, friendshipId: friendship.id },
}).catch(() => {});
```

**In `POST /friends/respond` handler** (when accepted):
```ts
if (response === 'accept') {
  sendNotification({
    userId: requesterId,
    type: 'friend_accepted',
    title: 'Friend request accepted',
    body: `${addresseeName} accepted your friend request`,
    data: { friendshipId },
  }).catch(() => {});
}
```

**In `POST /posts/:id/like` handler** (when new like, not unlike):
```ts
if (isNewLike && post.user_id !== userId) {
  sendNotification({
    userId: post.user_id,
    type: 'social_like',
    title: 'New like',
    body: `${likerName} liked your post`,
    data: { postId, likerId: userId },
  }).catch(() => {});
}
```

**In `POST /posts/:id/comments` handler**:
```ts
if (post.user_id !== userId) {
  sendNotification({
    userId: post.user_id,
    type: 'social_comment',
    title: 'New comment',
    body: `${commenterName}: ${commentBody.slice(0, 80)}`,
    data: { postId, commentId: newComment.id },
  }).catch(() => {});
}
```

## 2. `apps/api/src/routes/parties.ts`

**Add import:**
```ts
import { sendNotification } from './notifications';
```

**In `POST /parties/:id/invite` handler:**
```ts
sendNotification({
  userId: invitedUserId,
  type: 'party_invite',
  title: 'Party invite',
  body: `${inviterName} invited you to a round at ${courseName}`,
  data: { partyId, inviterId },
}).catch(() => {});
```

**In `POST /parties/:id/finish` handler** (inside member loop):
```ts
sendNotification({
  userId: member.user_id,
  type: 'round_finished',
  title: 'Round finished!',
  body: `${scoreToPar > 0 ? '+' : ''}${scoreToPar} at ${courseName} · +${pointsEarned} pts`,
  data: { partyId, roundId, pointsEarned },
}).catch(() => {});

// If tier changed
if (oldTier !== newTier) {
  sendNotification({
    userId: member.user_id,
    type: newRank > oldRank ? 'rank_up' : 'rank_down',
    title: newRank > oldRank ? '🎉 Rank up!' : 'Rank change',
    body: `You're now ${newTier.replace('_', ' ')}`,
    data: { oldTier, newTier, oldRank, newRank },
  }).catch(() => {});
}
```

## 3. `apps/api/src/routes/leagues.ts`

**Add import:**
```ts
import { sendNotification } from './notifications';
```

**In `POST /:id/invite`:**
```ts
sendNotification({
  userId: invitedUserId,
  type: 'league_invite',
  title: 'League invite',
  body: `${inviterName} invited you to ${leagueName}`,
  data: { leagueId },
}).catch(() => {});
```

**In `POST /:id/matches` (after recording result):**
```ts
// Notify both players of match result
const winner = score1 > score2 ? player1Name : score2 > score1 ? player2Name : null;
for (const pid of [player1Id, player2Id]) {
  sendNotification({
    userId: pid,
    type: 'league_match_result',
    title: 'Match result posted',
    body: winner ? `${winner} won ${Math.max(score1, score2)}-${Math.min(score1, score2)}` : `Draw ${score1}-${score2}`,
    data: { leagueId, matchId },
  }).catch(() => {});
}
```

## 4. `apps/api/src/routes/tournaments.ts`

**Add import:**
```ts
import { sendNotification } from './notifications';
```

**In `POST /:id/complete` (notify top 3 winners):**
```ts
for (let i = 0; i < Math.min(topFinishers.length, 3); i++) {
  const finisher = topFinishers[i];
  const medals = ['🥇 1st place', '🥈 2nd place', '🥉 3rd place'];
  sendNotification({
    userId: finisher.user_id,
    type: 'tournament_result',
    title: `${medals[i]} — ${tournamentName}`,
    body: `+${finisher.pointsAwarded} ranking points`,
    data: { tournamentId, position: i + 1 },
  }).catch(() => {});
}
```

## 5. `apps/api/src/routes/bookings.ts`

**Add import:**
```ts
import { sendNotification } from './notifications';
```

**In `POST /bookings` handler (after successful booking):**
```ts
sendNotification({
  userId: booking.user_id,
  type: 'booking_confirmed',
  title: 'Tee time booked!',
  body: `${courseName} · ${new Date(slot.starts_at).toLocaleString()}`,
  data: { bookingId: booking.id, courseId, slotId },
}).catch(() => {});
```

**In `POST /bookings/:id/cancel` handler:**
```ts
sendNotification({
  userId: booking.user_id,
  type: 'booking_cancelled',
  title: 'Booking cancelled',
  body: `Your booking at ${courseName} has been cancelled`,
  data: { bookingId: booking.id },
}).catch(() => {});
```
