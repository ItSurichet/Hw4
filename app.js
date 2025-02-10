document.addEventListener('DOMContentLoaded', () => {

    function saveToLocalStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึกลง localStorage:", error);
      }
    }
    function getFromLocalStorage(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการอ่านจาก localStorage:", error);
        return null;
      }
    }
  

    window.showSection = function(sectionId) {
      document.querySelectorAll("section").forEach(sec => {
        sec.classList.add("hidden");
      });
      document.getElementById(sectionId).classList.remove("hidden");
    }

    showSection("expenses");
  

    let expenses = getFromLocalStorage("expenses") || [];
  
    function addExpense(expenseData) {
      expenseData.id = Date.now().toString();
      expenses.push(expenseData);
      saveToLocalStorage("expenses", expenses);
      displayExpenses(expenses);
    }
    function getExpensesByDate(date) {
      return expenses.filter(exp => exp.date === date);
    }
    function calculateTotalByCategory(category) {
      return expenses.filter(exp => exp.category === category)
                     .reduce((total, exp) => total + Number(exp.amount), 0);
    }
    function generateMonthlyReport() {
      const currentMonth = new Date().toISOString().slice(0,7);
      const report = {};
      expenses.forEach(exp => {
        if(exp.date.startsWith(currentMonth)) {
          if(!report[exp.category]) report[exp.category] = 0;
          report[exp.category] += Number(exp.amount);
        }
      });
      return report;
    }
    function displayExpenses(expenseArray) {
      const list = document.getElementById("expenseList");
      list.innerHTML = "";
      expenseArray.forEach(exp => {
        const li = document.createElement("li");
        li.textContent = `${exp.date} - ${exp.title}: ${exp.amount} (${exp.category})`;
        list.appendChild(li);
      });
    }
    document.getElementById("expenseForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const expenseData = {
        title: document.getElementById("expenseTitle").value,
        amount: Number(document.getElementById("expenseAmount").value),
        category: document.getElementById("expenseCategory").value,
        date: document.getElementById("expenseDate").value,
      };
      addExpense(expenseData);
      this.reset();
    });
    document.getElementById("filterExpenseBtn").addEventListener("click", function() {
      const filterDate = document.getElementById("filterExpenseDate").value;
      const filterCategory = document.getElementById("filterExpenseCategory").value;
      let filtered = expenses;
      if(filterDate) {
        filtered = filtered.filter(exp => exp.date === filterDate);
      }
      if(filterCategory) {
        filtered = filtered.filter(exp => exp.category === filterCategory);
      }
      displayExpenses(filtered);
    });
    document.getElementById("monthlyReportBtn").addEventListener("click", function() {
      const report = generateMonthlyReport();
      let reportHtml = "<ul>";
      for(let cat in report) {
        reportHtml += `<li>${cat}: ${report[cat]}</li>`;
      }
      reportHtml += "</ul>";
      document.getElementById("monthlyReport").innerHTML = reportHtml;
    });
    displayExpenses(expenses);
  

    let products = getFromLocalStorage("products") || [];
    function addProduct(productData) {
      productData.id = Date.now().toString();
      productData.totalSales = 0;
      products.push(productData);
      saveToLocalStorage("products", products);
      displayProducts();
    }
    function updateStock(productId, quantity) {
      const product = products.find(p => p.id === productId);
      if(product) {
        if(quantity < 0) {
          if(product.inStock + quantity >= 0) {
            product.inStock += quantity;
            product.totalSales += Math.abs(quantity);
          } else {
            alert("จำนวนสินค้าไม่เพียงพอ!");
            return;
          }
        } else {
          product.inStock += quantity;
        }
        saveToLocalStorage("products", products);
        displayProducts();
      } else {
        alert("ไม่พบสินค้านี้!");
      }
    }
    function checkLowStock() {
      return products.filter(p => p.inStock <= p.minStock);
    }
    function generateSalesReport() {
      return products.filter(p => p.totalSales > 0);
    }
    function displayProducts() {
      const list = document.getElementById("productList");
      list.innerHTML = "";
      products.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `รหัส: ${p.id} - ${p.name}: ราคา ${p.price}, คงคลัง: ${p.inStock}, ประเภท: ${p.category}, ยอดขาย: ${p.totalSales}`;
        list.appendChild(li);
      });
    }
    document.getElementById("productForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const productData = {
        name: document.getElementById("productName").value,
        price: Number(document.getElementById("productPrice").value),
        inStock: Number(document.getElementById("productInStock").value),
        category: document.getElementById("productCategory").value,
        minStock: Number(document.getElementById("productMinStock").value)
      };
      addProduct(productData);
      this.reset();
    });
    document.getElementById("updateStockForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const productId = document.getElementById("updateProductId").value;
      const quantity = Number(document.getElementById("updateQuantity").value);
      updateStock(productId, quantity);
      this.reset();
    });
    document.getElementById("lowStockBtn").addEventListener("click", function() {
      const lowStockProducts = checkLowStock();
      let html = "<ul>";
      lowStockProducts.forEach(p => {
        html += `<li>${p.name} (รหัส: ${p.id}) - คงคลัง: ${p.inStock}</li>`;
      });
      html += "</ul>";
      document.getElementById("lowStockReport").innerHTML = html;
    });
    document.getElementById("salesReportBtn").addEventListener("click", function() {
      const salesProducts = generateSalesReport();
      let html = "<ul>";
      salesProducts.forEach(p => {
        html += `<li>${p.name} - ยอดขาย: ${p.totalSales}</li>`;
      });
      html += "</ul>";
      document.getElementById("salesReport").innerHTML = html;
    });
    displayProducts();
  
 
    let appointments = getFromLocalStorage("appointments") || [];
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
      saveToLocalStorage("appointments", appointments);
      displayAppointments();
    }
    function cancelAppointment(appointmentId) {
      const appointment = appointments.find(app => app.id === appointmentId);
      if(appointment) {
        appointment.status = "ยกเลิก";
        saveToLocalStorage("appointments", appointments);
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
    function displayAppointments() {
      const list = document.getElementById("appointmentList");
      list.innerHTML = "";
      appointments.forEach(app => {
        const li = document.createElement("li");
        let text = `${app.date} ${app.startTime} - ${app.endTime}: ${app.title}`;
        if(app.conflict) {
          text += " (เวลาซ้ำ)";
        }
        if(app.status === "ยกเลิก") {
          li.innerHTML = "<del>" + text + "</del>";
        } else {
          li.textContent = text;
        }
        if(app.status !== "ยกเลิก") {
          const cancelBtn = document.createElement("button");
          cancelBtn.textContent = "ยกเลิก";
          cancelBtn.className = "ml-2 bg-red-500 text-white px-2 rounded";
          cancelBtn.onclick = function() {
            cancelAppointment(app.id);
          };
          li.appendChild(cancelBtn);
        }
        list.appendChild(li);
      });
    }
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
    setInterval(() => {
      const upcoming = getUpcomingAppointments();
      upcoming.forEach(app => {
        const appDateTime = new Date(app.date + "T" + app.startTime);
        const diff = (appDateTime - new Date()) / 60000; 
        if(diff <= 1 && diff > 0) {
          alert("มีนัดหมายในอีกไม่ถึง 1 นาที: " + app.title);
        }
      });
    }, 30000);
    displayAppointments();
  
   
    let quizData = getFromLocalStorage("quizData") || null;
    if(!quizData) {
      quizData = {
        id: "quiz1",
        questions: []
      };
      for(let i = 1; i <= 20; i++) {
        quizData.questions.push({
          id: i,
          text: "คำถามที่ " + i + ": คำตอบคืออะไร?",
          choices: ["A", "B", "C", "D"],
          correct: "A"
        });
      }
      quizData.timeLimit = 60; 
      quizData.passingScore = 60;
      saveToLocalStorage("quizData", quizData);
    }
    let currentQuiz = null;
    let quizTimerInterval = null;
    let quizTimeRemaining = 0;
    let quizAnswers = {};
    function startQuiz(quizId) {
      const storedQuiz = getFromLocalStorage("quizData");
      if(storedQuiz && storedQuiz.id === quizId) {
        currentQuiz = storedQuiz;
        const shuffled = currentQuiz.questions.sort(() => 0.5 - Math.random());
        currentQuiz.selectedQuestions = shuffled.slice(0, 5);
        quizTimeRemaining = currentQuiz.timeLimit;
        quizAnswers = {};
        displayQuiz();
        startQuizTimer();
      }
    }
    function displayQuiz() {
      const container = document.getElementById("quizContainer");
      container.innerHTML = "";
      currentQuiz.selectedQuestions.forEach(q => {
        const div = document.createElement("div");
        div.className = "mb-4 border p-4 rounded bg-white";
        const questionText = document.createElement("p");
        questionText.textContent = q.text;
        div.appendChild(questionText);
        q.choices.forEach(choice => {
          const label = document.createElement("label");
          label.className = "block";
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = "question_" + q.id;
          radio.value = choice;
          radio.onclick = () => {
            quizAnswers[q.id] = choice;
          };
          label.appendChild(radio);
          label.appendChild(document.createTextNode(" " + choice));
          div.appendChild(label);
        });
        container.appendChild(div);
      });
      const submitBtn = document.createElement("button");
      submitBtn.textContent = "ส่งคำตอบ";
      submitBtn.className = "bg-blue-500 text-white px-4 py-2 rounded";
      submitBtn.onclick = submitQuiz;
      container.appendChild(submitBtn);
    }
    function startQuizTimer() {
      document.getElementById("quizTimer").textContent = "เวลาที่เหลือ: " + quizTimeRemaining + " วินาที";
      quizTimerInterval = setInterval(() => {
        quizTimeRemaining--;
        document.getElementById("quizTimer").textContent = "เวลาที่เหลือ: " + quizTimeRemaining + " วินาที";
        if(quizTimeRemaining <= 0) {
          clearInterval(quizTimerInterval);
          submitQuiz();
        }
      }, 1000);
    }
    function calculateScore() {
      let correctCount = 0;
      currentQuiz.selectedQuestions.forEach(q => {
        if(quizAnswers[q.id] && quizAnswers[q.id] === q.correct) {
          correctCount++;
        }
      });
      return (correctCount / currentQuiz.selectedQuestions.length) * 100;
    }
    function showResults() {
      clearInterval(quizTimerInterval);
      const score = calculateScore();
      let resultHtml = "<h3 class='text-xl font-bold'>คะแนนของคุณ: " + score + "%</h3>";
      currentQuiz.selectedQuestions.forEach(q => {
        resultHtml += "<div class='mb-2 border p-2 rounded'>";
        resultHtml += "<p>" + q.text + "</p>";
        resultHtml += "<p>คำตอบของคุณ: " + (quizAnswers[q.id] || "ไม่มีคำตอบ") + "</p>";
        resultHtml += "<p>คำตอบที่ถูกต้อง: " + q.correct + "</p>";
        resultHtml += "</div>";
      });
      document.getElementById("quizResults").innerHTML = resultHtml;
    }
    function submitQuiz() {
      showResults();
      document.getElementById("quizContainer").innerHTML = "";
      document.getElementById("quizTimer").textContent = "";
    }
    document.getElementById("startQuizBtn").addEventListener("click", function() {
      startQuiz("quiz1");
    });
  });
  