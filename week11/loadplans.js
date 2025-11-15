const BACKEND_URL = "http://bscit.sit.kmutt.ac.th/intproj25/ssa1/itb-ecors";
async function loadStudyPlans() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/study-plans`);
    if (!res.ok) throw new Error("Failed to fetch plans");

    const plans = await res.json();
    const tableBody = document.getElementById("plansTable");
    tableBody.innerHTML = "";

    plans.forEach(plan => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${plan.id}</td>
        <td>${plan.planCode}</td>
        <td>${plan.nameEng}</td>
        <td>${plan.nameTh}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("errorModal").showModal();
  }
}