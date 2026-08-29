# Project Context: e-Mailbox System (Department Document Routing & Tracking)

---

## 1. Executive Summary & Problem Statement

* **Current Situation:** สาขาวิชามีเอกสารไหลเข้าจากหลายช่องทาง (หนังสือราชการภายนอก, เอกสารจากคณะ, บันทึกข้อความภายใน) กระบวนการส่งต่อในปัจจุบันยังเป็นแบบ Manual หรือผ่านแชตกลุ่ม ส่งผลให้เกิดปัญหา:
  * เอกสารตกหล่น สูญหาย หรือส่งต่อล่าช้า
  * ไม่สามารถระบุได้ว่าตอนนี้เอกสารดำเนินการอยู่ที่ใคร
  * ขาดระบบ Audit Trail สำหรับตรวจสอบย้อนหลังว่าเอกสารถึงขั้นตอนใด
* **Project Objective:** ออกแบบและพัฒนาระบบเว็บแอปพลิเคชัน **e-Mailbox** สำหรับรับ ลงทะเบียน จัดเก็บ กระจายเอกสาร และติดตามสถานะการดำเนินงานของเอกสารอิเล็กทรอนิกส์ในระดับสาขาวิชาอย่างเป็นระบบและตรวจสอบย้อนหลังได้

---

## 2. Project Scope & Phasing

### Version 1: Core Distribution (Current Target - MVP)
* **Admin Role (ผู้ลงทะเบียน/ธุรการ):**
  * บันทึกข้อมูลและลงทะเบียนเอกสารเข้า
  * อัปโหลดไฟล์เอกสาร (PDF, Image) ขึ้นระบบ
  * ระบุผู้รับเอกสาร
* **User Role (อาจารย์ / เจ้าหน้าที่ผู้รับ):**
  * เข้าสู่ระบบเพื่อดูเฉพาะกล่องข้อความเข้าของตนเอง (Personal Inbound Mailbox)
  * เปิดอ่าน ดูรายละเอียดได้

---

## 3. User Roles & Permission Matrix (V1)

| Feature / Capability | Admin (ธุรการ/แอดมิน) | User (อาจารย์/เจ้าหน้าที่) |
| :--- | :---: | :---: |
| Authentication (Login/Logout) | ✅ | ✅ |
| Upload Document | ✅ | ❌ |
| Assign Recipients (กำหนดผู้รับ) | ✅ | ❌ |
| View All Documents (ภาพรวมทั้งสาขา) | ✅ | ❌ |
| View Personal Mailbox (เฉพาะเอกสารตัวเอง) | ✅ | ✅ |
| View / Download Assigned File | ✅ | ✅ *(เฉพาะที่ได้รับมอบหมาย)* |


---

## 4. Technical Stack Specifications

* **Backend:** Python 3.11+ (Flask)
* **Frontend:** HTML5, CSS3, JavaScript
* **Database:** NoSQL (MongoDB) ใช้ `pymongo` 
* **File Storage:** Local Volume (จัดเก็บไฟล์ไว้ในโฟลเดอร์ `/uploads` ภายใน Container และ Mount ไปยัง Host)
* **Authentication:** Session-based หรือ JWT Authentication พร้อม Role-Based Access Control (RBAC: `ADMIN`, `USER`)
* **Deployment & Environment:** Docker & Docker Compose

##  5. Database schema 
wait...

## 6. Cloud Architecture 
wait...

## 7. Folder Structure

The system is organized into two main sections: `backend` and `frontend`. Docker and shared project configuration remain in the root folder.

```text
G3-projetc/
├── Dockerfile                 # Builds the application container
├── docker-compose.yml         # Runs the backend and MongoDB services
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
├── project-context.md         # Project requirements and architecture
├── .gitignore                 # Files excluded from Git
├── .env                       # Environment-specific configuration
├── uploads/                   # Uploaded document files
│
├── backend/                   # Flask backend section
│   ├── app.py                 # Flask application entry point
│   ├── config.py              # Application configuration
│   ├── routes/                # API and page routes
│   ├── models/                # MongoDB data operations
│   └── services/              # Application business logic
│
└── frontend/                 # Frontend section
    ├── html/                  # HTML page files
    ├── css/                   # CSS stylesheet files
    └── js/                    # JavaScript files
```

The backend handles authentication, document registration, file uploads, recipient assignment, MongoDB access, and role-based permissions. The frontend contains the user interface and communicates with the backend routes.

The `uploads/` directory is mounted into the application container so uploaded documents remain available when containers are recreated. Sensitive values such as database credentials and secret keys belong in `.env` and must not be committed to Git.
