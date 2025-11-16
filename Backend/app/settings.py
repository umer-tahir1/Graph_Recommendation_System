import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self) -> None:
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.supabase_anon_key = os.getenv('SUPABASE_ANON_KEY', self.supabase_service_role_key)
        emails = os.getenv('ADMIN_EMAILS', '')
        self.admin_email_allowlist = [e.strip().lower() for e in emails.split(',') if e.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
