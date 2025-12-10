import os
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv


_BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(_BASE_DIR / '.env')


def _env_flag(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {'1', 'true', 'yes', 'on'}


class Settings:
    def __init__(self) -> None:
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.supabase_anon_key = os.getenv('SUPABASE_ANON_KEY', self.supabase_service_role_key)
        emails = os.getenv('ADMIN_EMAILS', '')
        self.admin_email_allowlist = [e.strip().lower() for e in emails.split(',') if e.strip()]
        mock_flag = _env_flag('MOCK_SUPABASE') or not bool(self.supabase_service_role_key)
        self.mock_supabase = mock_flag


@lru_cache()
def get_settings() -> Settings:
    return Settings()
