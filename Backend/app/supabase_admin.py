from __future__ import annotations

import datetime as dt
from copy import deepcopy
from typing import Any, Dict, List, Optional, Set

import requests

from .settings import get_settings

settings = get_settings()


def _service_config_required() -> None:
    if settings.mock_supabase:
        raise RuntimeError('Supabase service features are disabled in mock mode')
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError('Supabase admin features require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')


def _user_config_required() -> None:
    if not settings.supabase_url:
        raise RuntimeError('Supabase auth requires SUPABASE_URL')
    if not (settings.supabase_anon_key or settings.supabase_service_role_key):
        raise RuntimeError('Supabase auth requires SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY')


def _service_headers() -> Dict[str, str]:
    _service_config_required()
    return {
        'apikey': settings.supabase_service_role_key,
        'Authorization': f'Bearer {settings.supabase_service_role_key}',
        'Content-Type': 'application/json',
    }


def _user_headers() -> Dict[str, str]:
    _user_config_required()
    return {
        'apikey': settings.supabase_anon_key or settings.supabase_service_role_key,
    }


def _base_auth_url() -> str:
    if not settings.supabase_url:
        raise RuntimeError('Supabase auth requires SUPABASE_URL')
    return settings.supabase_url.rstrip('/') + '/auth/v1'


def _request(method: str, path: str, *, params: Optional[Dict[str, Any]] = None, json: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    url = f'{_base_auth_url()}{path}'
    resp = requests.request(method, url, headers=_service_headers(), params=params, json=json, timeout=15)
    if resp.status_code >= 400:
        raise ValueError(f'Supabase admin error {resp.status_code}: {resp.text}')
    if resp.text:
        return resp.json()
    return {}


def _mock_enabled() -> bool:
    return bool(settings.mock_supabase)


def _mock_now(offset_hours: int = 0) -> str:
    return (dt.datetime.utcnow() + dt.timedelta(hours=offset_hours)).isoformat() + 'Z'


def _mock_store() -> Dict[str, Dict[str, Any]]:
    global _MOCK_SUPABASE_USERS
    return _MOCK_SUPABASE_USERS


_MOCK_SUPABASE_USERS: Dict[str, Dict[str, Any]] = {
    'mock-admin-1': {
        'id': 'mock-admin-1',
        'email': 'mock.admin@example.com',
        'app_metadata': {'roles': ['admin']},
        'user_metadata': {'role': 'admin'},
        'last_sign_in_at': _mock_now(-2),
        'banned_until': None,
    },
    'mock-editor-1': {
        'id': 'mock-editor-1',
        'email': 'mock.editor@example.com',
        'app_metadata': {'roles': ['editor']},
        'user_metadata': {'role': 'editor'},
        'last_sign_in_at': _mock_now(-12),
        'banned_until': None,
    },
    'mock-viewer-1': {
        'id': 'mock-viewer-1',
        'email': 'mock.viewer@example.com',
        'app_metadata': {'roles': ['viewer']},
        'user_metadata': {'role': 'viewer'},
        'last_sign_in_at': None,
        'banned_until': '9999-12-31T23:59:59Z',
    },
}


def _mock_list(page: int, per_page: int) -> Dict[str, Any]:
    users = sorted(_mock_store().values(), key=lambda entry: entry['email'] or entry['id'])
    start = (page - 1) * per_page
    chunk = users[start:start + per_page]
    return {
        'users': [deepcopy(user) for user in chunk],
        'page': page,
        'per_page': per_page,
        'total': len(users),
    }


def _mock_get(user_id: str) -> Dict[str, Any]:
    user = _mock_store().get(user_id)
    if not user:
        raise ValueError('Supabase user not found')
    return deepcopy(user)


def _mock_update(user_id: str, *, role: Optional[str], disabled: Optional[bool]) -> Dict[str, Any]:
    user = _mock_store().get(user_id)
    if not user:
        raise ValueError('Supabase user not found')
    if role:
        user.setdefault('app_metadata', {})['roles'] = [role]
        user.setdefault('user_metadata', {})['role'] = role
    if disabled is not None:
        user['banned_until'] = '9999-12-31T23:59:59Z' if disabled else None
    return deepcopy(user)


def _mock_delete(user_id: str) -> None:
    if user_id not in _mock_store():
        raise ValueError('Supabase user not found')
    del _mock_store()[user_id]


def fetch_user_profile(access_token: str) -> Dict[str, Any]:
    headers = _user_headers() | {'Authorization': f'Bearer {access_token}'}
    resp = requests.get(f'{_base_auth_url()}/user', headers=headers, timeout=10)
    if resp.status_code >= 400:
        raise ValueError('Invalid Supabase token')
    return resp.json()


def _normalized_roles(raw: Dict[str, Any]) -> List[str]:
    roles: List[str] = []
    app_meta = raw.get('app_metadata') or {}
    user_meta = raw.get('user_metadata') or {}
    app_roles = app_meta.get('roles')

    if isinstance(app_roles, list):
        roles.extend(str(role) for role in app_roles if isinstance(role, str))
    elif isinstance(app_roles, dict):
        roles.extend(str(role) for role, enabled in app_roles.items() if enabled)
    elif isinstance(app_roles, str):
        roles.append(app_roles)

    meta_role = user_meta.get('role')
    if isinstance(meta_role, str):
        roles.append(meta_role)

    normalized = []
    for role in roles:
        cleaned = role.strip().lower()
        if cleaned:
            normalized.append(cleaned)
    return normalized


def _infer_role(raw: Dict[str, Any]) -> Optional[str]:
    normalized = _normalized_roles(raw)
    priority = ['admin', 'editor', 'viewer']
    for target in priority:
        if target in normalized:
            return target

    email = (raw.get('email') or '').strip().lower()
    allowlist = {value.strip().lower() for value in (settings.admin_email_allowlist or []) if isinstance(value, str)}
    if email and email in allowlist:
        return 'admin'

    return normalized[0] if normalized else None


def user_is_admin(profile: Dict[str, Any]) -> bool:
    app_roles = profile.get('app_metadata', {}).get('roles') or []
    user_role = profile.get('user_metadata', {}).get('role')
    if isinstance(app_roles, str):
        app_roles = [app_roles]
    roles = set(r for r in app_roles if isinstance(r, str))
    if user_role:
        roles.add(str(user_role))
    lowered = {r.lower() for r in roles}
    if 'admin' in lowered:
        return True
    email = (profile.get('email') or '').lower()
    if email and email in (settings.admin_email_allowlist or []):
        return True
    return False


def list_users(page: int = 1, per_page: int = 200) -> Dict[str, Any]:
    if _mock_enabled():
        return _mock_list(page, per_page)
    params = {'page': page, 'per_page': per_page}
    return _request('GET', '/admin/users', params=params)


def get_user(user_id: str) -> Dict[str, Any]:
    if _mock_enabled():
        return _mock_get(user_id)
    return _request('GET', f'/admin/users/{user_id}')


def update_user(user_id: str, role: Optional[str] = None, disabled: Optional[bool] = None) -> Dict[str, Any]:
    if _mock_enabled():
        return _mock_update(user_id, role=role, disabled=disabled)
    payload: Dict[str, Any] = {}
    if role:
        payload['app_metadata'] = {'roles': [role]}
        payload['user_metadata'] = {'role': role}
    if disabled is not None:
        payload['banned_until'] = '9999-12-31T23:59:59Z' if disabled else None
    return _request('PUT', f'/admin/users/{user_id}', json=payload)


def delete_user(user_id: str) -> None:
    if _mock_enabled():
        _mock_delete(user_id)
        return
    _request('DELETE', f'/admin/users/{user_id}')


def _allowlisted_emails() -> List[str]:
    return settings.admin_email_allowlist or []


def _merge_allowlisted_admins(users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    allowlist = _allowlisted_emails()
    if not allowlist:
        return users

    index: Dict[str, Dict[str, Any]] = {}
    for entry in users:
        email = (entry.get('email') or '').strip().lower()
        if not email:
            continue
        if email not in index:
            index[email] = entry

    ordered: List[Dict[str, Any]] = []
    normalized_pairs = [(email.strip(), email.strip().lower()) for email in allowlist if email.strip()]
    for original, normalized in normalized_pairs:
        existing = index.get(normalized)
        if existing:
            existing['__allowlisted__'] = True
            ordered.append(existing)
        else:
            ordered.append({
                'id': f'pending::{normalized}',
                'email': original,
                'app_metadata': {'roles': ['admin']},
                'user_metadata': {'role': 'admin'},
                'last_sign_in_at': None,
                'banned_until': None,
                '__placeholder__': True,
                '__allowlisted__': True,
            })

    seen_emails = {entry.get('email', '').strip().lower() for entry in ordered}
    for entry in users:
        email = (entry.get('email') or '').strip().lower()
        if email in seen_emails:
            continue
        ordered.append(entry)

    return ordered


def serialize_user(raw: Dict[str, Any], *, active_user_ids: Optional[Set[str]] = None) -> Dict[str, Any]:
    resolved_role = _infer_role(raw)
    user_id = raw.get('id')
    presence = 'active' if active_user_ids and user_id in active_user_ids else 'offline'
    placeholder = bool(raw.get('__placeholder__'))
    allowlisted = bool(raw.get('__allowlisted__'))
    status = 'disabled' if raw.get('banned_until') else raw.get('status') or 'active'
    # Pending placeholders should not appear as fully active accounts
    if placeholder and status == 'active':
        status = 'pending'
    return {
        'id': user_id,
        'email': raw.get('email'),
        'role': resolved_role,
        'last_sign_in_at': raw.get('last_sign_in_at'),
        'banned_until': raw.get('banned_until'),
        'app_metadata': raw.get('app_metadata') or {},
        'user_metadata': raw.get('user_metadata') or {},
        'status': status,
        'presence': presence,
        'placeholder': placeholder,
        'allowlisted': allowlisted,
    }


def paged_user_list(limit: int = 1000, *, active_user_ids: Optional[Set[str]] = None) -> List[Dict[str, Any]]:
    if _mock_enabled():
        users = sorted(_mock_store().values(), key=lambda entry: entry['email'] or entry['id'])
        merged = _merge_allowlisted_admins([deepcopy(user) for user in users])
        return [serialize_user(user, active_user_ids=active_user_ids) for user in merged[:limit]]

    collected: List[Dict[str, Any]] = []
    page = 1
    page_size = min(limit, 200)
    while len(collected) < limit:
        page_data = list_users(page=page, per_page=page_size)
        users = page_data.get('users') or []
        collected.extend(users)
        if len(users) < page_size:
            break
        page += 1
    merged = _merge_allowlisted_admins(collected)
    return [serialize_user(user, active_user_ids=active_user_ids) for user in merged[:limit]]
