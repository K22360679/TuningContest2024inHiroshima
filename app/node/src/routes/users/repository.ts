import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { SearchedUser, User, UserForFilter } from "../../model/types";
import {
  convertToSearchedUser,
  convertToUserForFilter,
  convertToUsers,
} from "../../model/utils";

export const getUserIdByMailAndPassword = async (
  mail: string,
  hashPassword: string
): Promise<string | undefined> => {
  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM user WHERE mail = ? AND password = ?",
    [mail, hashPassword]
  );
  if (user.length === 0) {
    return;
  }

  return user[0].user_id;
};

// User全員をUser[]型で返す
export const getUsers = async (
  limit: number,
  offset: number
): Promise<User[]> => {
  const query =
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    ORDER BY entry_date ASC, kana ASC LIMIT ? OFFSET ? \
    ";

  const [userRows] = await pool.query<RowDataPacket[]>(query, [limit, offset]);

  return convertToUsers(userRows);
};

// IDで検索する．一人だけ！！
export const getUserByUserId = async (
  userId: string
): Promise<User | undefined> => {
  const [users] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    WHERE user_id = ?",
    [userId]
  );
  if (users.length === 0) {
    return;
  }

  const user = users[0];

  return {
    userId: user.user_id,
    userName: user.user_name,
    userIcon: {
      fileId: user.user_icon_id,
      fileName: user.file_name,
    },
    officeName: user.office_name,
  };
};

// 複数のIDでユーザーを検索する．
export const getUsersByUserIds = async (
  userIds: string[]
): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  let query: string =
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    WHERE ";
  userIds.forEach((id) => {
    query += "user.user_id= " + id.toString() + " OR ";
  });
  query += "0";
  const [rows] = await pool.query<RowDataPacket[]>(query, []);

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersByUserName = async (
  userName: string
): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    WHERE user_name LIKE ?",
    [`%${userName}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersByKana = async (kana: string): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    WHERE user.kana LIKE ?",
    [`%${kana}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersByMail = async (mail: string): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    WHERE user.mail LIKE ?",
    [`%${mail}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersByDepartmentName = async (
  departmentName: string
): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    INNER JOIN department_role_member ON user.user_id=department_role_member.user_id \
    INNER JOIN department ON department_role_member.department_id=department.department_id \
    WHERE department.department_name LIKE ? AND department_role_member.belong=true",
    [`%${departmentName}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersByRoleName = async (
  roleName: string
): Promise<SearchedUser[]> => {
  // const [roleIdRows] = await pool.query<RowDataPacket[]>(
  //   `SELECT role_id FROM role WHERE role_name LIKE ? AND active = true`,
  //   [`%${roleName}%`]
  // );
  // const roleIds: string[] = roleIdRows.map((row) => row.role_id);
  // if (roleIds.length === 0) {
  //   return [];
  // }

  // const [userIdRows] = await pool.query<RowDataPacket[]>(
  //   `SELECT user_id FROM department_role_member WHERE role_id IN (?) AND belong = true`,
  //   [roleIds]
  // );
  // const userIds: string[] = userIdRows.map((row) => row.user_id);
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    INNER JOIN department_role_member ON user.user_id=department_role_member.user_id \
    INNER JOIN role ON department_role_member.role_id=role.role_id \
    WHERE department.department_name LIKE ? \
    AND role.active=true \
    AND department_role_member.belong=true",
    [`%${roleName}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
  // return getUsersByUserIds(userIds);
};

export const getUsersByOfficeName = async (
  officeName: string
): Promise<SearchedUser[]> => {
  // const [officeIdRows] = await pool.query<RowDataPacket[]>(
  //   `SELECT office_id FROM office WHERE office_name LIKE ?`,
  //   [`%${officeName}%`]
  // );
  // const officeIds: string[] = officeIdRows.map((row) => row.office_id);
  // if (officeIds.length === 0) {
  //   return [];
  // }

  // const [userIdRows] = await pool.query<RowDataPacket[]>(
  //   `SELECT user_id FROM user WHERE office_id IN (?)`,
  //   [officeIds]
  // );
  // const userIds: string[] = userIdRows.map((row) => row.user_id);

  // return getUsersByUserIds(userIds);
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    INNER JOIN office ON user.office_id=office.office_id \
    WHERE office.office_Name LIKE ?",
    [`%${officeName}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersBySkillName = async (
  skillName: string
): Promise<SearchedUser[]> => {
  // const [skillIdRows] = await pool.query<RowDataPacket[]>(
  //   `SELECT skill_id FROM skill WHERE skill_name LIKE ?`,
  //   [`%${skillName}%`]
  // );
  // const skillIds: string[] = skillIdRows.map((row) => row.skill_id);
  // if (skillIds.length === 0) {
  //   return [];
  // }

  // const [userIdRows] = await pool.query<RowDataPacket[]>(
  //   `SELECT user_id FROM skill_member WHERE skill_id IN (?)`,
  //   [skillIds]
  // );
  // const userIds: string[] = userIdRows.map((row) => row.user_id);

  // return getUsersByUserIds(userIds);
  let users: SearchedUser[] = [];
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
    FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
    INNER JOIN skill_member ON user.user_id=skill_member.user_id \
    INNER JOIN skill ON skill_member.skill_id=skill.skill_id \
    WHERE skill.skill_name LIKE ? ",
    [`%${skillName}%`]
  );

  users = users.concat(convertToSearchedUser(rows));
  return users;
};

export const getUsersByGoal = async (goal: string): Promise<SearchedUser[]> => {
//   const [rows] = await pool.query<RowDataPacket[]>(
//     `SELECT user_id FROM user WHERE goal LIKE ?`,
//     [`%${goal}%`]
//   );
//   const userIds: string[] = rows.map((row) => row.user_id);

//   return getUsersByUserIds(userIds);
// };
let users: SearchedUser[] = [];
const [rows] = await pool.query<RowDataPacket[]>(
  "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, office.office_name, file.file_name \
  FROM user INNER JOIN office ON user.office_id=office.office_id INNER JOIN file ON user.user_icon_id=file.file_id \
  WHERE user.goal LIKE ? ",
  [`%${goal}%`]
);

users = users.concat(convertToSearchedUser(rows));
return users;
};  

export const getUserForFilter = async (
  userId?: string
): Promise<UserForFilter> => {
  let userRows: RowDataPacket[];
  if (!userId) {
    [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, user_name, office_id, user_icon_id FROM user ORDER BY RAND() LIMIT 1"
    );
  } else {
    [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, user_name, office_id, user_icon_id FROM user WHERE user_id = ?",
      [userId]
    );
  }
  const user = userRows[0];

  const [officeNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT office_name FROM office WHERE office_id = ?`,
    [user.office_id]
  );
  const [fileNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT file_name FROM file WHERE file_id = ?`,
    [user.user_icon_id]
  );
  const [departmentNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT department_name FROM department WHERE department_id = (SELECT department_id FROM department_role_member WHERE user_id = ? AND belong = true)`,
    [user.user_id]
  );
  const [skillNameRows] = await pool.query<RowDataPacket[]>(
    `SELECT skill_name FROM skill WHERE skill_id IN (SELECT skill_id FROM skill_member WHERE user_id = ?)`,
    [user.user_id]
  );

  user.office_name = officeNameRow[0].office_name;
  user.file_name = fileNameRow[0].file_name;
  user.department_name = departmentNameRow[0].department_name;
  user.skill_names = skillNameRows.map((row) => row.skill_name);

  return convertToUserForFilter(user);
};
