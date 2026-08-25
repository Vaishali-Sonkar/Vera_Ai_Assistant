from sheets_service import save_feedback


save_feedback(
    rating=5,
    feedback="Testing my AI resume chatbot feedback system.",
    name="Test Recruiter",
    email="test@example.com"
)

print("Feedback saved successfully!")