from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pyotp
import qrcode
from src.domain.user.dto import (
    UserCreate,
    Authresponse,
    UserLogin,
    OtpVerify,
    OtpDisable,
    LoginStep2,
)
from src.infrastructure.postgresql.db import get_db
from src.domain.user.model import User, OtpSettings
from starlette import status
from src.domain.user.service import (
    hash_password,
    create_access_token,
    verify_password,
    create_temp_token,
    verify_temp_token,
)
from src.domain.user.dependency import get_current_user


user_router = APIRouter(prefix="/user")


@user_router.post("/register", response_model=Authresponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Prüfe, ob Email bereits existiert
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken"
        )

    # Validiere first_name und last_name
    if not user_data.first_name or not user_data.last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First name and last name are required"
        )

    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email, 
        password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return Authresponse(
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        access_token=create_access_token({"sub": new_user.email}),
        token_type="bearer",
        id=new_user.id,
    )


@user_router.post("/login", response_model=Authresponse)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """First step of login process. Returns temporary token if 2FA is required."""
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check if 2FA is required
    requires_2fa = user.otp_settings and user.otp_settings.otp_configured

    if requires_2fa:
        # Create temporary token for second step
        temp_token = create_temp_token({"sub": user.email, "step": "2fa"})
        return Authresponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            requires_2fa=True,
            temp_token=temp_token,
            token_type="bearer",
            access_token="",  # No access token yet, requires 2FA
        )

    # If no 2FA required, return full access token
    return Authresponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        access_token=create_access_token({"sub": user.email}),
        token_type="bearer",
        requires_2fa=False,
    )


@user_router.post("/login/2fa", response_model=Authresponse)
def login_step2(login_data: LoginStep2, db: Session = Depends(get_db)):
    """Second step of login process. Verifies OTP code and returns final access token."""
    try:
        # Verify temporary token
        payload = verify_temp_token(login_data.temp_token)
        if payload.get("step") != "2fa":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid temporary token",
            )

        # Get user
        user = db.query(User).filter(User.email == payload["sub"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )

        # Verify OTP code
        if not user.otp_settings or not user.otp_settings.otp_configured:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA is not configured for this user",
            )

        totp = pyotp.TOTP(user.otp_settings.secret)
        if not totp.verify(login_data.code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
            )

        # Return full access token
        return Authresponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            access_token=create_access_token({"sub": user.email}),
            token_type="bearer",
            requires_2fa=False,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid temporary token or OTP code",
        )


@user_router.get("/me")
def get_user_details(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "created_at": current_user.created_at,
        "otp_configured": current_user.otp_settings.otp_configured if current_user.otp_settings else False,
    }


@user_router.post("/2fa/setup", response_class=StreamingResponse)
async def setup_2fa(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Setup 2FA for the current user and return QR code."""

    # Check if 2FA is already configured
    if current_user.otp_settings and current_user.otp_settings.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already configured for this user",
        )

    # Generate new secret
    secret = pyotp.random_base32()

    # Create or update OTP settings
    if current_user.otp_settings:
        current_user.otp_settings.secret = secret
        current_user.otp_settings.otp_configured = True
    else:
        otp_settings = OtpSettings(
            user_id=current_user.id, secret=secret, otp_configured=True
        )
        db.add(otp_settings)

    db.commit()

    # Generate OTP URI for QR code
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email, issuer_name="Fire Map"
    )

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)

    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")

    # Save image to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return StreamingResponse(
        img_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=qr.png"},
    )


@user_router.post("/2fa/verify")
async def verify_2fa(
    otp_data: OtpVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify the OTP code for the current user."""

    # Check if 2FA is configured
    if not current_user.otp_settings or not current_user.otp_settings.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not configured for this user",
        )

    # Verify OTP code
    totp = pyotp.TOTP(current_user.otp_settings.secret)
    if not totp.verify(otp_data.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
        )

    return {"message": "OTP code verified successfully"}


@user_router.post("/2fa/disable")
async def disable_2fa(
    otp_data: OtpDisable,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disable 2FA for the current user if they are not an admin."""

    # Check if user is admin
    if current_user.role.name == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin users cannot disable 2FA",
        )

    # Check if 2FA is configured
    if not current_user.otp_settings or not current_user.otp_settings.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not configured for this user",
        )

    # Verify OTP code
    totp = pyotp.TOTP(current_user.otp_settings.secret)
    if not totp.verify(otp_data.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
        )

    # Check confirmation
    if not otp_data.confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please confirm that you want to disable 2FA by setting confirm=true",
        )

    # Disable 2FA
    current_user.otp_settings.otp_configured = False
    current_user.otp_settings.secret = None
    db.commit()

    return {"message": "2FA has been disabled successfully"}
