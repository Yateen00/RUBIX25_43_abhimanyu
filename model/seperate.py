import pandas as pd
import sqlite3
from prophet import Prophet
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    mean_absolute_percentage_error,
)
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import os
import pickle

matplotlib.use("Agg")


def connect_to_db(db_name):
    conn = sqlite3.connect(db_name)
    return conn


def load_data():

    conn = connect_to_db("final_covid.db")

 
    query = "SELECT * FROM aggregated_data"
    aggregated_data = pd.read_sql_query(query, conn)


    conn.close()

    # Prepare the data for Prophet
    # Prophet requires the columns to be named 'ds' for the date and 'y' for the value to be predicted
    aggregated_data.rename(
        columns={"date": "ds", "cumulative_confirmed": "y"}, inplace=True
    )

    return aggregated_data


def train_or_load_model(state_key, train_data, use_trained_model):
    model_dir = "models"
    model_filename = f"{model_dir}/prophet_model_{state_key}.pkl"

    # Create the directory if it doesn't exist
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    if use_trained_model and os.path.exists(model_filename):
        with open(model_filename, "rb") as f:
            model = pickle.load(f)
        print(f"Loaded trained model for state {state_key}")
    else:
        model = Prophet()
        model.fit(train_data[["ds", "y"]])
        with open(model_filename, "wb") as f:
            pickle.dump(model, f)
        print(f"Trained and saved model for state {state_key}")

    return model


def make_predictions(state_key, state_data, use_trained_model):
    # Train or load the model
    model = train_or_load_model(state_key, state_data, use_trained_model)

    # Create a dataframe for the entire date range
    future = model.make_future_dataframe(
        periods=0
    )  # periods=0 to include only the historical dates

    # Make predictions for the entire date range
    forecast = model.predict(future)

    # Extract the relevant columns from the forecast
    forecast = forecast[["ds", "yhat"]]

    # Add the state key to the forecast
    forecast["state_key"] = state_key

    return forecast


def evaluate_and_plot(predictions_df, actuals_df, state_keys):
    # Ensure the 'ds' columns are of datetime type
    predictions_df["ds"] = pd.to_datetime(predictions_df["ds"])
    actuals_df["ds"] = pd.to_datetime(actuals_df["ds"])

    # Rename the actual values column to 'y_actual' for clarity
    actuals_df.rename(columns={"y": "y_actual"}, inplace=True)

    # Merge the predictions and actuals on the date and state_key
    results_df = pd.merge(
        predictions_df,
        actuals_df,
        on=["ds", "state_key"],
        suffixes=("_pred", "_actual"),
    )

    # Print the merged dataframe for debugging
    print("Merged DataFrame (results_df):")
    print(results_df.head())

    # Calculate the evaluation metrics
    mae = mean_absolute_error(results_df["y_actual"], results_df["yhat"])
    mse = mean_squared_error(results_df["y_actual"], results_df["yhat"])
    rmse = np.sqrt(mse)
    mape = mean_absolute_percentage_error(results_df["y_actual"], results_df["yhat"])

    # Print the evaluation metrics
    print(f"Mean Absolute Error (MAE): {mae}")
    print(f"Mean Squared Error (MSE): {mse}")
    print(f"Root Mean Squared Error (RMSE): {rmse}")
    print(f"Mean Absolute Percentage Error (MAPE): {mape}")

    # Plot the predictions vs actual values for two specific states
    state_keys_to_plot = state_keys[:2]  # Select the first two states for plotting

    plt.figure(figsize=(10, 6))
    for state_key in state_keys_to_plot:
        state_results = results_df[results_df["state_key"] == state_key]
        plt.plot(
            state_results["ds"], state_results["y_actual"], label=f"Actual {state_key}"
        )
        plt.plot(
            state_results["ds"], state_results["yhat"], label=f"Predicted {state_key}"
        )

    plt.xlabel("Date")
    plt.ylabel("Cumulative Confirmed Cases")
    plt.title("Predictions vs Actuals for Two States")
    plt.legend()
    plt.savefig("predictions_vs_actuals_two_states.png")

    print(
        "Plot of predictions vs actuals for two states has been saved to predictions_vs_actuals_two_states.png"
    )



def main(use_trained_model=True):
    aggregated_data = load_data()

    # Create a list to store the predictions and actual values
    predictions = []
    actuals = []

    # Get the unique state keys
    state_keys = aggregated_data["state_key"].unique()



    # Train a Prophet model for each state and make predictions
    for state_key in state_keys:
        # Filter the data for the current state
        state_data = aggregated_data[aggregated_data["state_key"] == state_key]

        # Make predictions for the entire date range
        forecast = make_predictions(state_key, state_data, use_trained_model)

        # Append the forecast and actual values to the lists
        predictions.append(forecast[["ds", "yhat", "state_key"]])
        actuals.append(state_data[["ds", "y", "state_key"]])

    # Concatenate all the predictions and actuals into single dataframes
    predictions_df = pd.concat(predictions)
    actuals_df = pd.concat(actuals)

    # Print the predictions and actuals dataframes for debugging
    print("Predictions DataFrame (predictions_df):")
    print(predictions_df.head())
    print("Actuals DataFrame (actuals_df):")
    print(actuals_df.head())

    # Evaluate and plot the results
    evaluate_and_plot(predictions_df, actuals_df, state_keys)


if __name__ == "__main__":
    main(use_trained_model=True)
