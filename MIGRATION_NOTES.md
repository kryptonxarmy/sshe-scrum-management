# Migration Notes

## 20250821000000_add_released_status

This migration adds a new `RELEASED` status to the `ProjectStatus` enum.

### For other developers:

If you encounter enum errors when pulling this branch, please run:

```bash
npx prisma db push
```

This will sync your database schema with the updated Prisma schema.

### Changes made:
- Added `RELEASED` to `ProjectStatus` enum in `prisma/schema.prisma`
- Projects with `RELEASED` status will be filtered out from main project list
- New archive page available for PROJECT_OWNER role to view released projects

### API Changes:
- New endpoint: `PATCH /api/projects/[id]/release`
- New endpoint: `GET /api/projects/released`
- Updated project filtering in main API to exclude RELEASED projects
