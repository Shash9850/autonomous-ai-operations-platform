from app.analytics.data_loader import load_dataset
from app.analytics.analyzer import analyze_dataframe
from app.agents import state
from app.analytics import session_store
import app.analytics.session_store as session_store
from app.analytics.insight_generator import generate_insights
from app.analytics.chart_generator import generate_chart
from app.analytics.report_generator import generate_pdf_report

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



    return {
    **state,
    "results": [insights],
    "chart_path": chart_path,
    "report_path": report_path
}