# Tournament lifecycle, persistence, and reconnect

## Lifecycle
1. create → returns tournament id
2. join → players added
3. start → rounds progress (game rotation)
4. submit → scores aggregated per round
5. leaderboard → total score sorted DESC
6. complete → final standings
7. reconnect → player rejoins with cached ids and receives snapshot

## REST endpoints
- GET /api/leaderboard/:gameId?limit=10
  - Response: `{ success, data: { game, leaderboard: [{ user_id, top_score }], total } }`
- GET /api/tournament/:id/status
  - Response: `{ success, data: { id, players[], rounds[], currentRound, leaderboard[] } }`

## Socket.IO
- Client emits `reconnect_tournament` with `{ tournamentId, userId }`
- Server emits `tournament_state` snapshot with tournament, leaderboard, and ghostData

## Reconnect (client)
- Cache `tournamentId` and `userId` locally (e.g., PlayerPrefs in Unity)
- On connect, emit `reconnect_tournament` and update UI with returned snapshot

## Testing notes
- CI sets `SKIP_MIGRATIONS=1` to avoid real DB.
- Use in-memory or mocks for persistence tests; avoid external Postgres in CI.

## Environment
- DB_* variables for real deployments
- For tests, no DB required (migrations are non-fatal and skipped via flag)
