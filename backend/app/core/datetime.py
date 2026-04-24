from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

IST_TIME_ZONE = ZoneInfo("Asia/Kolkata")


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def as_utc_aware(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def to_ist_date(value: datetime | None) -> date | None:
    if value is None:
        return None
    return as_utc_aware(value).astimezone(IST_TIME_ZONE).date()
