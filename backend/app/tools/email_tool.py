import smtplib

from email.message import EmailMessage


def send_email(
    sender_email,
    sender_password,
    recipient_email,
    subject,
    body,
    attachment_path=None
):

    msg = EmailMessage()

    msg["Subject"] = subject

    msg["From"] = sender_email

    msg["To"] = recipient_email

    msg.set_content(body)

    # Attach PDF
    if attachment_path:

        with open(attachment_path, "rb") as f:

            file_data = f.read()

            file_name = attachment_path.split("/")[-1]

        msg.add_attachment(
            file_data,
            maintype="application",
            subtype="pdf",
            filename=file_name
        )

    with smtplib.SMTP_SSL(
        "smtp.gmail.com",
        465
    ) as smtp:

        smtp.login(
            sender_email,
            sender_password
        )

        smtp.send_message(msg)

    return "Email sent successfully"