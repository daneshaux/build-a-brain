import { useEffect, useRef, useState } from "react";
import "./App.css";
import characterIntroAudio from "./assets/audio/character-intro.mp3";
import missionSetupAudio from "./assets/audio/mission-setup.mp3";
import AnalyzingScreen from "./components/AnalyzingScreen";
import type { BalanceMeterState } from "./components/BrainBalanceMeter";
import BrainCastIntroScreen from "./components/BrainCastIntroScreen";
import BrainMatchBridgeScreen from "./components/BrainMatchBridgeScreen";
import BuildBrain from "./components/BuildBrain";
import CharacterIntroScreen from "./components/CharacterIntroScreen";
import ChoicesSummaryScreen from "./components/ChoicesSummaryScreen";
import DiscussionScreen from "./components/DiscussionScreen";
import FinalCharacterScreen from "./components/FinalCharacterScreen";
import IntroScreen from "./components/IntroScreen";
import MatchBrainFunctions from "./components/MatchBrainFunctions";
import NarratorBeforeRolesScreen from "./components/NarratorBeforeRolesScreen";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import ResultScreen from "./components/ResultScreen";
import RetryScreen from "./components/RetryScreen";
import ScenarioScreen from "./components/ScenarioScreen";
import SplashScreen from "./components/SplashScreen";
import SummaryScreen from "./components/SummaryScreen";
import { scenarios } from "./data/scenarios";
import type { BrainRole, RegulationState, RoleInfo, Screen } from "./types/game";
import { playUiSound } from "./utils/sound";

const METER_COMMIT_DELAY_MS = 560;
type BuddyIntroStage = "missionSetup" | "characterIntro";

const emptyAnswers: Record<BrainRole, string | null> = {
  amygdala: null,
  prefrontalCortex: null,
  hippocampus: null,
};

function deriveMeterStateFromEffects(
  effects: RegulationState[],
  fallbackState: BalanceMeterState,
): BalanceMeterState {
  if (effects.length === 0) {
    return fallbackState;
  }

  const balancedCount = effects.filter((effect) => effect === "balanced").length;
  if (balancedCount === 0) {
    return "dysregulated";
  }
  if (balancedCount === effects.length) {
    return "balanced";
  }
  return "partial";
}

function App() {
  const [screen, setScreen] = useState<Screen>("missionSetup");
  const [hasDismissedSplash, setHasDismissedSplash] = useState(false);
  const [buddyIntroStage, setBuddyIntroStage] = useState<BuddyIntroStage>("missionSetup");
  const [selectedRoles, setSelectedRoles] = useState<BrainRole[]>([]);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [hasRetried, setHasRetried] = useState(false);
  const [hasShownScenarioIntroOverlay, setHasShownScenarioIntroOverlay] = useState(false);
  const [isAdvancingScenario, setIsAdvancingScenario] = useState(false);
  const [baselineMeterState, setBaselineMeterState] = useState<BalanceMeterState>("partial");
  const [committedMeterAnswers, setCommittedMeterAnswers] = useState<Record<BrainRole, string | null>>({
    ...emptyAnswers,
  });
  const advanceTimerRef = useRef<number | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<BrainRole, string | null>>({ ...emptyAnswers });

  const roles: RoleInfo[] = [
    {
      id: "amygdala",
      name: "Amygdala",
      description: "Handles emotions & quick reactions",
    },
    {
      id: "prefrontalCortex",
      name: "Prefrontal Cortex",
      description: "Thinking, planning & control",
    },
    {
      id: "hippocampus",
      name: "Hippocampus",
      description: "Memory & past experience",
    },
  ];

  const scenario = scenarios[0];

  const handleSelectRole = (role: BrainRole) => {
    if (selectedRoles.includes(role)) return;
    setSelectedRoles((prev) => [...prev, role]);
  };

  const handleStartGame = () => {
    setScreen("scenario");
  };

  const handleSelectAnswer = (role: BrainRole, choiceId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [role]: choiceId,
    }));
  };

  const handleNextRole = (role: BrainRole) => {
    if (isAdvancingScenario) {
      return;
    }

    const selectedChoiceId = selectedAnswers[role];
    if (!selectedChoiceId) {
      return;
    }

    setCommittedMeterAnswers((prev) => ({
      ...prev,
      [role]: selectedChoiceId,
    }));

    setIsAdvancingScenario(true);

    advanceTimerRef.current = window.setTimeout(() => {
      if (currentRoleIndex < scenario.roleChoices.length - 1) {
        setCurrentRoleIndex((prev) => prev + 1);
      } else {
        setScreen("analyzing");
      }
      setIsAdvancingScenario(false);
      advanceTimerRef.current = null;
    }, METER_COMMIT_DELAY_MS);
  };

  const selectedEffects = scenario.roleChoices
    .map((roleGroup) => {
      const selectedChoiceId = selectedAnswers[roleGroup.role];
      if (!selectedChoiceId) {
        return null;
      }

      const matchedChoice = roleGroup.choices.find((choice) => choice.id === selectedChoiceId);
      return matchedChoice?.effect ?? null;
    })
    .filter((effect): effect is RegulationState => effect !== null);

  const committedMeterEffects = scenario.roleChoices
    .map((roleGroup) => {
      const selectedChoiceId = committedMeterAnswers[roleGroup.role];
      if (!selectedChoiceId) {
        return null;
      }

      const matchedChoice = roleGroup.choices.find((choice) => choice.id === selectedChoiceId);
      return matchedChoice?.effect ?? null;
    })
    .filter((effect): effect is RegulationState => effect !== null);

  const balancedCount = selectedEffects.filter((effect) => effect === "balanced").length;
  const regulationMeterState = deriveMeterStateFromEffects(committedMeterEffects, baselineMeterState);
  const resultState: RegulationState = balancedCount >= 2 ? "balanced" : "dysregulated";
  const canRetry = resultState === "dysregulated" && !hasRetried;
  const attemptCount = hasRetried ? 2 : 1;
  const flipCount = hasRetried ? (resultState === "balanced" ? 1 : 2) : 0;

  useEffect(() => {
    if (screen !== "result") {
      return;
    }

    const timerId = window.setTimeout(() => {
      setScreen(canRetry ? "retry" : "discussion");
    }, 5000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [screen, canRetry]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement) || button.disabled) {
        return;
      }

      playUiSound("click");
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  return (
    <div className="global-game-background">
      <div className="role-selection-blob role-selection-blob--one global-game-background__blob global-game-background__blob--one" aria-hidden="true" />
      <div className="role-selection-blob role-selection-blob--two global-game-background__blob global-game-background__blob--two" aria-hidden="true" />
      <div className="role-selection-blob role-selection-blob--three global-game-background__blob global-game-background__blob--three" aria-hidden="true" />
      <div className="role-selection-blob role-selection-blob--four global-game-background__blob global-game-background__blob--four" aria-hidden="true" />

      <div className="global-game-background__content">
        {!hasDismissedSplash && screen === "missionSetup" && (
          <SplashScreen onComplete={() => setHasDismissedSplash(true)} />
        )}

        {hasDismissedSplash && screen === "missionSetup" && (
          <CharacterIntroScreen
            audioSrc={missionSetupAudio}
            headingText="Meet your brain buddy"
            ctaLabel="Start Mission"
            onContinue={() => setScreen("intro")}
          />
        )}

        {screen === "intro" && (
          <IntroScreen
            onStart={() => {
              setBuddyIntroStage("characterIntro");
              setScreen("characterIntro");
            }}
          />
        )}

        {screen === "characterIntro" && (
          <CharacterIntroScreen
            audioSrc={buddyIntroStage === "missionSetup" ? missionSetupAudio : characterIntroAudio}
            headingText={buddyIntroStage === "missionSetup" ? "Meet your brain buddy" : "Nice work! Let's meet the team"}
            ctaLabel={buddyIntroStage === "missionSetup" ? "Start Mission" : "Meet the Brain Team"}
            onContinue={() => setScreen("brainCastIntro")}
          />
        )}

        {screen === "brainCastIntro" && (
          <BrainCastIntroScreen onComplete={() => setScreen("buildBrain")} />
        )}

        {screen === "buildBrain" && (
          <BuildBrain onComplete={() => setScreen("brainMatchBridge")} />
        )}

        {screen === "brainMatchBridge" && (
          <BrainMatchBridgeScreen onComplete={() => setScreen("matchBrain")} />
        )}

        {screen === "matchBrain" && (
          <MatchBrainFunctions onComplete={() => setScreen("beforeRolesNarrator")} />
        )}

        {screen === "beforeRolesNarrator" && (
          <NarratorBeforeRolesScreen onContinue={() => setScreen("roles")} />
        )}

        {screen === "roles" && (
          <RoleSelectionScreen
            roles={roles}
            selectedRoles={selectedRoles}
            onSelectRole={handleSelectRole}
            onContinue={handleStartGame}
          />
        )}

        {screen === "scenario" && (
          <ScenarioScreen
            scenario={scenario}
            showIntroOverlay={!hasShownScenarioIntroOverlay}
            currentRoleIndex={currentRoleIndex}
            selectedAnswers={selectedAnswers}
            regulationMeterState={regulationMeterState}
            isAdvancing={isAdvancingScenario}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNextRole}
            onIntroOverlayDismiss={() => setHasShownScenarioIntroOverlay(true)}
          />
        )}

        {screen === "analyzing" && (
          <AnalyzingScreen onComplete={() => setScreen("result")} />
        )}

        {screen === "result" && (
          <ResultScreen result={resultState} />
        )}

        {screen === "retry" && (
          <RetryScreen
            onRetry={() => {
              setHasRetried(true);
              setCurrentRoleIndex(0);
              setBaselineMeterState("dysregulated");
              setCommittedMeterAnswers({ ...emptyAnswers });
              setScreen("scenario");
            }}
          />
        )}

        {screen === "discussion" && (
          <DiscussionScreen
            result={resultState}
            onContinue={() => setScreen("finalCharacter")}
            onViewChoices={() => setScreen("choicesReview")}
          />
        )}

        {screen === "choicesReview" && (
          <ChoicesSummaryScreen
            scenario={scenario}
            selectedAnswers={selectedAnswers}
            onBack={() => setScreen("discussion")}
            onContinue={() => setScreen("finalCharacter")}
          />
        )}

        {screen === "finalCharacter" && (
          <FinalCharacterScreen result={resultState} onContinue={() => setScreen("summary")} />
        )}

        {screen === "summary" && (
          <SummaryScreen
            result={resultState}
            attempts={attemptCount}
            flips={flipCount}
            onPlayAgain={() => {
              setScreen("missionSetup");
              setBuddyIntroStage("missionSetup");
              setHasDismissedSplash(false);
              setSelectedRoles([]);
              setCurrentRoleIndex(0);
              setHasRetried(false);
              setHasShownScenarioIntroOverlay(false);
              setIsAdvancingScenario(false);
              setBaselineMeterState("partial");
              setSelectedAnswers({ ...emptyAnswers });
              setCommittedMeterAnswers({ ...emptyAnswers });
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
