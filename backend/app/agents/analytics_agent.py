from app.analytics.data_loader import load_dataset
from app.analytics.analyzer import analyze_dataframe
from app.agents import state
from app.analytics import session_store
import app.analytics.session_store as session_store
from app.analytics.insight_generator import generate_insights

def analytics_agent(state):

    file_path = session_store.LATEST_DATASET

    if not file_path:

        return {
            **state,
            "results": ["No dataset uploaded"]
        }

    df = load_dataset(file_path)

    analysis = analyze_dataframe(df)

    insights = generate_insights(analysis)

    return {
    **state,
    "results": [insights]
}