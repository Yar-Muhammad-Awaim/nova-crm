export type Role = "ADMIN" | "MANAGER" | "AGENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization: string | null;
  skills: string[];
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assignee_id: string;
  deadline: string;
  estimated_hours: number;
  assignee?: Pick<User, "id" | "name" | "specialization">;
  project?: Pick<Project, "id" | "name" | "client_name">;
};

export type Project = {
  id: string;
  name: string;
  client_name: string;
  description: string | null;
  manager_id: string;
  deadline: string;
  created_at: string;
  manager?: Pick<User, "id" | "name">;
  tasks?: Task[];
};

export type Session = { userId: string; role: Role; name: string };
