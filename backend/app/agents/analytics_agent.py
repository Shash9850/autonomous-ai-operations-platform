from app.analytics.data_loader import load_dataset
from app.analytics.analyzer import analyze_dataframe
import app.analytics.session_store as session_store

from app.analytics.insight_generator import generate_insights
from app.analytics.chart_generator import generate_chart
from app.analytics.report_generator import generate_pdf_report

from app.tools.email_tool import send_email

from app.config.settings import settings


def analytics_agent(state):

    file_path = session_store.LATEST_DATASET

    if not file_path:

        return {
            **state,
            "results": ["No dataset uploaded"]
        }

    df = load_dataset(file_path)

    chart_path = generate_chart(df)

    analysis = analyze_dataframe(df)

    insights = generate_insights(analysis)

    report_path = generate_pdf_report(
        insights,
        chart_path
    )

    recipient_email = state.get("recipient_email")

    print("RECIPIENT EMAIL:", recipient_email)

    if recipient_email:

        try:

            send_email(
                sender_email=settings.EMAIL_ADDRESS,
                sender_password=settings.EMAIL_PASSWORD,
                recipient_email=recipient_email,
                subject="AI Analytics Report",
                body="Your AI-generated analytics report is attached.",
                attachment_path=report_path
            )

            print("EMAIL SENT SUCCESSFULLY")

        except Exception as e:

            print("EMAIL ERROR:", e)

    return {
        **state,
        "results": [insights],
        "chart_path": chart_path,
        "report_path": report_path
    }