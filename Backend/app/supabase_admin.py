from __future__ import annotations

import datetime as dt
from typing import Any, Dict, List, Optional

import requests

from .settings import get_settings

settings = get_settings()


def _ensure_config() -> None:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError('Supabase admin features require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')


def _service_headers() -> Dict[str, str]:
    _ensure_config()
    return {
        'apikey': settings.supabase_service_role_key,
        'Authorization': f'Bearer {settings.supabase_service_role_key}',
        'Content-Type': 'application/json',
    }


def _user_headers() -> Dict[str, str]:
    _ensure_config()
    return {
        'apikey': settings.supabase_anon_key or settings.supabase_service_role_key,
    }


def _base_auth_url() -> str:
    _ensure_config()
    return settings.supabase_url.rstrip('/') + '/auth/v1'


def _request(method: str, path: str, *, params: Optional[Dict[str, Any]] = None, json: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    url = f'{_base_auth_url()}{path}'
    resp = requests.request(method, url, headers=_service_headers(), params=params, json=json, timeout=15)
    if resp.status_code >= 400:
        raise ValueError(f'Supabase admin error {resp.status_code}: {resp.text}')
    if resp.text:
        return resp.json()
    return {}


def fetch_user_profile(access_token: str) -> Dict[str, Any]:
    headers = _user_headers() | {'Authorization': f'Bearer {access_token}'}
    resp = requests.get(f'{_base_auth_url()}/user', headers=headers, timeout=10)
    if resp.status_code >= 400:
        raise ValueError('Invalid Supabase token')
    return resp.json()


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
    params = {'page': page, 'per_page': per_page}
    return _request('GET', '/admin/users', params=params)


def get_user(user_id: str) -> Dict[str, Any]:
    return _request('GET', f'/admin/users/{user_id}')


def update_user(user_id: str, role: Optional[str] = None, disabled: Optional[bool] = None) -> Dict[str, Any]:
    payload: Dict[str, Any] = {}
    if role:
        payload['app_metadata'] = {'roles': [role]}
        payload['user_metadata'] = {'role': role}
    if disabled is not None:
        payload['banned_until'] = '9999-12-31T23:59:59Z' if disabled else None
    return _request('PUT', f'/admin/users/{user_id}', json=payload)


def delete_user(user_id: str) -> None:
    _request('DELETE', f'/admin/users/{user_id}')


def serialize_user(raw: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': raw.get('id'),
        'email': raw.get('email'),
        'role': (raw.get('app_metadata') or {}).get('roles', [None])[0] or (raw.get('user_metadata') or {}).get('role'),
        'last_sign_in_at': raw.get('last_sign_in_at'),
        'banned_until': raw.get('banned_until'),
        'app_metadata': raw.get('app_metadata') or {},
        'user_metadata': raw.get('user_metadata') or {},
        'status': 'disabled' if raw.get('banned_until') else 'active',
    }


def paged_user_list(limit: int = 1000) -> List[Dict[str, Any]]:
    collected: List[Dict[str, Any]] = []
    page = 1
    while len(collected) < limit:
        page_data = list_users(page=page)
        users = page_data.get('users') or []
        collected.extend(users)
        if len(users) < page_data.get('per_page', len(users)):
            break
        page += 1
    return [serialize_user(u) for u in collected[:limit]]
