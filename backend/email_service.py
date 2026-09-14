import os

import resend
from dotenv import load_dotenv

from schemas import ContactRequest

load_dotenv()


class EmailConfigurationError(RuntimeError):
    pass


def send_contact_email(contact: ContactRequest) -> None:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    recipient = os.getenv(
        "CONTACT_EMAIL",
        "vaishalisonkar.tech@gmail.com"
    ).strip()

    if not api_key:
        raise EmailConfigurationError(
            "RESEND_API_KEY is not configured"
        )

    if not recipient:
        raise EmailConfigurationError(
            "CONTACT_EMAIL is not configured"
        )

    resend.api_key = api_key

    params: resend.Emails.SendParams = {
        "from": "Vera AI Assistant <onboarding@resend.dev>",
        "to": [recipient],
        "reply_to": contact.email,
        "subject": f"Portfolio contact: {contact.subject}",
        "html": f"""
        <html>
            <body>
                <h2>New Portfolio Contact</h2>

                <p><strong>Name:</strong> {contact.name}</p>

                <p><strong>Email:</strong> {contact.email}</p>

                <p><strong>Subject:</strong> {contact.subject}</p>

                <h3>Message</h3>

                <p>
                    {contact.message}
                </p>
            </body>
        </html>
        """
    }

    try:
        email = resend.Emails.send(params)

        if not email:
            raise RuntimeError("Resend did not return an email response")

    except Exception as exc:
        raise RuntimeError(
            f"Resend email failed: {exc}"
        ) from exc