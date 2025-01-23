import pandas as pd
import sqlite3


conn = sqlite3.connect("covid_data.db")


demographics = pd.read_csv("raw/demographics.csv")
index = pd.read_csv("raw/index.csv")
mobility = pd.read_csv("raw/mobility.csv")
weather = pd.read_csv("raw/weather.csv")
epidemiology = pd.read_csv("raw/epidemiology.csv")


demographics.to_sql("demographics", conn, if_exists="replace", index=False)
index.to_sql("index", conn, if_exists="replace", index=False)
mobility.to_sql("mobility", conn, if_exists="replace", index=False)
weather.to_sql("weather", conn, if_exists="replace", index=False)
epidemiology.to_sql("epidemiology", conn, if_exists="replace", index=False)


conn.close()
