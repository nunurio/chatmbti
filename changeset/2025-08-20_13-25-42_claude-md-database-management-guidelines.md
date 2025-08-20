# CLAUDE.md Database Management Guidelines Addition

**Date**: 2025-08-20 13:25:42
**Author**: Claude Documentation Specialist

## Summary
Added comprehensive database management guidelines to CLAUDE.md to establish clear constraints and best practices for Supabase database operations. This update includes project structure corrections and important safety measures to prevent accidental modifications to auto-generated files.

## Changes Made

### 1. Added Database Management Section
- **New Section**: Added complete "Database Management" section with critical constraints
- **重要な制約事項** (Important Constraints):
  - Database structure reference: Use declarative schema files in `supabase/schemas/`
  - Migration file protection: Absolute prohibition on modifying auto-generated migration files
  - Type definitions location: Clarified `@/lib/database.types.ts` as the source
  - Change policy: Avoid database structure changes; require user confirmation when necessary

### 2. Updated Project Structure
- **Added Supabase Directory**: 
  ```
  supabase/
  ├── schemas/                           # 宣言的データベーススキーマ定義
  └── migrations/                        # 自動生成マイグレーション（変更禁止）
  ```
- **Corrected File Location**: Moved `database.types.ts` from `src/lib/supabase/` to `src/lib/` directory
- **Updated Comments**: Added Japanese comments indicating auto-generation status

### 3. File Path Corrections
- **Before**: `src/lib/supabase/database.types.ts`
- **After**: `src/lib/database.types.ts`
- **Reason**: Reflects actual file location and Supabase CLI auto-generation pattern

## Technical Details

The changes establish a clear hierarchy for database management:

1. **Schema Definition**: `supabase/schemas/` contains declarative schema files
2. **Type Generation**: `src/lib/database.types.ts` contains auto-generated TypeScript types
3. **Migration Safety**: `supabase/migrations/` marked as read-only auto-generated content

## Lessons Learned

- **Documentation Accuracy**: Project structure documentation must reflect actual file locations
- **Safety Measures**: Clear warnings about auto-generated files prevent accidental modifications
- **Bilingual Documentation**: Japanese warnings in technical documentation ensure clarity for Japanese developers
- **Change Control**: Establishing approval processes for database changes prevents schema drift

## Future Considerations

- **Schema Evolution**: Any future database changes should follow the established approval process
- **Type Synchronization**: Ensure `database.types.ts` stays synchronized with actual database schema
- **Migration Strategy**: Consider documenting the process for handling necessary schema changes
- **Developer Onboarding**: New team members should be made aware of these constraints early

## Files Modified
- `/Users/takahashigenki/projects/chat-mvp/CLAUDE.md`

## Impact Assessment
- **Risk Level**: Low (documentation only)
- **Breaking Changes**: None
- **Developer Experience**: Improved through clearer guidelines and safety measures