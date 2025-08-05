from sqlalchemy.orm import Session
from domain.user.model import OtpSettings
from sqlalchemy import delete


class OTPRepo:
    def __init__(self, session: Session):
        self.session = session

    def save(self, otp_settings: OtpSettings):
        self.session.add(otp_settings)
        self.session.commit()

    def disable(self, user_id: int):
        self.session.execute(delete(OtpSettings).where(OtpSettings.user_id == user_id))
        self.session.commit()

    def set_otp_enabled(self, user_id: int):
        self.session.query(OtpSettings).filter(OtpSettings.user_id == user_id).update(
            {
                "otp_configured": True,
            }
        )
        self.session.commit()
