from sqlalchemy.orm import Session
from domain.user.model import OtpSettings


class OTPRepo:
    def __init__(self, session: Session):
        self.session = session

    def save(self, otp_settings: OtpSettings):
        self.session.add(otp_settings)
        self.session.commit()
