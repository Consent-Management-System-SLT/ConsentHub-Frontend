# ConsentHub Frontend - Cleanup Recommendations

## Files Recommended for Removal

### 1. Debug and Testing Scripts (58 files)
These are temporary debugging and testing scripts not used in production:

- `add-consents-via-api.js`
- `add-debug-endpoint.js`
- `add-demo-vas-services.js`
- `add-sample-dsar-requests.js`
- `admin-dashboard-preview.js`
- `analyze-consent-discrepancy.js`
- `analyze-preferences.js`
- `analyze-privacy-notice-status.js`
- `auth-fix-solution.js`
- `check-admin-filtering.js`
- `check-atlas-database.js`
- `check-audit-logs.js`
- `check-collections.js`
- `check-current-dsar.js`
- `check-customer-data.js`
- `check-customer-subscriptions.js`
- `check-database-users.js`
- `check-database.js`
- `check-dinuka-account.js`
- `check-dinuka-mongodb.js`
- `check-dinuka-preferences.js`
- `check-dsar-database.js`
- `check-login-data.js`
- `check-ojitha-preferences.js`
- `check-ojitha-status.js`
- `check-preferences-count.js`
- `check-raw-response.js`
- `check-user-roles.js`
- `check-user-structure.js`
- `check-vas-indexes.js`
- `clean-dsar-data.js`
- `cleanup-hardcoded-vas.js`
- `cleanup-preferences.js`
- `cleanup-privacy-notices.js`
- `clear-audit-logs.js`
- `clear-cache.js`
- `clear-vas-data.js`
- `compare-api-database-vas.js`
- `compare-api-responses.js`
- `compare-consent-endpoints.js`
- `compare-dashboard-data.js`
- `comprehensive-debug.js`
- `create-additional-data.js`
- `create-audit-logs.js`
- `create-dsar-backend-db.js`
- `create-full-audit-logs.js`
- `create-more-test-logs.js`
- `create-pramodh-dsar.js`
- `create-pramodh-preferences.js`
- `create-privacy-notices-test.js`
- `create-realistic-dsar.js`
- `create-simple-audit-logs.js`
- `create-test-audit-logs.js`
- `create-test-notices-direct.js`
- `create-test-status-changes.js`
- `create-user-preferences.js`
- `create-working-privacy-notices.js`
- `csr-quick-tool.js`
- `debug-*.js` (30+ files)
- `verify-*.js` (5+ files)

### 2. Documentation Files (35+ files)
Outdated or redundant documentation files:

- `ADMIN_DASHBOARD_ASSESSMENT.md`
- `ADMIN_LATEST_CONSENT_ENHANCEMENT.md`
- `ADMIN_PREFERENCE_MANAGEMENT_SYSTEM.md`
- `ADMIN_PREFERENCE_SYSTEM_STATUS.md`
- `ADMIN_VAS_MANAGEMENT_COMPLETE.md`
- `CHRONOLOGICAL_SORTING_FIX.md`
- `CLEANUP_SUMMARY.md`
- `CONSENT_CENTER_DEMO.md`
- `CONSENT_FIXES_COMPLETE.md`
- `CONSENT_REVOCATION_RESOLUTION.md`
- `CONSOLE_ERRORS_FIXED.md`
- `CREATION_ISSUE_RESOLVED.md`
- `CRUD_AUDIT_REPORT.md`
- `CSR_DASHBOARD_ENHANCEMENT_COMPLETE.md`
- `CSR_DASHBOARD_LAYOUT_COMPLETE.md`
- `CSR_GRANT_REVOKE_COMPLETE.md`
- `CSR_PERSISTENCE_FIXED.md`
- `CSR_VAS_FIXES_COMPLETE.md`
- `CSR_VAS_MANAGEMENT_COMPLETE.md`
- `CUSTOMER_DSAR_INTEGRATION_FIXED.md`
- `DEPLOYMENT_READINESS_REPORT.md`
- `DSAR-IMPLEMENTATION-COMPLETE.md`
- `DSAR-STATUS-UPDATE.md`
- `DSAR_AUTOMATION_FIXED.md`
- `DSAR_FIX_SUMMARY.js`
- `DSAR_SUCCESS_SUMMARY.md`
- `DSAR_WORKFLOW_COMPLETE.md`
- `ENHANCED_NOTIFICATION_CENTER_DEMO.md`
- `IMPLEMENTATION_GAP_ANALYSIS.md`
- `LAST_LOGIN_IMPLEMENTATION_COMPLETE.md`
- `LAST_LOGIN_STATUS_CONFIRMED.md`
- `MONGODB_REAL_DATA_INTEGRATION_COMPLETE.md`
- `NOTIFICATION_CENTER_COMPLETE.md`
- `NOTIFICATION_INTEGRATION_GUIDE.md`
- `NOTIFICATION_SYSTEM_COMPLETE.md`
- `PREFERENCE_SAVING_IMPLEMENTATION.md`
- `PRIVACY_NOTICES_COMPLETE.md`
- `PRIVACY_NOTICE_CREATION_DEBUG.md`
- `PRODUCTION_DEPLOYMENT_FIX.md`
- `PRODUCTION_JWT_GUIDE.md`
- `REALTIME_CONSENT_IMPLEMENTATION.md`
- `REALTIME_CONSENT_SYNC_COMPLETE.md`
- `REALTIME_SYNC_COMPLETE.md`
- `REAL_TIME_AUDIT_IMPLEMENTATION.md`
- `RENDER_DEPLOYMENT_FIX.md`
- `SYSTEM_STATUS_REPORT.md`
- `TMF_API_IMPLEMENTATION.js`
- `TMF_IMPLEMENTATION_COMPLETE.md`
- `TOGGLE_BUTTON_COMPLETE.md`
- `VAS_DEPLOYMENT_READY.md`
- `VAS_IMPLEMENTATION_COMPLETE.md`

### 3. Backup and Temporary Files
- `src/components/admin/ComplianceRulesManager_backup.tsx`
- `src/components/admin/ComplianceRulesManager_fixed.tsx`
- `src/components/admin/DashboardHome_clean.tsx`
- `src/components/admin/DSARManager_backup.tsx`
- `src/components/admin/DSARManager_broken.tsx`
- `src/components/admin/DSARManager_clean.tsx`
- `src/components/admin/DSARManager_temp.tsx`
- `src/components/PrivacyNotices_old.tsx`
- `src/services/authService_new.ts`
- `src/services/backupAuthService.ts`
- `src/services/privacyNoticeService_new.ts`
- `src/services/privacyNoticeService_old.ts`
- `src/contexts/AuthContext_new.tsx`

### 4. Test and Demo Files
- `demo-system.js`
- `testRegistration.js`
- `testServer.js`
- `testWebhooks.js`
- `test_customers.csv`
- `test_users.csv`
- `test-login.json`
- `real-time-audit-demo.html`
- `src/debug-api.ts`
- `src/debug-env.js`
- `src/test-direct-auth.ts`
- `src/test-env-config.ts`

### 5. Legacy Deployment Files
- `render.json`
- `render.yaml`
- `production-backend.js`
- `start-consenthub.ps1`
- `start-local.bat`
- `start-local.ps1`
- `start-mongodb-system.bat`
- `start-mongodb-system.ps1`
- `start-mongodb.ps1`
- `start-production.ps1`
- `start-production.sh`
- `start-simple.ps1`
- `start-system.bat`
- `start-system.ps1`

### 6. Development Utilities
- `fixDatabase.js`
- `generate-fresh-token.js`
- `inspect-sample-document.js`
- `ojitha-issue-solution.js`
- `preference-management-api.js`
- `preference-routes.js`
- `preference-schemas.js`
- `quick-csr-action.js`
- `quick-test-csr.js`
- `realtime-status.js`
- `recreate-dsar-fixed.js`
- `recreate-dsar-via-backend.js`
- `seedComplianceRules.js`
- `seedConsents.js`
- `seedDatabase.js`
- `seedPreferences.js`
- `seedUserPreferences.js`
- `seedWebhooks.js`
- `simulate-consent-revocation.js`
- `system-status-check.js`

## Files to Keep

### Core Application Files
- `src/App.tsx`
- `src/main.tsx`
- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `eslint.config.js`
- `tsconfig.*.json`
- `index.html`
- `vercel.json`
- All files in `src/components/` (except backup files)
- All files in `src/services/` (except backup files)
- All files in `src/contexts/` (except backup files)
- All files in `backend/` directory
- Production environment files (`.env.production`, `.env.prod`)

### Essential Scripts
- `comprehensive-backend.js` (main backend)
- `start-with-urls.js` (service orchestrator)
- `backend/seedGuardians.js` (essential data seeding)

## Cleanup Commands

You can use these PowerShell commands to remove the unwanted files:

```powershell
# Remove debug and test scripts
Remove-Item "debug-*.js", "test-*.js", "check-*.js", "analyze-*.js", "create-*.js", "verify-*.js", "compare-*.js", "clear-*.js", "cleanup-*.js" -Force

# Remove documentation files
Remove-Item "*_COMPLETE.md", "*_FIXED.md", "*_IMPLEMENTATION*.md", "*_ASSESSMENT.md", "*_STATUS.md" -Force

# Remove backup files
Remove-Item "src\components\admin\*_backup.tsx", "src\components\admin\*_broken.tsx", "src\components\admin\*_temp.tsx", "src\components\admin\*_clean.tsx" -Force
Remove-Item "src\services\*_new.ts", "src\services\*_old.ts", "src\services\backup*.ts" -Force
Remove-Item "src\contexts\*_new.tsx" -Force
Remove-Item "src\components\*_old.tsx" -Force

# Remove test files
Remove-Item "demo-system.js", "test*.js", "test*.csv", "test*.json", "*.html" -Force

# Remove legacy deployment files
Remove-Item "render.*", "start-*.ps1", "start-*.bat", "start-*.sh", "production-backend.js" -Force

# Remove development utilities (be careful with these)
Remove-Item "fixDatabase.js", "generate-*.js", "inspect-*.js", "ojitha-*.js", "preference-*.js", "quick-*.js", "realtime-*.js", "recreate-*.js", "seed*.js", "simulate-*.js", "system-*.js" -Force
```

## Benefits of Cleanup

1. **Reduced Repository Size**: Removing ~150+ unused files
2. **Improved Navigation**: Easier to find relevant files
3. **Cleaner Git History**: Focus on production code
4. **Better Performance**: Faster cloning and syncing
5. **Reduced Confusion**: Clear distinction between production and development files

## Recommendation

Start with removing the debug/test scripts and documentation files first, then gradually remove backup files and development utilities. Always create a backup branch before performing bulk deletions.
