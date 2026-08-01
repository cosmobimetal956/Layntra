export const DEMO_STEPS = ["inspect", "plan", "apply", "undo"];

export function createDemoState() {
  return {
    stage: "inspect",
    selection: "Frame 12",
    target: "Frame 12",
    applied: false,
    blocked: false
  };
}

function applyPlan(state) {
  if (state.selection !== state.target) {
    return { ...state, blocked: true, applied: false };
  }

  return { ...state, stage: "apply", applied: true, blocked: false };
}

export function reduceDemoState(state, action) {
  switch (action.type) {
    case "NEXT":
      if (state.blocked) {
        return {
          ...state,
          stage: "inspect",
          target: state.selection,
          blocked: false,
          applied: false
        };
      }
      if (state.stage === "inspect") {
        return { ...state, stage: "plan", target: state.selection, blocked: false };
      }
      if (state.stage === "plan") {
        return applyPlan(state);
      }
      if (state.stage === "apply") {
        return { ...state, stage: "undo", applied: false, blocked: false };
      }
      return { ...state, stage: "inspect", target: state.selection, blocked: false };

    case "GO_TO":
      if (action.stage === "inspect") {
        return { ...state, stage: "inspect", target: state.selection, applied: false, blocked: false };
      }
      if (action.stage === "plan") {
        return { ...state, stage: "plan", target: state.selection, applied: false, blocked: false };
      }
      if (action.stage === "apply") {
        return state.stage === "plan" ? applyPlan(state) : state;
      }
      if (action.stage === "undo") {
        return state.applied ? { ...state, stage: "undo", applied: false, blocked: false } : state;
      }
      return state;

    case "SELECT":
      return {
        ...state,
        selection: action.selection,
        blocked: false
      };

    case "SIMULATE_STALE":
      if (state.stage !== "plan") return state;
      return {
        ...state,
        selection: state.target === "Frame 12" ? "Frame 13" : "Frame 12",
        blocked: false
      };

    case "REINSPECT":
      return {
        ...state,
        stage: "inspect",
        target: state.selection,
        applied: false,
        blocked: false
      };

    case "RESET":
      return createDemoState();

    default:
      return state;
  }
}

const STAGE_CONTENT = {
  inspect: {
    command: "$layntra inspect selection",
    title: "Selection inspected",
    message: "14 editable nodes found. Figma remains unchanged.",
    next: "Create plan"
  },
  plan: {
    command: '$layntra plan "Improve the hierarchy. Keep all copy."',
    title: "Plan ready",
    message: "3 proposed changes are previewed against the selected frame.",
    next: "Apply plan"
  },
  apply: {
    command: "$layntra apply",
    title: "Applied and re-read",
    message: "3 editable changes were written and verified on the same target.",
    next: "Undo change"
  },
  undo: {
    command: "$layntra undo",
    title: "Undo verified",
    message: "The original frame values were restored and read back.",
    next: "Inspect again"
  }
};

function getStatus(state) {
  if (state.blocked) {
    return {
      command: "$layntra apply",
      title: "Apply blocked",
      message: `Selection changed from ${state.target} to ${state.selection}. Re-inspect before writing.`,
      next: "Re-inspect target"
    };
  }

  if (state.stage === "plan" && state.selection !== state.target) {
    return {
      command: '$layntra plan "Improve the hierarchy. Keep all copy."',
      title: "Selection changed",
      message: `The plan still targets ${state.target}, but Figma now selects ${state.selection}.`,
      next: "Try apply"
    };
  }

  return STAGE_CONTENT[state.stage];
}

function initializeDemo(root) {
  let state = createDemoState();
  const stepButtons = [...root.querySelectorAll("[data-demo-step]")];
  const layerButtons = [...root.querySelectorAll("[data-demo-layer]")];
  const statusTitle = root.querySelector("[data-demo-status-title]");
  const statusMessage = root.querySelector("[data-demo-status-message]");
  const command = root.querySelector("[data-demo-command]");
  const nextButton = root.querySelector('[data-demo-action="next"]');
  const staleButton = root.querySelector('[data-demo-action="stale"]');
  const resetButton = root.querySelector('[data-demo-action="reset"]');
  const selectionLabels = [...root.querySelectorAll("[data-demo-selection]")];
  const targetLabels = [...root.querySelectorAll("[data-demo-target]")];
  const alert = root.querySelector("[data-demo-alert]");

  const render = () => {
    const content = getStatus(state);
    const isStale = state.selection !== state.target;

    root.dataset.stage = state.stage;
    root.dataset.applied = String(state.applied);
    root.dataset.stale = String(isStale);
    root.dataset.blocked = String(state.blocked);
    root.dataset.selection = state.selection.replace(" ", "-").toLowerCase();

    for (const button of stepButtons) {
      const isActive = button.dataset.demoStep === state.stage;
      const step = button.dataset.demoStep;
      button.setAttribute("aria-pressed", String(isActive));
      button.dataset.active = String(isActive);
      button.disabled =
        (step === "apply" && !["plan", "apply"].includes(state.stage)) ||
        (step === "undo" && !state.applied && state.stage !== "undo");
    }

    for (const button of layerButtons) {
      const isSelected = button.dataset.demoLayer === state.selection;
      button.setAttribute("aria-pressed", String(isSelected));
      button.dataset.selected = String(isSelected);
    }

    for (const label of selectionLabels) label.textContent = state.selection;
    for (const label of targetLabels) label.textContent = state.target;

    command.textContent = content.command;
    statusTitle.textContent = content.title;
    statusMessage.textContent = content.message;
    nextButton.textContent = content.next;
    staleButton.disabled = state.stage !== "plan" || state.blocked;
    alert.hidden = !state.blocked;
  };

  const dispatch = (action) => {
    state = reduceDemoState(state, action);
    render();
  };

  for (const button of stepButtons) {
    button.addEventListener("click", () => dispatch({ type: "GO_TO", stage: button.dataset.demoStep }));
  }

  for (const button of layerButtons) {
    button.addEventListener("click", () => dispatch({ type: "SELECT", selection: button.dataset.demoLayer }));
  }

  nextButton.addEventListener("click", () => dispatch({ type: state.blocked ? "REINSPECT" : "NEXT" }));
  staleButton.addEventListener("click", () => dispatch({ type: "SIMULATE_STALE" }));
  resetButton.addEventListener("click", () => dispatch({ type: "RESET" }));

  render();
}

if (typeof document !== "undefined") {
  for (const root of document.querySelectorAll("[data-layntra-demo]")) initializeDemo(root);
}
