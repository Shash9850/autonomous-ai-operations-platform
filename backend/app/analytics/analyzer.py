def analyze_dataframe(df):

    analysis = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "summary": df.describe(include="all").to_string()
    }

    return analysis