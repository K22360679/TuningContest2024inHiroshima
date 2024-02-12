-- このファイルに記述されたSQLコマンドが、マイグレーション時に実行されます。
CREATE UNIQUE INDEX login ON user (mail, password);
CREATE UNIQUE INDEX department ON department(department_id);
CREATE UNIQUE INDEX role ON role(role_id);
