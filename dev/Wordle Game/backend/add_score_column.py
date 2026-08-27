import os
from sqlalchemy import create_engine, MetaData, Column, Integer, text
from dotenv import load_dotenv

load_dotenv()

DB_URI = os.getenv('DB_URI', 'sqlite:///wordle.db')
engine = create_engine(DB_URI)
meta = MetaData()
meta.reflect(bind=engine)

def add_column(engine, table_name, column):
    column_name = column.compile(dialect=engine.dialect)
    column_type = column.type.compile(engine.dialect)
    sql = f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}'
    with engine.connect() as connection:
        connection.execute(text(sql))
        connection.commit()

if __name__ == "__main__":
    if 'users' in meta.tables and 'score' not in meta.tables['users'].c:
        add_column(engine, 'users', Column('score', Integer, default=0))
        print("Column 'score' added to 'users' table.")
    else:
        print("Column 'score' check complete.")
