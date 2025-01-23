import pandas as pd
import sqlite3


def connect_to_db(db_name):
    conn = sqlite3.connect(db_name)
    return conn


def save_csv_to_db(csv_file, table_name, conn):
    df = pd.read_csv(csv_file)
    df.to_sql(table_name, conn, if_exists="replace", index=False)
    print(f"Saved {csv_file} to table {table_name} in the database.")


def main():
    db_name = "final_covid.db"
    conn = connect_to_db(db_name)

    try:
        # Save aggregated_india_data_test.csv to the database
        save_csv_to_db("aggregated_india_data_test.csv", "aggregated_data", conn)

        # Save location_subregion.csv to the database
        save_csv_to_db("location_subregion.csv", "location_subregion", conn)
    finally:
        conn.close()
        print("Database connection closed.")


if __name__ == "__main__":
    main()
