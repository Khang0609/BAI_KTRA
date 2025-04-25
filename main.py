from bs4 import BeautifulSoup
import json
import mammoth
from PATH import*

# Đọc nội dung HTML từ file .docx bằng mammoth
with open(PATH, "rb") as f:
    result = mammoth.convert_to_html(f)
    html = result.value

soup = BeautifulSoup(html, "html.parser")

# Ghi nội dung soup vào file .txt
with open("soup_content.txt", "w", encoding="utf-8") as f:
    f.write(soup.prettify())

questions = []
current_question = None
current_type = None  # "multiple" hoặc "true_false"
skip = False

# Hàm kiểm tra xem đáp án có được in đậm không
def is_bold(li):
    return li.find("strong") is not None

for element in soup.find_all(["p", "li", "h1"]):
    text = element.get_text(strip=True)

    # Nếu đến phần III (bỏ qua phần tự luận)
    if "phần iii" in text.lower():
        skip = True
        continue
    # Khi gặp lại "phần i" thì bắt đầu lại
    elif "phần i" in text.lower():
        skip = False

    if skip:
        continue

    # Bắt đầu phát hiện loại câu hỏi
    if text.lower().startswith("phần ii. câu hỏi trắc nghiệm đúng/sai"):
        current_type = "true_false"
    elif text.lower().startswith("phần i. câu hỏi trắc nghiệm nhiều lựa chọn"):
        current_type = "multiple"

    # Phát hiện câu hỏi (có từ "Câu x.")
    elif text.startswith("Câu") and "." in text:
        if current_question:
            questions.append(current_question)
        question_text = text.split(".", 1)[1].strip()  # Lấy phần sau "Câu x."
        current_question = {
            "type": current_type,
            "question": question_text,
            "options": []
        }

    # Phát hiện lựa chọn đáp án
    elif current_question and element.name == "li":
        bolded = is_bold(element)
        current_question["options"].append({
            "text": text,
            "correct": bolded
        })

# Thêm câu cuối cùng nếu có
if current_question:
    questions.append(current_question)

# Ghi ra file JSON
with open("parsed_questions.json", "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Đã trích xuất {len(questions)} câu hỏi có chấm đáp án bằng <strong>.")