# Software Requirements Specification (SRS)

## Online Examination and Proctoring System (OEPS)

**Document Version:** 1.0  
**Prepared By:** Sumit Kumar **[Team Dexter]**  
**Course:** B.Tech – Software Engineering    
**Institute:** Graphic Era University, Dehradun   
**Academic Year:** 2026    

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a complete and precise description of the requirements for the **Online Examination and Proctoring System (OEPS)**. It is intended for faculty evaluators, project guides, developers, testers, and end users. This document follows **IEEE 830 / IEEE 29148 standards** and serves as a contractual reference between stakeholders and developers.

### 1.2 Document Conventions
- The term *shall* indicates mandatory requirements
- The term *should* indicates recommended features
- The term *may* indicates optional features

### 1.3 Intended Audience and Reading Suggestions
- **Faculty/Examiners:** Overall system understanding and evaluation
- **Developers:** Functional and non-functional requirements
- **Testers:** Test planning and validation
- **Students:** Project implementation and viva preparation

### 1.4 Product Scope
The Online Examination and Proctoring System is a web-based application that enables institutions to conduct secure online examinations. It provides facilities for exam creation, scheduling, candidate monitoring, automatic evaluation, and result generation while minimizing human intervention and malpractice.

### 1.5 References
1. IEEE Std 830-1998 – Software Requirements Specification
2. IEEE Std 29148-2018 – Systems and Software Engineering
3. Roger S. Pressman – Software Engineering: A Practitioner’s Approach

---

## 2. Overall Description

### 2.1 Product Perspective
OEPS is a standalone, centralized web-based system that interacts with users via a browser interface and stores data in a backend database. It replaces traditional pen-and-paper examinations and partially manual online systems.

### 2.2 Product Functions
- User registration and authentication
- Role-based access control (Admin, Examiner, Student)
- Question bank management
- Exam scheduling and conduction
- Proctoring via activity monitoring
- Automatic evaluation and result processing
- Report generation

### 2.3 User Classes and Characteristics

| User Class | Description |
|-----------|-------------|
| Admin | Technical knowledge, system configuration authority |
| Examiner | Subject expert, moderate computer proficiency |
| Student | Basic computer and internet knowledge |

### 2.4 Operating Environment
- Client: Web browser (Chrome, Firefox, Edge)
- Server: Application server (Python/Java/Node.js)
- Database: MySQL / PostgreSQL
- OS: Windows / Linux

### 2.5 Design and Implementation Constraints
- Internet connectivity required during exams
- Browser-based execution only
- Compliance with data privacy regulations

### 2.6 User Documentation
- User manual
- Admin guide
- Online help documentation

### 2.7 Assumptions and Dependencies
- Users have valid credentials
- Server availability during examination periods
- Secure hosting environment

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- Login page
- Role-based dashboards
- Exam interface with timer
- Result display screen

### 3.2 Hardware Interfaces
- Standard computer or laptop
- Webcam (optional for advanced proctoring)

### 3.3 Software Interfaces
- Web server
- Database server
- Email/SMS service (optional)

### 3.4 Communication Interfaces
- HTTPS protocol
- REST APIs

---

## 4. System Features

### 4.1 User Authentication
**Description:** Secure login and role validation.

**Functional Requirements:**
- FR-1: The system shall allow users to log in using valid credentials
- FR-2: The system shall restrict access based on user roles

### 4.2 Question Bank Management
**Description:** Manage exam questions.

**Functional Requirements:**
- FR-3: The examiner shall add, update, and delete questions
- FR-4: The system shall support MCQ and subjective questions

### 4.3 Exam Management
**Description:** Exam scheduling and execution.

**Functional Requirements:**
- FR-5: The admin shall schedule exams
- FR-6: The system shall enforce exam time limits

### 4.4 Proctoring Module
**Description:** Monitor candidate activities.

**Functional Requirements:**
- FR-7: The system shall detect tab switching
- FR-8: The system shall log suspicious activities

### 4.5 Evaluation and Result Processing
**Description:** Automatic and manual evaluation.

**Functional Requirements:**
- FR-9: The system shall auto-evaluate MCQs
- FR-10: The system shall generate results after submission

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- NFR-1: The system shall support concurrent users
- NFR-2: Response time shall be less than 3 seconds

### 5.2 Security Requirements
- NFR-3: User passwords shall be encrypted
- NFR-4: Secure session management shall be enforced

### 5.3 Reliability Requirements
- NFR-5: System uptime shall be maintained during exams

### 5.4 Usability Requirements
- NFR-6: The interface shall be intuitive and user-friendly

### 5.5 Maintainability Requirements
- NFR-7: The system shall support modular updates

### 5.6 Portability Requirements
- NFR-8: The system shall run on major browsers

---

## 6. Other Requirements
- Audit logs for exam activities
- Data backup and recovery

---

## 7. Data Flow Diagrams (DFD)

### 7.1 DFD Level 0 (Context Diagram)
**Process:** Online Examination and Proctoring System

**External Entities:**
- Student
- Examiner
- Admin

**Data Flows:**
- Student → System: Login details, exam responses
- System → Student: Exam questions, results
- Examiner → System: Question data, evaluation inputs
- Admin → System: Exam schedules, user management data
- System → Admin: Reports, logs

This level represents the system as a single process interacting with external entities.

---

### 7.2 DFD Level 1

**Main Processes:**
1. User Authentication
2. Question Bank Management
3. Exam Conduction
4. Proctoring & Monitoring
5. Evaluation & Result Processing

**Data Stores:**
- D1: User Database
- D2: Question Bank
- D3: Exam Records
- D4: Result Database
- D5: Proctoring Logs

**Description:**
- Users authenticate through Process 1 using D1
- Examiner manages questions via Process 2 using D2
- Students attempt exams via Process 3 using D3
- Activities are monitored in Process 4 and stored in D5
- Results are generated in Process 5 and stored in D4

---

### 7.3 DFD Level 2 (Exam Conduction Process)

**Process Decomposition: Exam Conduction**
- 3.1 Verify Exam Schedule
- 3.2 Load Question Paper
- 3.3 Start Timer
- 3.4 Capture Responses
- 3.5 Submit Exam

**Data Flow:**
- Student requests exam → Verify schedule
- Questions fetched from Question Bank
- Responses stored in Exam Records
- Submission sent to Evaluation module

---

## 8. Use Case Diagram Description

### 8.1 Actors
- Admin
- Examiner
- Student

### 8.2 Use Cases

**Admin:**
- Manage Users
- Schedule Exams
- View Reports

**Examiner:**
- Create Question Bank
- Evaluate Answers
- Publish Results

**Student:**
- Login
- Attempt Exam
- Submit Exam
- View Result

---

## 9. Finite State Machine (FSM)

### 9.1 Exam Lifecycle FSM

**States:**
- Idle
- Exam Scheduled
- Exam Started
- Exam In Progress
- Exam Submitted
- Evaluated
- Result Published

**Transitions:**
- Idle → Exam Scheduled (Admin schedules exam)
- Exam Scheduled → Exam Started (Start time reached)
- Exam Started → Exam In Progress (Student logs in)
- Exam In Progress → Exam Submitted (Student submits)
- Exam Submitted → Evaluated (System/Examiner evaluates)
- Evaluated → Result Published (Admin publishes result)

---

## 10. Mapping to SRS Requirements

| SRS Requirement | Diagram Coverage |
|-----------------|------------------|
| FR-1, FR-2 | DFD Level 0, Use Case |
| FR-3, FR-4 | DFD Level 1, Use Case |
| FR-5, FR-6 | DFD Level 2, FSM |
| FR-7, FR-8 | DFD Level 1 |
| FR-9, FR-10 | DFD Level 2, FSM |

---

## 12. Software Design Document (SDD)

This section describes the architectural and detailed design of the Online Examination and Proctoring System in accordance with **IEEE Software Design standards** and maps directly to the approved SRS.

---

## 12.1 Design Goals
- High cohesion and low coupling
- Scalability and maintainability
- Clear separation of concerns
- Reusability of components

---

## 12.2 Architectural Design

### 12.2.1 Architecture Style
The system follows a **Layered Architecture**:

1. Presentation Layer (UI)
2. Application Layer (Business Logic)
3. Data Access Layer
4. Database Layer

**Justification:**
Layered architecture improves maintainability, supports modular testing, and aligns with software engineering best practices.

---

## 12.3 UML Diagrams

### 12.3.1 Class Diagram (Description)

**Main Classes:**
- User (userId, name, role)
- Student (rollNo, course)
- Examiner (employeeId, subject)
- Admin (adminId)
- Exam (examId, date, duration)
- Question (questionId, type, marks)
- Result (resultId, score)
- ProctoringLog (logId, activityType)

**Relationships:**
- User is a parent class of Student, Examiner, and Admin
- Exam contains multiple Questions
- Student attempts Exam
- Exam generates Result

---

### 12.3.2 Sequence Diagram – Exam Attempt Flow

**Sequence:**
1. Student logs in
2. System validates credentials
3. Student selects exam
4. System loads questions
5. Timer starts
6. Student submits answers
7. System evaluates responses
8. Result is stored

---

### 12.3.3 ER Diagram (Description)

**Entities:**
- USER (user_id, role)
- EXAM (exam_id, schedule)
- QUESTION (question_id, exam_id)
- RESPONSE (response_id, student_id)
- RESULT (result_id, marks)
- PROCTOR_LOG (log_id, activity)

**Relationships:**
- USER attempts EXAM
- EXAM has QUESTION
- RESPONSE generates RESULT

---

### 12.3.4 Package Diagram

**Packages:**
- auth
- exam
- question
- proctoring
- evaluation
- reporting

Each package is independent and communicates through defined interfaces.

---

## 12.4 Design Concepts

### 12.4.1 Cohesion
- Each module performs a single well-defined task

### 12.4.2 Coupling
- Loose coupling achieved through service-based communication

### 12.4.3 Abstraction and Modularity
- Implementation details are hidden from users
- Modules can be modified independently

---

## 12.5 Design Metrics

### 12.5.1 Cyclomatic Complexity

Formula:
V(G) = E – N + 2P

For Exam Submission Module:
- Edges (E) = 12
- Nodes (N) = 10
- Connected Components (P) = 1

V(G) = 12 – 10 + 2 = 4

**Interpretation:** Low complexity, easy to test and maintain.

---

### 12.5.2 Function Point Analysis (FPA)

| Component | Count |
|---------|-------|
| External Inputs | 8 |
| External Outputs | 6 |
| External Inquiries | 4 |
| Internal Logical Files | 5 |
| External Interface Files | 2 |

**Estimated Function Points:** Medium-sized application suitable for academic implementation.

---

## 12.6 Design Validation
- All design elements trace back to SRS requirements
- UML diagrams validate functional requirements
- Metrics confirm maintainability and quality

---

## 14. Software Testing

This section describes the testing strategy adopted for the Online Examination and Proctoring System in accordance with software engineering testing principles.

---

## 14.1 Testing Objectives
- Verify that the system meets specified requirements
- Detect defects before deployment
- Ensure reliability and performance

---

## 14.2 Testing Levels

### 14.2.1 Unit Testing
Individual modules such as Login, Exam Timer, and Result Calculation are tested independently.

### 14.2.2 Integration Testing
Interaction between modules such as Exam Module and Evaluation Module is tested.

### 14.2.3 System Testing
The complete system is tested against functional and non-functional requirements.

### 14.2.4 Acceptance Testing
The system is validated by end users to ensure it meets expectations.

---

## 14.3 Testing Types

### 14.3.1 Black Box Testing
Testing based on input-output behavior without knowledge of internal code.

### 14.3.2 White Box Testing
Testing internal logic such as timer flow and submission conditions.

### 14.3.3 Regression Testing
Ensures new changes do not affect existing functionality.

---

## 14.4 Test Plan

| Test ID | Module | Objective |
|-------|--------|-----------|
| TP-01 | Login | Validate authentication |
| TP-02 | Exam | Verify time enforcement |
| TP-03 | Evaluation | Validate result accuracy |

---

## 14.5 Sample Test Cases

| Test Case ID | Description | Input | Expected Output |
|-------------|------------|-------|-----------------|
| TC-01 | Valid Login | Correct credentials | Login success |
| TC-02 | Invalid Login | Wrong password | Error message |
| TC-03 | Exam Timeout | Time exceeded | Auto submit |

---

## 14.6 Bug Report Format

| Bug ID | Module | Severity | Status |
|-------|--------|----------|--------|
| BG-01 | Exam Timer | High | Fixed |

---

## 14.7 Test Environment
- OS: Windows/Linux
- Browser: Chrome
- Database: MySQL

---

## 14.8 Alpha and Beta Testing
- Alpha testing conducted by developers
- Beta testing conducted by selected users

---

## 15. Project Management and Maintenance

---

## 15.1 Cost Estimation using COCOMO (Basic Model)

Effort (E) = a × (KLOC)^b

For Organic Mode:
- a = 2.4
- b = 1.05

Assuming KLOC = 10

E = 2.4 × (10)^1.05 ≈ 27 Person-Months

---

## 15.2 Risk Analysis

| Risk | Impact | Mitigation |
|-----|--------|------------|
| Server failure | High | Backup server |
| Network issues | Medium | Retry mechanism |
| Security threats | High | Encryption |

---

## 15.3 Software Maintenance

- Corrective: Bug fixes
- Adaptive: Browser updates
- Perfective: UI improvements
- Preventive: Security patches

---

## 15.4 Software Quality Assurance
- Reviews and audits
- Test documentation
- Coding standards

---

## 15.5 Standards and Models

- ISO 9001 awareness
- SEI-CMM maturity levels

---

## 16. Final Revision History

| Version | Date | Description |
|--------|------|-------------|
| 1.3 | <Date> | Added Testing and Project Management |
