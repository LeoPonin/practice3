// ---------------------------
// POST METHOD
// ---------------------------
async function postDeclaredPlan(studentId, token, payload) {
  return fetch(
    `${BACKEND_URL}/api/v1/students/${studentId}/declared-plan`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );
}

// ---------------------------
// PUT METHOD
// ---------------------------
async function putDeclaredPlan(studentId, token, payload) {
  return await fetch(
    `${BACKEND_URL}/api/v1/students/${studentId}/declared-plan`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );
}

// ---------------------------
// DECLARE PLAN (POST/PUT)
// ---------------------------
async function declarePlan(studyPlans, isUpdate = false) {
  const token = localStorage.getItem("kc_token");
  const decoded = decodeToken(token);
  const studentId = decoded?.preferred_username;
  const dropdown = document.querySelector(".ecors-dropdown-plan");
  const planId = dropdown.value;

  if (!planId) {
    alert("Please select a plan");
    return;
  }

  const payload = {
    planId: Number(planId),
  };

  let requestFn = isUpdate ? putDeclaredPlan : postDeclaredPlan;

  try {
    const res = await requestFn(studentId, token, payload);

    // -------------------------------
    // UPDATE (PUT)
    // -------------------------------
    if (isUpdate) {
      if (res.status === 200) {
        const updated = await res.json();
        const merged = mergeDeclaredWithStudyPlan(updated, studyPlans);
        const local = convertUTCToLocalFormatted(updated.updatedAt);
        const tz = getBrowserTimezone();

        document.getElementById("ecors-declared-plan").textContent =
          `Declared ${merged.planCode} - ${merged.nameEng} on ${local} (${tz})`;

        msgBox.textContent = "Declaration updated.";
        errorModal.showModal();

        await loadDeclaredPlan(studyPlans); // refresh UI
        return;
      }

      // PBI7: If backend returns 409 because it's CANCELLED → show specific dialog
      if (res.status === 409) {
        msgBox.textContent = "Cannot update the declared plan because it has been cancelled.";
        errorModal.showModal();
        return await loadDeclaredPlan(studyPlans);
      }

      if (res.status === 404) {
        msgBox.textContent = `No declared plan found for student with id=${studentId}.`;
        errorModal.showModal();
        return await loadDeclaredPlan(studyPlans);
      }
    }

    // -------------------------------
    // CREATE (POST)
    // -------------------------------
    else {
      if (res.status === 201) {
        await loadDeclaredPlan(studyPlans);
        return;
      }

      if (res.status === 409) {
        msgBox.textContent = "You may have declared study plan already. Please check again.";
        errorModal.showModal();
        await loadDeclaredPlan(studyPlans); // refresh UI
        return;
      }
    }

    // ----------- SERVER ERROR -----------
    if ([500, 502, 503].includes(res.status)) {
      msgBox.textContent = "There is a problem. Please try again later.";
      errorModal.showModal();
      return;
    }

    alert("Error declaring plan.");

  } catch (err) {
    console.error("Declare Error:", err);
    msgBox.textContent = "There is a problem. Please try again later.";
    errorModal.showModal();
  }
}