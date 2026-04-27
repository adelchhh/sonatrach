-- ============================================================
--  DATABASE - Sonatrach Socio Activities Platform
--  VERSION 4.1 - WORKFLOW FINAL ALIGNE
-- ============================================================

DROP DATABASE IF EXISTS sonatrach_lottery;
CREATE DATABASE sonatrach_lottery
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sonatrach_lottery;

-- [1] users
CREATE TABLE users (
    id                      INT NOT NULL AUTO_INCREMENT,
    name                     VARCHAR(100) NOT NULL,
    first_name                  VARCHAR(100) NOT NULL,
    email                   VARCHAR(191) NOT NULL UNIQUE,
    employee_number               VARCHAR(50) NOT NULL UNIQUE,
    social_security_number     VARCHAR(50) UNIQUE,
    password            VARCHAR(255) NOT NULL,
    address                 VARCHAR(255),
    active                   BOOLEAN NOT NULL DEFAULT TRUE,
    hire_date           DATE NULL,
    account_created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at              DATETIME NULL,
    PRIMARY KEY (id),
    INDEX idx_email (email),
    INDEX idx_matricule (employee_number),
    INDEX idx_actif (active)
) ENGINE=InnoDB;

-- [1.b] roles
CREATE TABLE roles (
    id          INT NOT NULL AUTO_INCREMENT,
    name         ENUM('EMPLOYEE','FUNCTIONAL_ADMIN','COMMUNICATOR','SYSTEM_ADMIN') NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- [1.c] user_roles
CREATE TABLE user_roles (
    user_id  INT NOT NULL,
    role_id         INT NOT NULL,
    assigned_by    INT NULL,
    assigned_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ur_attribue_par FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_ur_role (role_id)
) ENGINE=InnoDB;

-- [2] activities
CREATE TABLE activities (
    id                              INT NOT NULL AUTO_INCREMENT,
    title                           VARCHAR(200) NOT NULL,
    description                     TEXT,
    category                       ENUM('SPORT','FAMILY','STAY','NATURE','SPIRITUAL','TRAVEL','LEISURE') NOT NULL DEFAULT 'LEISURE',
    minimum_seniority             INT NOT NULL DEFAULT 1,
    draw_enabled                          BOOLEAN NOT NULL DEFAULT TRUE,
    demand_level                  ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
    status                          ENUM('DRAFT','PUBLISHED','ARCHIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    image_url                       VARCHAR(500) NULL,
    deleted_at                      DATETIME NULL,
    created_at                      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_statut (status),
    INDEX idx_categorie (category)
) ENGINE=InnoDB;

-- [3] required_documents
CREATE TABLE required_documents (
    id              INT NOT NULL AUTO_INCREMENT,
    activity_id     INT NOT NULL,
    document_type   VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    required     BOOLEAN NOT NULL DEFAULT TRUE,
    template_url    VARCHAR(500),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_docreq_activite FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_docreq_activite (activity_id)
) ENGINE=InnoDB;

-- [4] sites
CREATE TABLE sites (
    id              INT NOT NULL AUTO_INCREMENT,
    name             VARCHAR(200) NOT NULL UNIQUE,
    address         VARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- [5] activity_sessions
CREATE TABLE activity_sessions (
    id              INT NOT NULL AUTO_INCREMENT,
    activity_id     INT NOT NULL,
    start_date                  DATE NOT NULL,
    end_date                    DATE NOT NULL,
    registration_deadline        DATE NOT NULL,
    draw_date                 DATE NULL,
    draw_location                 VARCHAR(200) NULL,
    confirmation_delay_hours          INT NOT NULL DEFAULT 48,
    document_upload_deadline     DATE NULL,
    transport_included    BOOLEAN NOT NULL DEFAULT FALSE,
    telefax_url                 VARCHAR(500) NULL,
    substitutes_count               INT NOT NULL DEFAULT 2,
    status                      ENUM('DRAFT','OPEN','CLOSED','DRAW_DONE','FINISHED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_session_activite FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_session_activite (activity_id),
    INDEX idx_session_dates (start_date, end_date),
    INDEX idx_session_fin_inscription (registration_deadline),
    INDEX idx_session_statut (status)
) ENGINE=InnoDB;

-- [6] session_sites
CREATE TABLE session_sites (
    id              INT NOT NULL AUTO_INCREMENT,
    session_id      INT NOT NULL,
    site_id         INT NOT NULL,
    quota           INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_session_site (session_id, site_id),
    CONSTRAINT fk_ss_session FOREIGN KEY (session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ss_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ss_session (session_id),
    INDEX idx_ss_site (site_id)
) ENGINE=InnoDB;

-- [7] registrations
CREATE TABLE registrations (
    id                  INT NOT NULL AUTO_INCREMENT,
    user_id      INT NOT NULL,
    session_id          INT NOT NULL,
    registered_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status              ENUM('PENDING','VALIDATED','REJECTED','SELECTED','WAITING_LIST','CONFIRMED','WITHDRAWN','CANCELLED') NOT NULL DEFAULT 'PENDING',
    is_eligible        BOOLEAN NOT NULL DEFAULT TRUE,
    rejection_reason         VARCHAR(255) NULL,
    confirmed_at   DATETIME NULL,
    withdrawn_at        DATETIME NULL,
    withdrawal_reason       VARCHAR(255) NULL,
    reference_number              VARCHAR(50) UNIQUE,
    deleted_at          DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_inscription (user_id, session_id),
    CONSTRAINT fk_insc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_insc_session FOREIGN KEY (session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_insc_utilisateur (user_id),
    INDEX idx_insc_session (session_id),
    INDEX idx_insc_statut (status),
    INDEX idx_insc_eligible (is_eligible)
) ENGINE=InnoDB;

-- [8] registration_status_history
CREATE TABLE registration_status_history (
    id              INT NOT NULL AUTO_INCREMENT,
    registration_id  INT NOT NULL,
    old_status   ENUM('PENDING','VALIDATED','REJECTED','SELECTED','WAITING_LIST','CONFIRMED','WITHDRAWN','CANCELLED') NULL,
    new_status  ENUM('PENDING','VALIDATED','REJECTED','SELECTED','WAITING_LIST','CONFIRMED','WITHDRAWN','CANCELLED') NOT NULL,
    reason          VARCHAR(255),
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_hist_inscription FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_hist_inscription (registration_id)
) ENGINE=InnoDB;

-- [9] site_choices
CREATE TABLE site_choices (
    id                  INT NOT NULL AUTO_INCREMENT,
    registration_id      INT NOT NULL,
    session_site_id     INT NOT NULL,
    choice_order         TINYINT NOT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_choix_ordre (registration_id, choice_order),
    UNIQUE KEY uq_choix_session_site (registration_id, session_site_id),
    CONSTRAINT fk_cs_inscription FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cs_session_site FOREIGN KEY (session_site_id) REFERENCES session_sites(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cs_session_site (session_site_id)
) ENGINE=InnoDB;

-- [10] draws
CREATE TABLE draws (
    draw_id       INT NOT NULL AUTO_INCREMENT,
    session_id      INT NOT NULL,
    admin_id        INT NOT NULL,
    draw_date     DATETIME NOT NULL,
    draw_location     VARCHAR(200),
    mode            ENUM('BY_SITE','GLOBAL') NOT NULL DEFAULT 'GLOBAL',
    executed        BOOLEAN NOT NULL DEFAULT FALSE,
    executed_at  DATETIME NULL,
    PRIMARY KEY (draw_id),
    CONSTRAINT fk_tirage_session FOREIGN KEY (session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tirage_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_tirage_session (session_id),
    INDEX idx_tirage_effectue (executed)
) ENGINE=InnoDB;

-- [11] draw_results
CREATE TABLE draw_results (
    id              INT NOT NULL AUTO_INCREMENT,
    draw_id       INT NOT NULL,
    registration_id  INT NOT NULL,
    session_site_id INT NULL,
    result_rank INT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    is_substitute   BOOLEAN NOT NULL DEFAULT FALSE,
    substitute_rank  INT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_resultat (draw_id, registration_id),
    CONSTRAINT fk_rt_tirage FOREIGN KEY (draw_id) REFERENCES draws(draw_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rt_inscription FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rt_session_site FOREIGN KEY (session_site_id) REFERENCES session_sites(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_rt_inscription (registration_id),
    INDEX idx_rt_selectionne (is_selected),
    INDEX idx_rt_suppleant (is_substitute, substitute_rank)
) ENGINE=InnoDB;

-- [12] substitute_replacements
CREATE TABLE substitute_replacements (
    id                      INT NOT NULL AUTO_INCREMENT,
    abandoned_result_id   INT NOT NULL,
    substitute_result_id   INT NOT NULL,
    abandon_reason          VARCHAR(255),
    replaced_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_remp_abandonne FOREIGN KEY (abandoned_result_id) REFERENCES draw_results(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_remp_suppleant FOREIGN KEY (substitute_result_id) REFERENCES draw_results(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- [13] documents
CREATE TABLE documents (
    document_id             INT NOT NULL AUTO_INCREMENT,
    registration_id          INT NOT NULL,
    required_document_id      INT NULL,
    file_name             VARCHAR(255) NOT NULL,
    file_path          VARCHAR(500) NOT NULL,
    document_type           VARCHAR(100) NULL,
    uploaded_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status                  ENUM('UPLOADED','VALIDATED','REJECTED') NOT NULL DEFAULT 'UPLOADED',
    validation_comment  VARCHAR(255) NULL,
    validated_by              INT NULL,
    validated_at         DATETIME NULL,
    PRIMARY KEY (document_id),
    CONSTRAINT fk_doc_inscription FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_doc_requis FOREIGN KEY (required_document_id) REFERENCES required_documents(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_doc_valide_par FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_doc_inscription (registration_id),
    INDEX idx_doc_statut (status)
) ENGINE=InnoDB;

-- [14] withdrawal_requests
CREATE TABLE withdrawal_requests (
    id                  INT NOT NULL AUTO_INCREMENT,
    registration_id      INT NOT NULL,
    requested_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason               VARCHAR(255) NULL,
    status              ENUM('PENDING','APPROVED','REJECTED','PROCESSED') NOT NULL DEFAULT 'PENDING',
    processed_by          INT NULL,
    processed_at     DATETIME NULL,
    admin_comment   VARCHAR(255) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_desistement_inscription FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_desistement_traite_par FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_desistement_inscription (registration_id),
    INDEX idx_desistement_statut (status)
) ENGINE=InnoDB;

-- [15] participations
CREATE TABLE participations (
    id              INT NOT NULL AUTO_INCREMENT,
    user_id  INT NOT NULL,
    session_site_id INT NOT NULL,
    answer         TEXT NULL,
    rating            TINYINT NULL,
    date_p          DATE NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_participation (user_id, session_site_id),
    CONSTRAINT fk_part_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_part_ss FOREIGN KEY (session_site_id) REFERENCES session_sites(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_part_utilisateur (user_id)
) ENGINE=InnoDB;

-- [16] certificates
CREATE TABLE certificates (
    id               INT NOT NULL AUTO_INCREMENT,
    participation_id INT NOT NULL UNIQUE,
    file_path   VARCHAR(500) NOT NULL,
    generated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_cert_participation FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- [17] official_notes
CREATE TABLE official_notes (
    note_id          INT NOT NULL AUTO_INCREMENT,
    user_id   INT NOT NULL,
    title            VARCHAR(200) NOT NULL,
    content          TEXT NOT NULL,
    type             ENUM('OFFICIAL','GENERAL','REMINDER','EVENT','HEALTH','SOCIAL','SURVEY') NOT NULL DEFAULT 'GENERAL',
    audience         ENUM('ALL','EMPLOYEES','FUNCTIONAL_ADMIN','COMMUNICATOR','SYSTEM_ADMIN') NOT NULL DEFAULT 'ALL',
    attachment_url     VARCHAR(500) NULL,
    status           ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    published_at DATETIME NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id),
    CONSTRAINT fk_note_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_note_statut (status, published_at),
    INDEX idx_note_type (type)
) ENGINE=InnoDB;

-- [18] surveys
CREATE TABLE surveys (
    id           INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_id    INT NULL,
    title          VARCHAR(200),
    question       TEXT NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    required    BOOLEAN NOT NULL DEFAULT FALSE,
    audience       ENUM('ALL','EMPLOYEES','FUNCTIONAL_ADMIN','COMMUNICATOR','SYSTEM_ADMIN') NOT NULL DEFAULT 'ALL',
    status         ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_sondage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sondage_activite FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_sondage_dates (start_date, end_date)
) ENGINE=InnoDB;

-- [19] survey_responses
CREATE TABLE survey_responses (
    id             INT NOT NULL AUTO_INCREMENT,
    survey_id     INT NOT NULL,
    user_id INT NOT NULL,
    answer        TEXT NOT NULL,
    answered_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reponse (survey_id, user_id),
    CONSTRAINT fk_rep_sondage FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rep_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- [20] ideas
CREATE TABLE ideas (
    id              INT NOT NULL AUTO_INCREMENT,
    user_id  INT NOT NULL,
    content         TEXT NOT NULL,
    category       ENUM('ACTIVITIES','SERVICES','COMMUNICATION','WORKPLACE','WELLBEING') NOT NULL DEFAULT 'ACTIVITIES',
    status          ENUM('UNDER_REVIEW','ACCEPTED','ARCHIVED') NOT NULL DEFAULT 'UNDER_REVIEW',
    moderator_response VARCHAR(500) NULL,
    moderated_by      INT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    moderated_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_idee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_idee_moderateur FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_idee_statut (status),
    INDEX idx_idee_categorie (category)
) ENGINE=InnoDB;

-- [21] notifications
CREATE TABLE notifications (
    id             INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title          VARCHAR(200),
    message        TEXT NOT NULL,
    type           ENUM('DRAW','CONFIRMATION','DOCUMENT','SURVEY','GENERAL','WITHDRAWAL','REASSIGNMENT') NOT NULL DEFAULT 'GENERAL',
    is_read            BOOLEAN NOT NULL DEFAULT FALSE,
    activity_id    INT NULL,
    session_id     INT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notif_activite FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notif_session FOREIGN KEY (session_id) REFERENCES activity_sessions(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_lue (user_id, is_read),
    INDEX idx_notif_type (type)
) ENGINE=InnoDB;

-- [22] audit_logs
CREATE TABLE audit_logs (
    id             INT NOT NULL AUTO_INCREMENT,
    user_id INT NULL,
    action         VARCHAR(100) NOT NULL,
    target_table    VARCHAR(100),
    target_id       INT NULL,
    target_name      VARCHAR(200) NULL,
    details        JSON NULL,
    ip_address     VARCHAR(45),
    action_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (action_date)
) ENGINE=InnoDB;

-- ============================================================
-- INITIAL DATA
-- ============================================================

INSERT INTO roles (id, name, description) VALUES
    (1, 'EMPLOYEE', 'Employee access'),
    (2, 'FUNCTIONAL_ADMIN', 'Manage activities, sessions, registrations, draws, and reports'),
    (3, 'COMMUNICATOR', 'Manage announcements, surveys, ideas, and notifications'),
    (4, 'SYSTEM_ADMIN', 'Full system and role management');

INSERT INTO users (id, name, first_name, email, employee_number, social_security_number, password, address, active, hire_date) VALUES
    (4,'Admin','Systeme','admin.systeme@sonatrach.dz','002016','645765','ADMIN002016','Alger, Algerie',1,NULL),
    (5,'Admin','Fonctionnel','admin.fonctionnel@sonatrach.dz','002017','236384','ADMIN002017','Alger, Algerie',1,NULL),
    (6,'Fethallah','manel','fethallahmanell@gmail.com','000001','2791111620938','QX9U109018103','Rue sacre coeur',1,NULL),
    (7,'Bougouba','Lyna','lyna.bougouba.pro@gmail.com','000002','2760926459884','motdepasse','Birkhadem',1,NULL),
    (8,'Djemai','Mohamed abdelhadi','djemaiabdallhadi@gmail.com','000003','2790237114811','jUberCU3OndP','Alger',1,NULL),
    (9,'Krim','Mouna','Krim.mouna08@gmail.com','000004','1740144350999','bM7dKXPU77lY','Birtouta',1,NULL),
    (10,'Rouchiche','Lydia','rouchichelydia.sb@gmail.com','000005','2770530864723','OxGmQvkAYbCP','Birtouta cite 766 logement AADL Bt C1',1,NULL),
    (11,'Douali','Anais lina','doualilina@gmail.com','000006','1901096113461','524WdidnRLkn','Ain aadja 720 batiment sept tour sept',1,NULL),
    (12,'Bensaidi','Khaoula','khaoulabnsd01@gmail.com','000007','2830220985288','EaXVqzf0fgDL','Khraicia',1,NULL),
    (13,'Boumbar','Dalel','Dalel.boumbar@gmail.com','000008','1920387298684','5x4T80oJxxN9','Birtouta',1,NULL),
    (14,'BENTALEB','Lisa','lisabentaleb21@gmail.com','000009','1700125243811','TkVaahszhYiu','Bordj El Kiffan, Alger',1,NULL),
    (15,'FOUDI','Yasmine','yvnmon@gmail.com','000010','1791299171697','Ztiak7v55DLL','Cooperative El Kawtar Alger-birtouta',1,NULL),
    (16,'Zemzoum','Kahina','kahina.zemzoum@gmail.com','000011','2861051773982','nV6PzalMGLPg','1er mai',1,NULL),
    (17,'Hammache','Lynda','fethallahlynda@yahoo.fr','000012','1951175844428','3lymhY0FciUd','Rue sacre coeur Alger centre',1,NULL),
    (18,'Arab','Racha','arabracha38@gmail.com','000013','2980660414773','ZYho69QtegXn','Boumerdes',1,NULL),
    (19,'Hadjali','Malak','malak.hadjali925@gmail.com','000014','1730422074430','hyFsLOxqYnIS','Mohamadia - alger',1,NULL),
    (20,'Boubekri','Ilissa','boubekriilissa@gmail.com','000015','1950780159677','JbGFGgUJNsn2','Alger',1,NULL),
    (21,'Hadjali','Abdel malek','hadjaliabdou062@gmail.com','000016','2700545977369','Hhl8H4IAKixm','Alger - alger',1,NULL),
    (22,'Khalil','Abdel','hadjaliabdouu@gmail.com','000017','1880135501342','hKHAf1f0xMEF','Draria - alger',1,NULL),
    (23,'Hebbadj','Imene','imenehebbadj4@gmail.com','000018','2910289171623','rdXwUvGkl72s','Birtouta-Alger',1,NULL),
    (24,'Benazouaou','Rabah cherif','chrifbenazouaou@gmail.com','000019','2811216804824','vdJczyDbj8LQ','rue ali bouhadja birtouta , alger',1,NULL),
    (25,'Boudraa','Yacine','p44257647@gmail.com','000020','2880650494239','i4IrOVVAsK4T','Alger centre - alger',1,NULL);

INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
    (4,1,NULL),(4,2,NULL),(4,3,NULL),(4,4,NULL),
    (5,1,4),(5,2,4),
    (6,1,4),(6,2,4),
    (7,1,4),(8,1,4),
    (9,1,4),(9,2,4),(9,3,4),(9,4,4),
    (10,1,4),(11,1,4),(12,1,4),(13,1,4),(14,1,4),(15,1,4),
    (16,1,4),(17,1,4),(18,1,4),(19,1,4),(20,1,4),(21,1,4),
    (22,1,4),(23,1,4),(24,1,4),(25,1,4);

INSERT INTO activities (id, title, description, category, minimum_seniority, draw_enabled, demand_level, status) VALUES
    (2,'Cross','Un grand rendez-vous sportif et convivial.','SPORT',1,0,'HIGH','PUBLISHED'),
    (3,'Colonie de vacances','Une aventure inoubliable pour les enfants.','FAMILY',1,1,'HIGH','PUBLISHED'),
    (4,'Bangalo','Une escapade detente en bungalow.','STAY',1,1,'MEDIUM','DRAFT'),
    (5,'Camp de toile','Un sejour nature authentique.','NATURE',1,1,'MEDIUM','PUBLISHED'),
    (6,'Cure thermale','Une parenthese bien-etre.','LEISURE',1,1,'MEDIUM','CANCELLED'),
    (7,'Omra','Un voyage spirituel profond.','SPIRITUAL',1,1,'HIGH','ARCHIVED'),
    (8,'Voyages organises','Des voyages riches en decouvertes.','TRAVEL',1,1,'MEDIUM','PUBLISHED'),
    (9,'Sortie aeree','Une journee d evasion en plein air.','NATURE',1,1,'MEDIUM','ARCHIVED');

INSERT INTO sites (id, name, address) VALUES
    (1,'Site A','Alger'),
    (2,'Site B','Oran'),
    (3,'Site C','Constantine');
