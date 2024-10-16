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
