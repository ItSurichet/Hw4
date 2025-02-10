document.addEventListener('DOMContentLoaded', () => {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    
    function saveAppointments() {
      localStorage.setItem("appointments", JSON.stringify(appointments));
    }
    
    function displayAppointments() {
      const appointmentList = document.getElementById("appointmentList");
      appointmentList.innerHTML = "";
      appointments.forEach(app => {
        const li = document.createElement("li");
        li.className = "p-4 bg-blue-100 rounded shadow flex justify-between items-center";
        let text = `${app.date} ${app.startTime} - ${app.endTime}: ${app.title}`;
        if (app.conflict) text += " (เวลาซ้ำ)";
        if (app.status === "ยกเลิก") {
          li.innerHTML = `<del>${text}</del>`;
        } else {
          li.textContent = text;
        }
        if (app.status !== "ยกเลิก") {
          const cancelBtn = document.createElement("button");
          cancelBtn.textContent = "ยกเลิก";
          cancelBtn.className = "ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded";
          cancelBtn.onclick = function() {
            cancelAppointment(app.id);
          };
          li.appendChild(cancelBtn);
        }
        appointmentList.appendChild(li);
      });
    }
    
    function createAppointment(appointmentData) {
      appointmentData.id = Date.now().toString();
      appointmentData.status = "ยืนยันแล้ว";
      const conflict = appointments.some(app => {
        return app.date === appointmentData.date &&
          ((appointmentData.startTime >= app.startTime && appointmentData.startTime < app.endTime) ||
           (appointmentData.endTime > app.startTime && appointmentData.endTime <= app.endTime));
      });
      appointmentData.conflict = conflict;
      appointments.push(appointmentData);
      saveAppointments();
      displayAppointments();
    }
    
    function cancelAppointment(appointmentId) {
      const appointment = appointments.find(app => app.id === appointmentId);
      if (appointment) {
        appointment.status = "ยกเลิก";
        saveAppointments();
        displayAppointments();
      }
    }
    
    function getUpcomingAppointments() {
      const now = new Date();
      return appointments.filter(app => {
        const appDateTime = new Date(app.date + "T" + app.startTime);
        return appDateTime > now && app.status === "ยืนยันแล้ว";
      });
    }
    
    setInterval(() => {
      const upcoming = getUpcomingAppointments();
      upcoming.forEach(app => {
        const appDateTime = new Date(app.date + "T" + app.startTime);
        const diff = (appDateTime - new Date()) / 60000;
        if (diff <= 1 && diff > 0) alert("มีนัดหมายในอีกไม่ถึง 1 นาที: " + app.title);
      });
    }, 30000);
    
    document.getElementById("appointmentForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const appointmentData = {
        title: document.getElementById("appointmentTitle").value,
        date: document.getElementById("appointmentDate").value,
        startTime: document.getElementById("appointmentStartTime").value,
        endTime: document.getElementById("appointmentEndTime").value,
      };
      createAppointment(appointmentData);
      this.reset();
    });
    
    displayAppointments();
  });
  