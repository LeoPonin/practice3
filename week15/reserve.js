
async function cancelDeclaredPlan(studyPlans, declared) {
  const token = localStorage.getItem("kc_token");
  const decoded = decodeToken(token);
  const studentId = decoded?.preferred_username;

  const confirmModal = document.getElementById("errorModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const keepBtn = document.getElementById("keepBtn");

  const statusLabel = document.getElementById("ecors-declared-plan");
  const dropdown = document.querySelector(".ecors-dropdown-plan");
  const declareBtn = document.querySelector(".ecors-button-declare");
  const changeBtn = document.querySelector(".ecors-button-change")
  const cancelBtnEl = document.getElementById("ecors-button-cancel");


  const local = convertUTCToLocalFormatted(declared.updatedAt);
  const tz = getBrowserTimezone();

  msgBox.textContent = `You have declared ${declared.planCode} - ${declared.nameEng} as your plan on ${local} (${tz}). Are you sure you want to cancel this declaration?`;

  cancelBtn.style.display = "inline-block";
  keepBtn.style.display = "inline-block";

  document.getElementById("errorOkBtn").style.display = "none";

  confirmModal.showModal();

  keepBtn.onclick = () => {

    cancelBtn.style.display = "none";
    keepBtn.style.display = "none";
    errorOkBtn.style.display = "inline-block";
    confirmModal.close();
  };


  cancelBtn.onclick = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/students/${studentId}/declared-plan`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Reset to normal error modal state
      cancelBtn.style.display = "none";
      keepBtn.style.display = "none";
      errorOkBtn.style.display = "inline-block";
      
      confirmModal.close();


      if (res.status === 204) {
        statusLabel.textContent = "Not Declared";


        cancelBtnEl.style.display = "none";

        // Reset dropdown -- no selection
        dropdown.disabled = false;
        dropdown.value = ""; // ← CLEAR selection

        // Declare button disabled until user selects a plan
        declareBtn.disabled = true;
        declareBtn.style.display = "inline-block";
        changeBtn.hidden = true;

        dropdown.onchange = () => {
          declareBtn.disabled = dropdown.value === "";
        };

        //show Declaration cancelled dialog
        msgBox.textContent = "Declaration cancelled.";
        confirmModal.showModal();

        return await loadDeclaredPlan(studyPlans);
      }

      
      if (res.status === 200) {

        const body = await res.json();
        const merged = mergeDeclaredWithStudyPlan(body, studyPlans);

        const localCancel = convertUTCToLocalFormatted(body.updatedAt || body.createdAt);
        const tz = getBrowserTimezone();
        statusLabel.textContent = `Cancelled ${merged.planCode} - ${merged.nameEng} plan on ${localCancel} (${tz})`;


        dropdown.disabled = false;
        dropdown.value = merged.planId;
        declareBtn.style.display = "inline-block";
        declareBtn.disabled = false;
        changeBtn.hidden = true;
        cancelBtnEl.style.display = "none";


        msgBox.textContent = "Declaration cancelled.";
        confirmModal.showModal();


        await loadDeclaredPlan(studyPlans);
        return;
      }


      if (res.status === 409) {

        let errBody = {};
        try { errBody = await res.json(); } catch (e) { /* ignore */ }

        msgBox.textContent = (errBody && errBody.message) ?
          errBody.message : "Cannot cancel the declared plan because it is already cancelled.";
        confirmModal.showModal();
        return await loadDeclaredPlan(studyPlans);
      }  


      if (res.status === 404) {
        statusLabel.textContent = "Not Declared";

        // Reset dropdown to empty state
        dropdown.disabled = false;
        dropdown.value = "";

        // Declare button disabled until user selects a plan
        declareBtn.disabled = true;
        changeBtn.hidden = true;

        // Cancel button hidden
        cancelBtn.style.display = "none";

        msgBox.textContent = `No declared plan found for student with id=${studentId}.`;
        confirmModal.showModal(); // open error dialog

        return await loadDeclaredPlan(studyPlans);
      }

      msgBox.textContent = "There is a problem. Please try again later.";
      confirmModal.showModal();

    } catch (err) {
      msgBox.textContent = "There is a problem. Please try again later.";
      cancelBtn.style.display = "none";
      keepBtn.style.display = "none";
      errorOkBtn.style.display = "inline-block";
      confirmModal.showModal() 
      return;
    }
  };
}