import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

from schemas import ContactRequest

load_dotenv()


class EmailConfigurationError(RuntimeError):
    pass


def send_contact_email(contact: ContactRequest) -> None:
    host = os.getenv("SMTP_HOST", "").strip()
    username = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "")
    recipient = os.getenv("CONTACT_EMAIL", "vaishalisonkar.tech@gmail.com").strip()

    try:
        port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError as exc:
        raise EmailConfigurationError("SMTP_PORT must be a number") from exc

    if not host or not username or not password or not recipient:
        raise EmailConfigurationError("SMTP email settings are incomplete")

    email = EmailMessage()
    email["From"] = username
    email["To"] = recipient
    email["Reply-To"] = contact.email
    email["Subject"] = f"Portfolio contact: {contact.subject}"
    email.set_content(
        f"From / Visitor: {contact.name}\n"
        f"Visitor Email: {contact.email}\n"
        f"Subject: {contact.subject}\n\n"
        f"Message:\n{contact.message}\n"
    )

    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=20) as smtp:
            smtp.login(username, password)
            smtp.send_message(email)
    else:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(username, password)
            smtp.send_message(email)
