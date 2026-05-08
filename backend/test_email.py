from app.tools.email_tool import send_email

from app.config.settings import settings


send_email(
    sender_email=settings.EMAIL_ADDRESS,
    sender_password=settings.EMAIL_PASSWORD,
    recipient_email="shashikantmore150@gmail.com",
    subject="AI Analytics Report",
    body="Test email from autonomous AI platform"
)