import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def get_sheet():

    credentials = Credentials.from_service_account_file(
        "../credentials.json",
        scopes=SCOPES
    )

    client = gspread.authorize(credentials)

    spreadsheet = client.open("AI Resume Feedback")

    return spreadsheet.sheet1


def save_feedback(
    rating: int,
    feedback: str,
    name: str | None = None,
    email: str | None = None
):

    worksheet = get_sheet()

def save_feedback(name, email, feedback, rating):
    worksheet = get_sheet()

    worksheet.append_row([
        name,
        email,
        feedback,
        rating
    ])