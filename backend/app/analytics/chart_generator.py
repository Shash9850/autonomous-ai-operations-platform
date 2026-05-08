import matplotlib.pyplot as plt
import os


def generate_chart(df):

    os.makedirs("storage/charts", exist_ok=True)

    ignored_keywords = [
        "id",
        "index",
        "serial",
        "phone",
        "email",
        "website"
    ]

    numeric_columns = [

        col for col in df.select_dtypes(
            include=["number"]
        ).columns

        if not any(
            word in col.lower()
            for word in ignored_keywords
        )
    ]

    categorical_columns = [

        col for col in df.select_dtypes(
            include=["object"]
        ).columns

        if not any(
            word in col.lower()
            for word in ignored_keywords
        )
    ]

    # NUMERIC CHART
    if len(numeric_columns) > 0:

        column = numeric_columns[0]

        plt.figure(figsize=(8, 5))

        df[column].hist()

        plt.title(f"{column} Distribution")

        plt.xlabel(column)

        plt.ylabel("Frequency")

        chart_path = (
            f"storage/charts/{column}_histogram.png"
        )

    # CATEGORICAL CHART
    elif len(categorical_columns) > 0:

        column = categorical_columns[0]

        top_values = (
            df[column]
            .value_counts()
            .head(10)
        )

        plt.figure(figsize=(10, 5))

        top_values.plot(kind="bar")

        plt.title(f"Top {column} Categories")

        plt.xlabel(column)

        plt.ylabel("Count")

        chart_path = (
            f"storage/charts/{column}_bar_chart.png"
        )

    else:

        return None

    plt.tight_layout()

    plt.savefig(chart_path)

    plt.close()

    return chart_path