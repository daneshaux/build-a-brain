export type BrainRole = "amygdala" | "prefrontalCortex" | "hippocampus";

export type RegulationState = "balanced" | "dysregulated";

export type Screen =
  | "intro"
  | "roles"
  | "scenario"
  | "analyzing"
  | "result"
  | "reflection"
  | "discussion"
  | "summary";

export interface RoleInfo {
  id: BrainRole;
  name: string;
  description: string;
}

export interface Choice {
  id: string;
  text: string;
  effect: "balanced" | "dysregulated";
}

export interface RoleChoices {
  role: BrainRole;
  choices: Choice[];
}

export interface Scenario {
  id: string;
  title: string;
  prompt: string;
  roleChoices: RoleChoices[];
}
