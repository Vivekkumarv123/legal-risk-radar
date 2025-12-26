// test-ocr.js
import fs from "fs";
import path from "path";

// ---------------- CONFIGURATION ---------------- //
// 1. The path to the file you want to test (PDF or Image)
const FILE_PATH = "C:\\Users\\physics\\Downloads\\internship acceptance.pdf"; 

// 2. Your running local API URL
const API_URL = "http://localhost:3000/api/analyze"; 
// ----------------------------------------------- //

async function testUpload() {
  try {
    console.log(`📖 Reading file: ${FILE_PATH}...`);
    
    // Check if file exists
    if (!fs.existsSync(FILE_PATH)) {
      console.error("❌ File not found at path:", FILE_PATH);
      return;
    }

    // Read file from disk
    const fileBuffer = fs.readFileSync(FILE_PATH);
    const fileName = path.basename(FILE_PATH);
    
    // Create a Blob (Node 18+ has built-in Blob/FormData)
    const blob = new Blob([fileBuffer], { 
      type: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png' 
    });

    // Mimic the browser's FormData
    const formData = new FormData();
    formData.append("file", blob, fileName);

    console.log("🚀 Sending POST request to API...");
    
    // Send Request
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    // Parse Response
    const result = await response.json();
    
    console.log("\n---------------- SERVER RESPONSE ----------------");
    console.log(JSON.stringify(result, null, 2));
    console.log("-------------------------------------------------");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testUpload();