async function loadStudyPlans() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/study-plans`);
    if (!res.ok) throw new Error("Failed to load");

    const plans = await res.json();
    const dropdown = document.getElementById("planDropdown");

    
    const declareButton = document.getElementById("ecors-button-declare");
    const declareStatus = document.getElementById("ecors-declared-plan");

    dropdown.innerHTML = `<option value="">Select a study plan</option>`;

    plans.forEach(plan => {
      const opt = document.createElement("option");
      opt.value = plan.id;
      opt.textContent = `${plan.planCode} - ${plan.nameEng}`;
      dropdown.appendChild(opt);
    });

    // Default state
    declareButton.disabled = true;
    declareStatus.textContent = "Declaration Status: Not Declared";

   
    dropdown.addEventListener("change", () => {
      if (dropdown.value === "") {
        declareStatus.textContent = "Declaration Status: Not Declared";
        declareButton.disabled = true;
      } else {
        declareStatus.textContent = "Declaration Status: Declared";
        declareButton.disabled = false;
      }
    });

  } catch (err) {
    console.error(err);
    const dropdown = document.getElementById("planDropdown");
    dropdown.innerHTML = `<option>Error loading plans</option>`;
  }
}