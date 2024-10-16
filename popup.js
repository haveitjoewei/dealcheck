document.getElementById("dealCheckTabBtn").addEventListener("click", function() {
    document.getElementById("dealcheck-tab").style.display = "block";
    document.getElementById("tablecloth-tab").style.display = "none";
    
    // Update active tab style
    this.classList.add("active");
    document.getElementById("tableclothTabBtn").classList.remove("active");
});

document.getElementById("tableclothTabBtn").addEventListener("click", function() {
    document.getElementById("dealcheck-tab").style.display = "none";
    document.getElementById("tablecloth-tab").style.display = "block";

    // Update active tab style
    this.classList.add("active");
    document.getElementById("dealCheckTabBtn").classList.remove("active");
});

// Default to showing the DealCheck tab
document.getElementById("dealcheck-tab").style.display = "block";
document.getElementById("tablecloth-tab").style.display = "none";

document.getElementById("calculateBtn").addEventListener("click", function() {
    const purchasePrice = parseFloat(document.getElementById("purchasePrice").value);
    const arv = parseFloat(document.getElementById("arv").value);
    const monthlyRent = parseFloat(document.getElementById("monthlyRent").value);
    const costOfRepairs = parseFloat(document.getElementById("costOfRepairs").value);
    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    const loanTerm = parseInt(document.getElementById("loanTerm").value);

    // Monthly interest rate
    const monthlyInterestRate = interestRate / 12;
    // Number of total payments
    const numPayments = loanTerm * 12;
    // Monthly principal & interest (Mortgage payment)
    const monthlyPI = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numPayments));

    // Tablecloth Cash Flow = Monthly Rent * 0.6 - Monthly PI
    const cashFlow = (monthlyRent * 0.6) - monthlyPI;

    // 70% Rule = Purchase Price / (ARV - Cost of Repairs) as a percentage
    const rule70 = (purchasePrice / (arv - costOfRepairs)) * 100;

    // 1% Rule = Monthly Rent / Purchase Price
    const rule1 = (monthlyRent / purchasePrice) * 100;

    // Update results
    document.getElementById("cashFlowResult").textContent = "$" + cashFlow.toFixed(2);
    document.getElementById("rule70Result").textContent = rule70.toFixed(2) + "%";
    document.getElementById("rule1Result").textContent = rule1.toFixed(2) + "%";
});

document.getElementById('loadData').addEventListener('click', () => {
  // Query the current tab to get its URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const pdfUrl = currentTab.url;

    // Check if the current tab's URL is a PDF
    if (pdfUrl.endsWith(".pdf")) {
      // Send message to background to scrape the PDF from this URL
      chrome.runtime.sendMessage({ action: 'scrapePDF', pdfUrl });
    } else {
      alert('This page is not a PDF!');
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'populateFields') {
    if (message.data && message.data.extractedText) {
      const textContent = message.data.extractedText;

      // Process the text to extract the required fields
      const streetMatch = textContent.match(/(?:Tax Billing Address\s*)(.*?)(?:\s|$)(?:Tax Billing Zip|$)/);
      const cityStateMatch = textContent.match(/(?:Tax Billing City & State\s*)(.*?)(?:\s|$)(?:Owner Occupied\s|$)/);
      const zipMatch = textContent.match(/(?:Tax Billing Zip\s*)(.*?)(?:\s|$)/);

      // Populate the fields with extracted values
      document.getElementById('street').value = streetMatch ? streetMatch[1] : '';
      document.getElementById('city').value = cityStateMatch ? cityStateMatch[1].split(', ')[0] : '';
      document.getElementById('state').value = cityStateMatch ? cityStateMatch[1].split(', ')[1] : '';
      document.getElementById('zip').value = zipMatch ? zipMatch[1] : '';
    }
  }
});

document.getElementById('submitData').addEventListener('click', () => {
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const strategy = document.getElementById('strategy').value;

    if (street && city && state && zip && strategy) {
        const baseURL = "https://dealcheck.io/add/p";
        const queryString = new URLSearchParams({ street, city, state, zip, strategy }).toString();
        const fullURL = `${baseURL}?${queryString}`;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.update(activeTab.id, { url: fullURL });
        });
    } else {
        alert('Please fill in all fields');
    }
});
