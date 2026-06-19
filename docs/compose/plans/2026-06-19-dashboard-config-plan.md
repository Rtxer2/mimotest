# Dashboard 配置功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task.

**Goal:** Allow users to configure which dashboard sections are visible via system settings.

**Architecture:** New user_preferences table + API + config page + conditional rendering in both dashboards.

**Tech Stack:** Python/FastAPI, SQLAlchemy, Alembic, React/TypeScript/Ant Design

---

### Task 1: Backend — UserPreferences Model and Migration

**Covers:** [S3]

**Files:**
- Create: `backend/app/models/user_preference.py`
- Modify: `backend/app/models/__init__.py`

- [ ] Create UserPreferences model with user_id (FK, unique), dashboard_config (JSON)
- [ ] Create alembic migration
- [ ] Commit

### Task 2: Backend — UserPreferences Service and API

**Covers:** [S4]

**Files:**
- Create: `backend/app/services/preference_service.py`
- Create: `backend/app/api/v1/preferences.py`
- Modify: `backend/app/api/v1/__init__.py`

- [ ] Create PreferenceService with get/save methods (default all true)
- [ ] Create preferences router with GET/PUT /users/me/preferences
- [ ] Register router
- [ ] Commit

### Task 3: Frontend — Dashboard Config Page

**Covers:** [S5]

**Files:**
- Create: `frontend/src/api/preferences.ts`
- Create: `frontend/src/pages/system/DashboardConfig.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] Create preferences API client
- [ ] Create DashboardConfig page with Switch toggles
- [ ] Add route and sidebar menu item
- [ ] Commit

### Task 4: Frontend — Conditional Rendering in Dashboards

**Covers:** [S6]

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/pages/AnalyticsDashboard.tsx`

- [ ] Update Dashboard.tsx to read config and conditionally render
- [ ] Update AnalyticsDashboard.tsx to read config and conditionally render
- [ ] Commit

### Task 5: Final Verification

- [ ] Backend syntax check
- [ ] Frontend build
