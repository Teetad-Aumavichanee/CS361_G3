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

## 6. Clould Architecture