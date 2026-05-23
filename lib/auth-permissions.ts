import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const appStatements = {
  ...defaultStatements,
  dashboard: ["view"],
  room: ["view", "book", "manage"],
  cctv: ["view", "run"],
  log: ["view", "export"],
  settings: ["view", "change-password"],
  adminPanel: ["view"],
} as const;

export const ac = createAccessControl(appStatements);

export const studentRole = ac.newRole({
  dashboard: ["view"],
  room: ["view"],
  settings: ["view", "change-password"],
});

export const lecturerRole = ac.newRole({
  dashboard: ["view"],
  room: ["view", "book", "manage"],
  cctv: ["view", "run"],
  log: ["view"],
  settings: ["view", "change-password"],
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
  dashboard: ["view"],
  room: ["view", "book", "manage"],
  cctv: ["view", "run"],
  log: ["view", "export"],
  settings: ["view", "change-password"],
  adminPanel: ["view"],
});

export type AppRole = "student" | "lecturer" | "admin";

export const appRoles = {
  student: studentRole,
  lecturer: lecturerRole,
  admin: adminRole,
} as const;

export const roleOptions: AppRole[] = ["student", "lecturer", "admin"];