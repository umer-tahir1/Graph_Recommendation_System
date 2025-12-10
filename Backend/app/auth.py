from __future__ import annotations

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from fastapi import Header, HTTPException, status

from . import supabase_admin


def admin_error(status_code: int, code: str, message: str, *, details: Optional[Dict[str, Any]] = None) -> HTTPException:
    payload: Dict[str, Any] = {'error': {'code': code, 'message': message}}
    if details:
        payload['error']['details'] = details
    raise HTTPException(status_code=status_code, detail=payload)


@dataclass(frozen=True)
class SupabaseAuthContext:
    user_id: str
    email: Optional[str]
    roles: List[str]
    token: str
    profile: Dict[str, Any]

    def to_identity(self) -> Dict[str, Optional[str]]:
        return {'id': self.user_id, 'email': self.email}

    def has_role(self, role: str) -> bool:
        target = role.lower()
        return any(r.lower() == target for r in self.roles)


AdminAuthContext = SupabaseAuthContext
UserAuthContext = SupabaseAuthContext


def _extract_token(auth_header: Optional[str]) -> str:
    if not auth_header:
        admin_error(status.HTTP_401_UNAUTHORIZED, 'auth.missing_token', 'Authorization header is required')
    scheme, _, token = auth_header.partition(' ')
    if scheme.lower() != 'bearer' or not token:
        admin_error(status.HTTP_401_UNAUTHORIZED, 'auth.invalid_scheme', 'Authorization header must be a Bearer token')
    return token


def _derive_roles(profile: Dict[str, Any]) -> List[str]:
    roles: List[str] = []
    app_roles = profile.get('app_metadata', {}).get('roles') or []
    if isinstance(app_roles, str):
        app_roles = [app_roles]
    for role in app_roles:
        if role:
            roles.append(str(role).lower())
    user_role = profile.get('user_metadata', {}).get('role')
    if user_role:
        roles.append(str(user_role).lower())
    return list(dict.fromkeys(roles))  # preserve order, unique


def _build_context(token: str, profile: Dict[str, Any]) -> SupabaseAuthContext:
    roles = _derive_roles(profile)
    if supabase_admin.user_is_admin(profile) and not any(r.lower() == 'admin' for r in roles):
        roles.append('admin')
    return SupabaseAuthContext(
        user_id=profile['id'],
        email=profile.get('email'),
        roles=roles,
        token=token,
        profile=profile,
    )


def require_user(authorization: str | None = Header(default=None)) -> UserAuthContext:
    token = _extract_token(authorization)
    try:
        profile = supabase_admin.fetch_user_profile(token)
    except RuntimeError as exc:
        admin_error(status.HTTP_500_INTERNAL_SERVER_ERROR, 'auth.supabase_unreachable', str(exc))
    except ValueError as exc:
        admin_error(status.HTTP_401_UNAUTHORIZED, 'auth.invalid_token', str(exc))

    if not profile.get('id'):
        admin_error(status.HTTP_401_UNAUTHORIZED, 'auth.invalid_profile', 'Supabase profile response missing id')

    return _build_context(token, profile)


def require_admin(authorization: str | None = Header(default=None)) -> AdminAuthContext:
    context = require_user(authorization)
    if not context.has_role('admin'):
        email = context.email
        admin_error(
            status.HTTP_403_FORBIDDEN,
            'auth.forbidden',
            'Admin role required for this resource',
            details={'email': email}
        )
    return context


def ensure_not_self(action: str, admin: AdminAuthContext, target_user_id: str) -> None:
    if admin.user_id == target_user_id:
        admin_error(
            status.HTTP_400_BAD_REQUEST,
            'auth.self_action_blocked',
            f'Administrators cannot {action} their own account.'
        )
