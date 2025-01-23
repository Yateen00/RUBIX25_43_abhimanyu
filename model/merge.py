import pandas as pd
import sqlite3
import time


def connect_to_db(db_name):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def save_aggregated_data_to_csv(aggregated_data, csv_file):
    aggregated_data.to_csv(csv_file, index=False)


def save_aggregated_data_to_db(aggregated_data, conn):
    try:
        aggregated_data.to_sql(
            "aggregated_data", conn, if_exists="replace", index=False
        )
    except sqlite3.OperationalError as e:
        if "database is locked" in str(e):
            print("Database is locked, retrying in 5 seconds...")
            time.sleep(5)
            save_aggregated_data_to_db(aggregated_data, conn)
        else:
            raise


def main():
    conn = connect_to_db("covid_data.db")

    try:
        query = """
        SELECT * FROM "index" WHERE location_key LIKE 'IN%'
        """
        index_india = pd.read_sql_query(query, conn)

        # Exclude rows where location_key is just 'IN'
        index_india = index_india[index_india["location_key"] != "IN"]
        keys_india = index_india["location_key"].unique()

        # Save location_key and subregion1_name to a new CSV file with only the first 4 letters of location_key
        index_india["state_key"] = index_india["location_key"].str[:5]
        index_india[["state_key", "subregion1_name"]].drop_duplicates().to_csv(
            "location_subregion.csv", index=False
        )

        # Query other datasets based on keys for India
        demographics_india = pd.read_sql_query(
            f"SELECT * FROM demographics WHERE location_key IN ({','.join(['?'] * len(keys_india))})",
            conn,
            params=keys_india,
        )
        weather_india = pd.read_sql_query(
            f"SELECT * FROM weather WHERE location_key IN ({','.join(['?'] * len(keys_india))})",
            conn,
            params=keys_india,
        )
        epidemiology_india = pd.read_sql_query(
            f"SELECT * FROM epidemiology WHERE location_key IN ({','.join(['?'] * len(keys_india))})",
            conn,
            params=keys_india,
        )
        mobility_india = pd.read_sql_query(
            f"SELECT * FROM mobility WHERE location_key IN ({','.join(['?'] * len(keys_india))})",
            conn,
            params=keys_india,
        )

        print("Demographics DataFrame columns:", demographics_india.columns)
        print("Weather DataFrame columns:", weather_india.columns)
        print("Epidemiology DataFrame columns:", epidemiology_india.columns)
        print("Mobility DataFrame columns:", mobility_india.columns)

        # Get all unique dates from datasets that have a date column
        all_dates = pd.concat(
            [weather_india["date"], epidemiology_india["date"], mobility_india["date"]]
        ).unique()

        # Create a DataFrame with all combinations of location_key and date
        location_date_combinations = pd.MultiIndex.from_product(
            [keys_india, all_dates], names=["location_key", "date"]
        ).to_frame(index=False)

        # Merge demographics with the location_date_combinations to duplicate their values for all dates
        demographics_india = location_date_combinations.merge(
            demographics_india, on="location_key", how="left"
        )

        # Merge datasets on 'location_key' and 'date' where applicable
        merged_data = demographics_india.merge(
            weather_india, on=["location_key", "date"], how="left"
        )
        merged_data = merged_data.merge(
            epidemiology_india, on=["location_key", "date"], how="left"
        )
        merged_data = merged_data.merge(
            mobility_india, on=["location_key", "date"], how="left"
        )

        # Add subregion1_name from index_india to merged_data
        merged_data = merged_data.merge(
            index_india[["location_key", "subregion1_name"]],
            on="location_key",
            how="left",
        )

        # Create a new column for state key (first 5 letters of location_key)
        merged_data["state_key"] = merged_data["location_key"].str[:5]

        # Check for missing values and fill them with appropriate values
        merged_data.fillna(
            {
                "population": 0,
                "new_confirmed": 0,
                "new_deceased": 0,
                "new_recovered": 0,
                "new_tested": 0,
            },
            inplace=True,
        )
        merged_data.fillna(method="ffill", inplace=True)

        # Aggregate data based on state_key and date
        aggregated_data = (
            merged_data.groupby(["state_key", "date"])
            .agg(
                {
                    "population": "sum",
                    "average_temperature_celsius": "mean",
                    "minimum_temperature_celsius": "mean",
                    "maximum_temperature_celsius": "mean",
                    "rainfall_mm": "sum",
                    "snowfall_mm": "sum",
                    "dew_point": "mean",
                    "relative_humidity": "mean",
                    "new_confirmed": "sum",
                    "new_deceased": "sum",
                    "new_recovered": "sum",
                    "new_tested": "sum",
                    "cumulative_confirmed": "sum",
                    "cumulative_deceased": "sum",
                    "cumulative_recovered": "sum",
                    "cumulative_tested": "sum",
                    "mobility_grocery_and_pharmacy": "mean",
                    "mobility_parks": "mean",
                    "mobility_transit_stations": "mean",
                    "mobility_retail_and_recreation": "mean",
                    "mobility_residential": "mean",
                    "mobility_workplaces": "mean",
                }
            )
            .reset_index()
        )

        save_aggregated_data_to_csv(aggregated_data, "aggregated_india_data_test.csv")

        save_aggregated_data_to_db(aggregated_data, conn)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
