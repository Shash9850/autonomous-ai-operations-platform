from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image
)

from reportlab.lib.styles import getSampleStyleSheet

import os


def generate_pdf_report(
    insights,
    chart_path=None
):

    os.makedirs("storage/reports", exist_ok=True)

    report_path = "storage/reports/analytics_report.pdf"

    doc = SimpleDocTemplate(report_path)

    styles = getSampleStyleSheet()

    elements = []

    title = Paragraph(
        "AI Analytics Report",
        styles["Title"]
    )

    elements.append(title)

    elements.append(Spacer(1, 20))

    insights_paragraph = Paragraph(
        insights.replace("\n", "<br/>"),
        styles["BodyText"]
    )

    elements.append(insights_paragraph)

    elements.append(Spacer(1, 20))

    if chart_path and os.path.exists(chart_path):

        chart = Image(
            chart_path,
            width=400,
            height=250
        )

        elements.append(chart)

    doc.build(elements)

    return report_path