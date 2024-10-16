importScripts('libs/pdf.js', 'libs/pdf.worker.js'); // Load pdf.js
// importScripts('lib/pdf.worker.js'); // Load pdf.js

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'scrapePDF') {
    const pdfUrl = request.pdfUrl; // PDF URL from the current tab
    const extractedData = await extractPdfData(pdfUrl);
    
    // Send extracted data back to the popup
    chrome.runtime.sendMessage({
      action: 'populateFields',
      data: extractedData
    });
  }
});

async function extractPdfData(pdfUrl) {
  // Load the PDF using PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.js');
  
  // Fetch the PDF as a Blob
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch PDF');
  }

  const pdfBlob = await response.blob();
  const pdfArrayBuffer = await pdfBlob.arrayBuffer();

  // Load the PDF document from the ArrayBuffer
  const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
  const pdf = await loadingTask.promise;

  let extractedText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const textItems = content.items;

    for (const item of textItems) {
        extractedText += item.str + ' ';
    }
  }
  
  // Parse the extracted text as needed
  return {
    extractedText
  };
}