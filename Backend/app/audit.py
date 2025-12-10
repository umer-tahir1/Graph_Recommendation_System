from __future__ import annotations

from typing import Any, Dict, Optional

from .auth import AdminAuthContext, UserAuthContext
from . import crud


def _serialize(snapshot: Any) -> Any:
    if snapshot is None:
        return None
    if hasattr(snapshot, 'model_dump'):
        return snapshot.model_dump()
    if hasattr(snapshot, 'dict') and callable(getattr(snapshot, 'dict')):
        return snapshot.dict()  # type: ignore[no-any-return]
    return snapshot


def _build_entry(
    actor: AdminAuthContext,
    *,
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    target_display: Optional[str] = None,
    before: Any = None,
    after: Any = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> int:
    merged_meta: Dict[str, Any] = {'admin_roles': actor.roles}
    if metadata:
        merged_meta.update(metadata)

    entry = {
        'admin_id': actor.user_id,
        'admin_email': actor.email,
        'action': action,
        'target_type': target_type,
        'target_id': target_id,
        'target_display': target_display,
        'before_state': _serialize(before),
        'after_state': _serialize(after),
        'metadata': merged_meta,
    }
    return entry


def emit_audit_event(
    admin: AdminAuthContext,
    **kwargs: Any,
) -> int:
    entry = _build_entry(admin, **kwargs)
    return crud.insert_admin_audit_log(entry)


def emit_user_audit_event(
    user: UserAuthContext,
    **kwargs: Any,
) -> int:
    entry = _build_entry(user, **kwargs)
    return crud.insert_admin_audit_log(entry)
