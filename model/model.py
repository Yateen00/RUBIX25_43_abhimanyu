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

# Connect to the SQLite database
conn = sqlite3.connect("final_covid.db")

# Load the aggregated data from the database
query = "SELECT * FROM aggregated_data"
aggregated_data = pd.read_sql_query(query, conn)

# Close the database connection
conn.close()

# Prepare the data for Prophet
# Prophet requires the columns to be named 'ds' for the date and 'y' for the value to be predicted
aggregated_data.rename(
    columns={"date": "ds", "cumulative_confirmed": "y"}, inplace=True
)

# Ensure the 'ds' column is of datetime type
aggregated_data["ds"] = pd.to_datetime(aggregated_data["ds"])

# Create a list to store the predictions and actual values
predictions = []
actuals = []

# Get the unique state keys
state_keys = aggregated_data["state_key"].unique()

# Train a Prophet model for each state and make predictions
for state_key in state_keys:
    # Filter the data for the current state
    state_data = aggregated_data[aggregated_data["state_key"] == state_key]

    # Split the data into training and test sets
    train_data = state_data.iloc[:-7]
    test_data = state_data.iloc[-7:]

    # Initialize the Prophet model
    model = Prophet()

    # Fit the model
    model.fit(train_data[["ds", "y"]])

    # Create a dataframe for future dates (next 7 days)
    future = model.make_future_dataframe(periods=7)

    # Make predictions
    forecast = model.predict(future)

    # Extract the relevant columns from the forecast
    forecast = forecast[["ds", "yhat"]]

    # Add the state key to the forecast
    forecast["state_key"] = state_key

    # Append the forecast and actual values to the lists
    predictions.append(forecast[["ds", "yhat", "state_key"]])
    actuals.append(test_data[["ds", "y", "state_key"]])

# Concatenate all the predictions and actuals into single dataframes
predictions_df = pd.concat(predictions)
actuals_df = pd.concat(actuals)

# Ensure the 'ds' columns are of datetime type
predictions_df["ds"] = pd.to_datetime(predictions_df["ds"])
actuals_df["ds"] = pd.to_datetime(actuals_df["ds"])

# Check for missing columns
print("Predictions DataFrame columns:", predictions_df.columns)
print("Actuals DataFrame columns:", actuals_df.columns)

# Merge the predictions and actuals on the date and state_key
results_df = pd.merge(
    predictions_df, actuals_df, on=["ds", "state_key"], suffixes=("_pred", "_actual")
)

# Check the columns of the merged DataFrame
print("Results DataFrame columns:", results_df.columns)

# Calculate the evaluation metrics
mae = mean_absolute_error(results_df["y"], results_df["yhat"])
mse = mean_squared_error(results_df["y"], results_df["yhat"])
rmse = np.sqrt(mse)
mape = mean_absolute_percentage_error(results_df["y"], results_df["yhat"])

# Print the evaluation metrics
print(f"Mean Absolute Error (MAE): {mae}")
print(f"Mean Squared Error (MSE): {mse}")
print(f"Root Mean Squared Error (RMSE): {rmse}")
print(f"Mean Absolute Percentage Error (MAPE): {mape}")

# Save the predictions to a CSV file
predictions_df.to_csv("predictions_next_week.csv", index=False)

# Plot the predictions vs actual values
plt.figure(figsize=(10, 6))
plt.plot(results_df["ds"], results_df["y"], label="Actual")
plt.plot(results_df["ds"], results_df["yhat"], label="Predicted")
plt.xlabel("Date")
plt.ylabel("Cumulative Confirmed Cases")
plt.title("Predictions vs Actuals")
plt.legend()
plt.savefig("predictions_vs_actuals.png")

print("Predictions for the next week have been saved to predictions_next_week.csv")
print("Plot of predictions vs actuals has been saved to predictions_vs_actuals.png")
