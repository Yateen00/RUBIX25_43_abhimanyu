from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import sqlite3
import pickle
import os
from prophet import Prophet

app = FastAPI()


class PredictionRequest(BaseModel):
    cutoff_date: str


def connect_to_db(db_name):
    conn = sqlite3.connect(db_name)
    return conn


def get_state_mapping():
    conn = connect_to_db("final_covid.db")
    query = "SELECT state_key, subregion1_name FROM location_subregion"
    state_mapping = pd.read_sql_query(query, conn)
    conn.close()
    return state_mapping.set_index("state_key")["subregion1_name"].to_dict()


def load_data():
    conn = connect_to_db("final_covid.db")
    query = "SELECT * FROM aggregated_data"
    aggregated_data = pd.read_sql_query(query, conn)
    conn.close()
    aggregated_data.rename(
        columns={"date": "ds", "cumulative_confirmed": "y"}, inplace=True
    )
    aggregated_data["ds"] = pd.to_datetime(aggregated_data["ds"])
    return aggregated_data


def make_predictions(state_key, state_data):
    model_dir = "models"
    model_filename = f"{model_dir}/prophet_model_{state_key}.pkl"
    with open(model_filename, "rb") as f:
        model = pickle.load(f)
    future = model.make_future_dataframe(periods=7)
    forecast = model.predict(future)
    forecast = forecast[["ds", "yhat"]]
    forecast["state_key"] = state_key
    return forecast


@app.post("/getPrediction/")
def get_prediction(request: PredictionRequest):
    cutoff_date = pd.to_datetime(request.cutoff_date)
    aggregated_data = load_data()
    state_mapping = get_state_mapping()
    predictions = []
    actuals = []
    state_keys = aggregated_data["state_key"].unique()
    for state_key in state_keys:
        state_data = aggregated_data[aggregated_data["state_key"] == state_key]
        forecast = make_predictions(state_key, state_data)
        predictions.append(forecast[["ds", "yhat", "state_key"]])
        actuals.append(state_data[["ds", "y", "state_key"]])
    predictions_df = pd.concat(predictions)
    actuals_df = pd.concat(actuals)

    # Ensure 'ds' column is datetime
    actuals_df["ds"] = pd.to_datetime(actuals_df["ds"])
    predictions_df["ds"] = pd.to_datetime(predictions_df["ds"])

    # Prepare the JSON output
    output_data = {}
    for state_key in state_keys:
        subregion_name = state_mapping[state_key]

        # Filter past data until the cutoff date
        past_data = actuals_df[
            (actuals_df["state_key"] == state_key) & (actuals_df["ds"] <= cutoff_date)
        ][["ds", "y"]].values.tolist()

        # Filter future predictions for the next 7 days after the cutoff date
        future_data = predictions_df[
            (predictions_df["state_key"] == state_key)
            & (predictions_df["ds"] > cutoff_date)
            & (predictions_df["ds"] <= cutoff_date + pd.Timedelta(days=7))
        ][["ds", "yhat"]].values.tolist()

        # Convert timestamps to strings (only date part)
        past_data = [[date.strftime("%Y-%m-%d"), value] for date, value in past_data]
        future_data = [
            [date.strftime("%Y-%m-%d"), value] for date, value in future_data
        ]

        output_data[subregion_name] = {"past": past_data, "prediction": future_data}

    return output_data


if __name__ == "__main__":
    import uvicorn

    print(get_prediction(PredictionRequest(cutoff_date="2022-04-28")))
    uvicorn.run(app, host="0.0.0.0", port=8000)
