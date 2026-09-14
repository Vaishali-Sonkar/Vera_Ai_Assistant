from resume_parser import extract_text_from_pdf


pdf_path = r"D:\ai_resume_assistant\backend\data\vaishali_sept.pdf"

text = extract_text_from_pdf(pdf_path)

print(text)