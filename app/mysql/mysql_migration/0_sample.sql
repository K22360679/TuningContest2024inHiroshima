-- このファイルに記述されたSQLコマンドが、マイグレーション時に実行されます。
- このファイルに記述されたSQLコマンドが、マイグレーション時に実行されます。
CREATE UNIQUE INDEX user ON user (user_id, mail, password, office_id, user_icon_id);
CREATE UNIQUE INDEX department_role ON department_role_member (department_id, role_id, user_id);
CREATE UNIQUE INDEX department ON department(department_id);
CREATE UNIQUE INDEX role ON role(role_id);
CREATE UNIQUE INDEX skill ON skill(skill_id);
CREATE UNIQUE INDEX skill_member ON skill_member(user_id, skill_id);
CREATE UNIQUE INDEX office ON role(office_id);