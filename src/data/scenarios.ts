import type { Scenario } from "../types/game";

export const scenarios: Scenario[] = [
  {
    id: "presentation",
    title: "Class Presentation",
    prompt:
      "You’re about to give a presentation in class. As you walk to the front of the room, you notice some classmates whispering and laughing. Your heart starts beating faster.",
    roleChoices: [
      {
        role: "amygdala",
        choices: [
          {
            id: "a1",
            text: "They’re laughing at me! This is going to be embarrassing.",
            effect: "dysregulated",
          },
          {
            id: "a2",
            text: "This feels scary. I want to stop and sit down.",
            effect: "dysregulated",
          },
          {
            id: "a3",
            text: "Something feels intense right now — my body is reacting.",
            effect: "balanced",
          },
        ],
      },
      {
        role: "prefrontalCortex",
        choices: [
          {
            id: "p1",
            text: "Take a deep breath and focus on the first sentence.",
            effect: "balanced",
          },
          {
            id: "p2",
            text: "Forget it. Just rush through it as fast as possible.",
            effect: "dysregulated",
          },
          {
            id: "p3",
            text: "Make eye contact with a friend and follow your outline.",
            effect: "balanced",
          },
        ],
      },
      {
        role: "hippocampus",
        choices: [
          {
            id: "h1",
            text: "I practiced this yesterday and it went well.",
            effect: "balanced",
          },
          {
            id: "h2",
            text: "Last time I messed up, so this will probably go badly.",
            effect: "dysregulated",
          },
          {
            id: "h3",
            text: "I’ve presented before and survived.",
            effect: "balanced",
          },
        ],
      },
    ],
  },
];