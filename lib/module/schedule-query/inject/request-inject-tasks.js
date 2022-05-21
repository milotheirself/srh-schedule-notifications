const resolve = () => {
  try {
    // ---
    // ? data from "./data.js"
    const weeks = Object.keys(globalThis.data.weeks);
    const tasks = globalThis.data.classes;
    // ---

    // ?
    return { weeks, tasks };
  } catch (error) {
    return { weeks: [], tasks: [] };
  }
};

// ---
resolve();
