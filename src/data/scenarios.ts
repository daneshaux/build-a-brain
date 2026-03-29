import type { Scenario } from "../types/game";

export const scenarios: Scenario[] = [
  {
    id: "presentation",
    title: "Class Presentation",
    prompt:
      "I’m about to give a presentation in class. As I walk to the front of the room, I notice some classmates whispering and laughing. My heart starts beating faster. What should I do?",
    roleChoices: [
      {
        role: "amygdala",
        choices: [
          {
            id: "a1",
            text: "This feels intense... something might be wrong",
            effect: "balanced",
          },
          {
            id: "a2",
            text: "Let me slow down and think about what to do next",
            effect: "dysregulated",
          },
          {
            id: "a3",
            text: "I practiced this before... I think I remember what to do",
            effect: "dysregulated",
          },
        ],
      },
      {
        role: "prefrontalCortex",
        choices: [
          {
            id: "p1",
            text: "Let me slow down and think through what I should do next",
            effect: "balanced",
          },
          {
            id: "p2",
            text: "My body feels tense... this is really overwhelming",
            effect: "dysregulated",
          },
          {
            id: "p3",
            text: "I remember practicing this last night at home",
            effect: "dysregulated",
          },
        ],
      },
      {
        role: "hippocampus",
        choices: [
          {
            id: "h1",
            text: "I practiced this before... I think I remember what to do",
            effect: "balanced",
          },
          {
            id: "h2",
            text: "My heart is racing... something must be wrong",
            effect: "dysregulated",
          },
          {
            id: "h3",
            text: "Focus on the next step and stick to the plan",
            effect: "dysregulated",
          },
        ],
      },
    ],
  },
];
