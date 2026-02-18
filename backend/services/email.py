import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.core.config import settings

def send_email(to_email: str, subject: str, body: str):
    try:
        sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(sender_email, to_email, text)
        server.quit()
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
