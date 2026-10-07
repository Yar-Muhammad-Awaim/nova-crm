export type Role = "ADMIN" | "MANAGER" | "AGENT";
export type TaskStatus = "todo" | "in_progress" | "done";

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
  status?: TaskStatus;
  board_position?: number;
  assignee?: Pick<User, "id" | "name" | "specialization">;
  project?: Pick<Project, "id" | "name" | "client_name">;
};

export type Project = {
  id: string;
  name: string;
  client_name: string;
  description: string | null;
  manager_id: string;
  team_id?: string | null;
  deadline: string;
  created_at: string;
  manager?: Pick<User, "id" | "name">;
  tasks?: Task[];
  team?: { id: string; name: string } | null;
};

export type Team = {
  id: string;
  name: string;
  description: string | null;
  manager_id: string;
  manager?: Pick<User, "id" | "name">;
  members: { user_id: string }[];
};

export type Session = { userId: string; role: Role; name: string };
