import logging
import os
import smtplib
from email.message import EmailMessage
from typing import Any, Dict, List, Optional

from . import crud, recommender

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv('EMAIL_SMTP_HOST')
SMTP_PORT = int(os.getenv('EMAIL_SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('EMAIL_SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('EMAIL_SMTP_PASSWORD')
SMTP_FROM = os.getenv('EMAIL_FROM_ADDRESS') or os.getenv('EMAIL_SENDER_ADDRESS')
SMTP_USE_TLS = os.getenv('EMAIL_SMTP_USE_TLS', '1').strip().lower() in {'1', 'true', 'yes', 'on'}


def _smtp_ready() -> bool:
    return bool(SMTP_HOST and SMTP_FROM)


def _deliver_email(recipient: str, subject: str, content: str) -> None:
    if not _smtp_ready():
        raise RuntimeError('SMTP configuration missing; cannot deliver email')

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = SMTP_FROM
    msg['To'] = recipient
    msg.set_content(content)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        if SMTP_USERNAME and SMTP_PASSWORD:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(msg)


def send_marketing_email(user_id: int, subject: str, content: str) -> Dict[str, Optional[str]]:
    user = crud.get_user_contact(user_id)
    if not user:
        return {'status': 'skipped', 'reason': 'missing-user'}
    if not user.get('email_opt_in'):
        return {'status': 'skipped', 'reason': 'user-opted-out'}
    email = user.get('email')
    if not email:
        return {'status': 'skipped', 'reason': 'missing-email'}

    if not _smtp_ready():
        logger.info('Mock marketing email to %s (subject=%s)', email, subject)
        return {'status': 'mocked', 'reason': 'smtp-not-configured'}

    try:
        _deliver_email(email, subject, content)
        logger.info('Sent marketing email to %s', email)
        return {'status': 'sent'}
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception('Failed to send marketing email to %s', email)
        return {'status': 'failed', 'reason': str(exc)}


def broadcast_marketing_email(
    subject: str,
    content: str,
    *,
    target_user_ids: Optional[List[int]] = None,
) -> Dict[str, int]:
    if target_user_ids:
        recipients = [crud.get_user_contact(uid) for uid in target_user_ids]
        recipients = [user for user in recipients if user and user.get('email_opt_in') and user.get('email')]
    else:
        recipients = crud.list_opted_in_users()

    summary = {'sent': 0, 'mocked': 0, 'skipped': 0, 'failed': 0, 'total': len(recipients)}
    for user in recipients:
        result = send_marketing_email(user['id'], subject, content)
        status = result.get('status') or 'failed'
        summary[status] = summary.get(status, 0) + 1
    return summary


def _recommendations_for_user(user_id: int, *, limit: int) -> List[Dict[str, Any]]:
    interactions = crud.get_interactions()
    ranked = recommender.recommend_by_collab(user_id, interactions, top_k=max(limit * 3, 5))
    recommendations: List[Dict[str, Any]] = []
    for product_id, score in ranked:
        product = crud.get_product(product_id)
        if not product:
            continue
        recommendations.append({
            'id': product_id,
            'name': product.get('name') or f'Product {product_id}',
            'category': product.get('category'),
            'score': round(float(score), 3),
        })
        if len(recommendations) >= limit:
            break
    return recommendations


def _compose_recommendation_email(user: Dict[str, Any], recs: List[Dict[str, Any]]) -> Dict[str, str]:
    display_name = (user.get('name') or '').strip() or 'there'
    first_name = display_name.split(' ')[0]
    if recs:
        subject = f"{first_name}, graph picks inspired by {recs[0]['name']}"
    else:
        subject = f"{first_name}, explore new graph picks"

    lines = [
        f"Hey {first_name},",
        'Our graph engine spotted these products based on your recent activity:',
        '',
    ]
    for idx, rec in enumerate(recs, start=1):
        line = f"{idx}. {rec['name']}"
        if rec.get('category'):
            line += f" ({rec['category']})"
        line += f" — score {rec['score']:.2f}"
        lines.append(line)
    lines += [
        '',
        'Open the app to keep exploring and feed the graph with more interactions.',
        '',
        '– Graph Recommendation System',
    ]
    return {'subject': subject, 'content': '\n'.join(lines)}


def send_recommendation_email(user_id: int, *, limit: int = 3) -> Dict[str, Optional[str]]:
    user = crud.get_user_contact(user_id)
    if not user:
        return {'status': 'skipped', 'reason': 'missing-user'}
    if not user.get('email_opt_in'):
        return {'status': 'skipped', 'reason': 'user-opted-out'}
    email = user.get('email')
    if not email:
        return {'status': 'skipped', 'reason': 'missing-email'}

    recommendations = _recommendations_for_user(user_id, limit=limit)
    if not recommendations:
        return {'status': 'skipped', 'reason': 'no-recommendations'}

    payload = _compose_recommendation_email(user, recommendations)

    if not _smtp_ready():
        logger.info('Mock recommendation email to %s (subject=%s)', email, payload['subject'])
        return {'status': 'mocked', 'reason': 'smtp-not-configured'}

    try:
        _deliver_email(email, payload['subject'], payload['content'])
        logger.info('Sent recommendation email to %s', email)
        return {'status': 'sent'}
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception('Failed to send recommendation email to %s', email)
        return {'status': 'failed', 'reason': str(exc)}


def broadcast_recommendation_email(*, limit: int = 3, target_user_ids: Optional[List[int]] = None) -> Dict[str, int]:
    if target_user_ids:
        recipients = [crud.get_user_contact(uid) for uid in target_user_ids]
        recipients = [user for user in recipients if user and user.get('email_opt_in') and user.get('email')]
    else:
        recipients = crud.list_opted_in_users()

    summary = {'sent': 0, 'mocked': 0, 'skipped': 0, 'failed': 0, 'total': len(recipients)}
    for user in recipients:
        result = send_recommendation_email(user['id'], limit=limit)
        status = result.get('status') or 'failed'
        summary[status] = summary.get(status, 0) + 1
    return summary
