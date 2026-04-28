# Software Requirements Specification

## Project Information

- **GitHub Repository:** https://github.com/UNO-CSCI4830/CareTrack-Connect  
- **Team:** Project 1 – Health Tracker  
- **Project Title:** CareTrack Connect

---

# Team Members

- Charles Dougherty  
- Zerin Shaima Meem  
- Mohammed Njie  
- Robert Lake  
- Charlie Henningsen  
- Salah Aldyn Khair Allah  
- Jessica Miller

---


# Stakeholders and Requirements

## Patients

- Patient Profile Management  
- Daily Check-In for Symptoms  
- Appointment Scheduling  
- Audio Capture  
- Weekly Summary & Reporting  
- History Tracking  
- Home Page - Patient  
- Settings Function  
- Patient Accessibility Research  
- Patient Data Retention  
- Maintain Low Cognitive Load

## Doctors

- Daily Check-In for Symptoms  
- Doctor Access to Patient Responses  
- Appointment Scheduling  
- Automated Alerts for Critical Symptoms  
- Home Page - Doctor  
- Settings Function  
- Questions Research  
- Doctor Accessibility Research  
- User Friendly Interface Design

## Administrators

- User Database  
- Doctor Access to Patient Responses  
- Data Encryption  
- Patient Data Retention

## All Users

- Login Page  
- User Session Management  
- Data Encryption  
- HIPAA Compliance  
- System Responsiveness

---

# Functional Requirements (FR)

---

## FR1. Login Page

- **Goal:** The system will greet the user with a login page  
- **Stakeholders:** All  
- **Description:** The system shall present a login page with username/email and password fields. Invalid credentials shall display error messages. Forgot Password option included.  
- **Origin:** Scrum 2  
- **Version:** 1.0  
- **Date:** 2/23/2026  
- **Priority:** 1

---

## FR2. Patient Profile Management

- **Goal:** Allow patients to create and update their health profile  
- **Stakeholders:** Patients  
- **Description:** Patients can manage personal information, contact details, emergency contacts, allergies, and medications.  
- **Origin:** Scrum 2  
- **Version:** 1.0  
- **Date:** 2/23/2026  
- **Priority:** 2

---

## FR3. User Database

- **Goal:** Keep track of user logins  
- **Stakeholders:** Administrators  
- **Description:** Maintain credentials, security questions, and user roles (patient/doctor).  
- **Origin:** Scrum 2  
- **Version:** 1.0  
- **Priority:** 2

---

## FR4. Daily Check-In for Symptoms

- **Goal:** Allow patients to submit daily health check-ins  
- **Stakeholders:** Patients, Doctors  
- **Description:** Patients answer daily health questions. System confirms successful or failed submissions.  
- **Origin:** Scrum 2  
- **Version:** 1.0  
- **Date:** 2/28/2026  
- **Priority:** 1

---

## FR5. Doctor Access to Patient Responses

- **Goal:** Doctors can view patient health data  
- **Stakeholders:** Doctors, Administrators  
- **Description:** Doctors may only view data for assigned patients.  
- **Origin:** Scrum 1  
- **Version:** 1.0  
- **Date:** 2/28/2026  
- **Priority:** 1

---

## FR6. Appointment Scheduling

- **Goal:** Patients can schedule appointments  
- **Stakeholders:** Patients, Doctors  
- **Description:** View available slots, schedule, reschedule, or cancel appointments. Notifications sent to both parties.  
- **Priority:** 4

---

## FR7. Automated Alerts for Critical Symptoms

- **Goal:** Notify doctors of concerning symptoms  
- **Stakeholders:** Patients, Doctors  
- **Description:** System flags risky submissions and alerts assigned doctor.  
- **Priority:** 2

---

## FR8. User Session Management

- **Goal:** Ensure safe logout after inactivity  
- **Stakeholders:** All  
- **Description:** Auto logout after inactivity with warning and extension option.  
- **Priority:** 2

---

## FR9. Data Encryption

- **Goal:** Protect sensitive patient data  
- **Stakeholders:** Administrators  
- **Description:** Encrypt data in transit and at rest using secure standards.  
- **Priority:** 4

---

## FR10. Audio Capture

- **Goal:** Patients can upload audio symptoms  
- **Stakeholders:** Patients  
- **Description:** Supports patients unable to type symptoms.  
- **Priority:** 3

---

## FR11. Weekly Summary & Reporting

- **Goal:** Generate weekly PDF reports  
- **Stakeholders:** Patients  
- **Description:** Summarize weekly trends and progress/regression.  
- **Priority:** 5

---

## FR12. History Tracking

- **Goal:** Show progress history  
- **Stakeholders:** Patients  
- **Description:** Graphs, previous reports, prescriptions, hospital visits.  
- **Priority:** 4

---

## FR13. Home Page - Patient

- **Goal:** Introduce application to patients  
- **Stakeholders:** Patients  
- **Description:** Help users connect with doctors and get started.  
- **Priority:** 1

---

## FR14. Home Page - Doctor

- **Goal:** Introductory page for doctors  
- **Stakeholders:** Doctors  
- **Description:** Explains doctor workflow and patient access.  
- **Priority:** 1

---

## FR15. Settings Function

- **Goal:** Allow personalization  
- **Stakeholders:** Doctors, Patients  
- **Description:** Change input methods, contact info, doctor settings, account settings.  
- **Priority:** 1

---

# Non Functional Requirements (NFR)

---

## NFR1. Questions Research

- Relevant 10 health questions for communication between patients and doctors.  
- **Priority:** 1

---

## NFR2. Patient Accessibility Research

- UI must support Parkinson’s accessibility needs.  
- **Priority:** 1

---

## NFR3. Doctor Accessibility Research

- Fast and intuitive doctor workflow.  
- **Priority:** 1

---

## NFR4. HIPAA Compliance

- Patient data protected under HIPAA standards.  
- **Priority:** 5

---

## NFR5. Patient Data Retention

- Retain records legally, allow deletion requests.  
- **Priority:** 3

---

## NFR6. System Responsiveness

- Confirm check-in submissions within 2 seconds.  
- **Priority:** 3

---

## NFR7. User Friendly Interface Design

- Clean, simple, FAQ/help support.  
- **Priority:** 1

---

## NFR8. Maintain Low Cognitive Load

- Daily check-in under 2 minutes  
- Large buttons  
- Soothing colors  
- Easy navigation

- **Priority:** 1

---
