-- ==========================================================
-- CollegeKhoj — Production Database Schema (MySQL 8.x)
-- ==========================================================
-- Naming: snake_case, singular reference / plural table names.
-- Every "fact" table (fees, admissions, facilities, courses) carries
-- verification_status + last_verified_at + source_url + data_year
-- so the platform never presents unverified data as fact.
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS collegekhoj
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE collegekhoj;

-- ----------------------------------------------------------
-- 1. CORE IDENTITY
-- ----------------------------------------------------------

CREATE TABLE users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email             VARCHAR(255) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  role              ENUM('student','college','admin') NOT NULL DEFAULT 'student',
  full_name         VARCHAR(150) NOT NULL,
  phone             VARCHAR(20)  NULL,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  email_verified_at DATETIME     NULL,
  last_login_at     DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE students (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  date_of_birth     DATE NULL,
  preferred_course  VARCHAR(150) NULL,
  preferred_state   VARCHAR(120) NULL,
  preferred_city    VARCHAR(120) NULL,
  budget_min         INT UNSIGNED NULL,
  budget_max         INT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_user (user_id),
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. GEOGRAPHY
-- ----------------------------------------------------------

CREATE TABLE states (
  id    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  code  VARCHAR(10)  NULL,
  UNIQUE KEY uq_states_name (name)
) ENGINE=InnoDB;

CREATE TABLE cities (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  state_id  SMALLINT UNSIGNED NOT NULL,
  name      VARCHAR(120) NOT NULL,
  latitude  DECIMAL(9,6) NULL,
  longitude DECIMAL(9,6) NULL,
  UNIQUE KEY uq_city_state (state_id, name),
  CONSTRAINT fk_cities_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. COLLEGES
-- ----------------------------------------------------------

CREATE TABLE colleges (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(280) NOT NULL,
  city_id             INT UNSIGNED NOT NULL,
  state_id            SMALLINT UNSIGNED NOT NULL,
  address             VARCHAR(500) NULL,
  latitude            DECIMAL(9,6) NULL,
  longitude           DECIMAL(9,6) NULL,
  college_type        ENUM('government','private','public','autonomous','university') NOT NULL,
  established_year    SMALLINT UNSIGNED NULL,
  affiliation         VARCHAR(255) NULL,
  accreditation       VARCHAR(255) NULL,
  website             VARCHAR(255) NULL,
  contact_email       VARCHAR(255) NULL,
  contact_phone       VARCHAR(30) NULL,
  logo_url            VARCHAR(500) NULL,
  cover_image_url     VARCHAR(500) NULL,
  description         TEXT NULL,
  is_demo             TINYINT(1) NOT NULL DEFAULT 0,
  verification_status ENUM('verified','needs_verification','reported','outdated') NOT NULL DEFAULT 'needs_verification',
  last_verified_at    DATETIME NULL,
  source_url          VARCHAR(500) NULL,
  data_year           SMALLINT UNSIGNED NULL,
  owner_user_id       BIGINT UNSIGNED NULL,           -- set once a college claims + is approved
  is_published        TINYINT(1) NOT NULL DEFAULT 0,  -- gate: only admin-approved data is public
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_colleges_slug (slug),
  KEY idx_colleges_city (city_id),
  KEY idx_colleges_state (state_id),
  KEY idx_colleges_type (college_type),
  KEY idx_colleges_verification (verification_status),
  KEY idx_colleges_published (is_published),
  FULLTEXT KEY ft_colleges_name_desc (name, description),
  CONSTRAINT fk_colleges_city FOREIGN KEY (city_id) REFERENCES cities(id),
  CONSTRAINT fk_colleges_state FOREIGN KEY (state_id) REFERENCES states(id),
  CONSTRAINT fk_colleges_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Extended / rarely-queried profile fields kept separate from the hot `colleges` row
CREATE TABLE college_profiles (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id    BIGINT UNSIGNED NOT NULL,
  about_long    TEXT NULL,
  vision        TEXT NULL,
  mission       TEXT NULL,
  gallery_json  JSON NULL,      -- array of S3 URLs
  social_links  JSON NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_profile_college (college_id),
  CONSTRAINT fk_profile_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. COURSES
-- ----------------------------------------------------------

CREATE TABLE courses (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(150) NOT NULL,       -- e.g. "BBA"
  slug              VARCHAR(180) NOT NULL,
  degree_level      ENUM('undergraduate','postgraduate','diploma','doctorate') NOT NULL,
  full_name         VARCHAR(255) NULL,           -- "Bachelor of Business Administration"
  duration_years    DECIMAL(3,1) NULL,
  description       TEXT NULL,
  eligibility       TEXT NULL,
  typical_subjects  JSON NULL,
  career_paths      JSON NULL,
  entrance_exams    JSON NULL,
  higher_education_options TEXT NULL,
  popular_specializations JSON NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_courses_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE college_courses (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id        BIGINT UNSIGNED NOT NULL,
  course_id         BIGINT UNSIGNED NOT NULL,
  seats             INT UNSIGNED NULL,          -- NULL = not officially available/known
  entrance_exam     VARCHAR(150) NULL,
  eligibility_note  VARCHAR(500) NULL,
  verification_status ENUM('verified','needs_verification','reported','outdated') NOT NULL DEFAULT 'needs_verification',
  last_verified_at  DATETIME NULL,
  source_url        VARCHAR(500) NULL,
  data_year         SMALLINT UNSIGNED NULL,
  is_published      TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_college_course (college_id, course_id),
  KEY idx_cc_course (course_id),
  CONSTRAINT fk_cc_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  CONSTRAINT fk_cc_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. FEES
-- ----------------------------------------------------------

CREATE TABLE fees (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_course_id BIGINT UNSIGNED NOT NULL,
  tuition_fee       DECIMAL(12,2) NULL,
  admission_fee     DECIMAL(12,2) NULL,
  exam_fee          DECIMAL(12,2) NULL,
  hostel_fee        DECIMAL(12,2) NULL,
  other_charges     DECIMAL(12,2) NULL,
  estimated_total   DECIMAL(12,2) GENERATED ALWAYS AS (
                       COALESCE(tuition_fee,0) + COALESCE(admission_fee,0) +
                       COALESCE(exam_fee,0) + COALESCE(hostel_fee,0) + COALESCE(other_charges,0)
                     ) STORED,
  currency          CHAR(3) NOT NULL DEFAULT 'INR',
  verification_status ENUM('verified','needs_verification','reported','outdated') NOT NULL DEFAULT 'needs_verification',
  last_verified_at  DATETIME NULL,
  source_url        VARCHAR(500) NULL,
  data_year         SMALLINT UNSIGNED NULL,
  is_published      TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_fees_cc (college_course_id),
  CONSTRAINT fk_fees_cc FOREIGN KEY (college_course_id) REFERENCES college_courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. ADMISSIONS
-- ----------------------------------------------------------

CREATE TABLE admissions (
  id                     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_course_id      BIGINT UNSIGNED NOT NULL,
  application_start_date DATE NULL,
  application_end_date   DATE NULL,
  entrance_exam          VARCHAR(150) NULL,
  counselling_date       DATE NULL,
  classes_start_date     DATE NULL,
  official_application_url VARCHAR(500) NULL,
  verification_status    ENUM('verified','needs_verification','reported','outdated') NOT NULL DEFAULT 'needs_verification',
  last_verified_at       DATETIME NULL,
  source_url             VARCHAR(500) NULL,
  data_year              SMALLINT UNSIGNED NULL,
  is_published           TINYINT(1) NOT NULL DEFAULT 0,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_admissions_cc (college_course_id),
  KEY idx_admissions_dates (application_start_date, application_end_date),
  CONSTRAINT fk_admissions_cc FOREIGN KEY (college_course_id) REFERENCES college_courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. FACILITIES
-- ----------------------------------------------------------

CREATE TABLE facilities (
  id    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code  VARCHAR(50) NOT NULL,   -- 'hostel','library','sports','wifi','labs','cafeteria','transport'
  label VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_facility_code (code)
) ENGINE=InnoDB;

CREATE TABLE college_facilities (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id    BIGINT UNSIGNED NOT NULL,
  facility_id   SMALLINT UNSIGNED NOT NULL,
  available     TINYINT(1) NOT NULL DEFAULT 1,
  notes         VARCHAR(255) NULL,
  verification_status ENUM('verified','needs_verification','reported','outdated') NOT NULL DEFAULT 'needs_verification',
  last_verified_at DATETIME NULL,
  source_url    VARCHAR(500) NULL,
  is_published  TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_college_facility (college_id, facility_id),
  CONSTRAINT fk_cf_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  CONSTRAINT fk_cf_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. REVIEWS
-- ----------------------------------------------------------

CREATE TABLE reviews (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id        BIGINT UNSIGNED NOT NULL,
  student_id        BIGINT UNSIGNED NOT NULL,
  course_id         BIGINT UNSIGNED NULL,
  academic_year     VARCHAR(20) NULL,
  title             VARCHAR(200) NOT NULL,
  description       TEXT NOT NULL,
  rating_academics      TINYINT UNSIGNED NOT NULL,
  rating_faculty        TINYINT UNSIGNED NOT NULL,
  rating_campus         TINYINT UNSIGNED NOT NULL,
  rating_infrastructure TINYINT UNSIGNED NOT NULL,
  rating_administration TINYINT UNSIGNED NOT NULL,
  rating_value          TINYINT UNSIGNED NOT NULL,
  rating_overall    DECIMAL(3,2) GENERATED ALWAYS AS (
                       (rating_academics + rating_faculty + rating_campus +
                        rating_infrastructure + rating_administration + rating_value) / 6
                     ) STORED,
  status            ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  moderation_note    VARCHAR(500) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_reviews_college (college_id),
  KEY idx_reviews_status (status),
  CONSTRAINT fk_reviews_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  CONSTRAINT chk_ratings CHECK (
    rating_academics BETWEEN 1 AND 5 AND rating_faculty BETWEEN 1 AND 5 AND
    rating_campus BETWEEN 1 AND 5 AND rating_infrastructure BETWEEN 1 AND 5 AND
    rating_administration BETWEEN 1 AND 5 AND rating_value BETWEEN 1 AND 5
  )
) ENGINE=InnoDB;

CREATE TABLE reports (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reportable_type ENUM('review','college_data') NOT NULL,
  reportable_id BIGINT UNSIGNED NOT NULL,
  reported_by_user_id BIGINT UNSIGNED NOT NULL,
  reason        VARCHAR(500) NOT NULL,
  status        ENUM('open','resolved','dismissed') NOT NULL DEFAULT 'open',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at   DATETIME NULL,
  KEY idx_reports_type (reportable_type, reportable_id),
  CONSTRAINT fk_reports_user FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. STUDENT ACTIVITY
-- ----------------------------------------------------------

CREATE TABLE saved_colleges (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  BIGINT UNSIGNED NOT NULL,
  college_id  BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved (student_id, college_id),
  CONSTRAINT fk_saved_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comparisons (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  BIGINT UNSIGNED NOT NULL,
  college_ids JSON NOT NULL,     -- up to 3 college ids
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comparisons_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE deadlines (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id    BIGINT UNSIGNED NOT NULL,
  admission_id  BIGINT UNSIGNED NOT NULL,
  remind_at     DATETIME NOT NULL,
  is_dismissed  TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_deadlines_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_deadlines_admission FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        VARCHAR(60) NOT NULL,   -- 'deadline_reminder','college_update','application_reminder','saved_college_update'
  title       VARCHAR(200) NOT NULL,
  body        VARCHAR(500) NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_user (user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE application_checklists (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id   BIGINT UNSIGNED NOT NULL,
  college_id   BIGINT UNSIGNED NULL,
  item         VARCHAR(255) NOT NULL,
  is_done      TINYINT(1) NOT NULL DEFAULT 0,
  due_date     DATE NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_checklist_student (student_id),
  CONSTRAINT fk_checklist_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_checklist_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. COLLEGE PORTAL / CLAIMS / VERIFICATION WORKFLOW
-- ----------------------------------------------------------

CREATE TABLE college_claims (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id        BIGINT UNSIGNED NOT NULL,
  user_id           BIGINT UNSIGNED NOT NULL,   -- role='college' account claiming it
  proof_document_url VARCHAR(500) NULL,
  status            ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by_admin_id BIGINT UNSIGNED NULL,
  reviewed_at       DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_claims_college (college_id),
  CONSTRAINT fk_claims_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Generic "update request" queue: college portal submits, admin approves/rejects,
-- and only on approval does the change get applied to the live (is_published) record.
CREATE TABLE update_requests (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id        BIGINT UNSIGNED NOT NULL,
  submitted_by_user_id BIGINT UNSIGNED NOT NULL,
  entity_type       ENUM('college','college_course','fee','admission','facility','gallery') NOT NULL,
  entity_id         BIGINT UNSIGNED NULL,      -- NULL when creating a brand-new record
  payload_json      JSON NOT NULL,             -- proposed field values
  status            ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note        VARCHAR(500) NULL,
  reviewed_by_admin_id BIGINT UNSIGNED NULL,
  reviewed_at       DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_update_requests_college (college_id),
  KEY idx_update_requests_status (status),
  CONSTRAINT fk_ur_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_user FOREIGN KEY (submitted_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE verification_records (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type    ENUM('college','college_course','fee','admission','facility') NOT NULL,
  entity_id      BIGINT UNSIGNED NOT NULL,
  verified_by_admin_id BIGINT UNSIGNED NOT NULL,
  previous_status VARCHAR(30) NULL,
  new_status     VARCHAR(30) NOT NULL,
  note           VARCHAR(500) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_verification_entity (entity_type, entity_id),
  CONSTRAINT fk_verification_admin FOREIGN KEY (verified_by_admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. AUDIT LOG
-- ----------------------------------------------------------

CREATE TABLE audit_logs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED NULL,
  action       VARCHAR(100) NOT NULL,   -- 'college.approve', 'review.reject', etc.
  entity_type  VARCHAR(60) NULL,
  entity_id    BIGINT UNSIGNED NULL,
  metadata_json JSON NULL,
  ip_address   VARCHAR(45) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_actor (actor_user_id),
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- Seed reference data (facilities + a couple of states) — not "demo college data"
-- ----------------------------------------------------------
INSERT INTO facilities (code, label) VALUES
 ('hostel','Hostel'), ('library','Library'), ('sports','Sports'), ('wifi','WiFi'),
 ('labs','Labs'), ('cafeteria','Cafeteria'), ('transport','Transport')
ON DUPLICATE KEY UPDATE label = VALUES(label);
