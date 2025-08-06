// Quick test to verify the column mapping works
const fs = require('fs');
const csv = require('csv-parser');

// Simulate the updated extractSolution function
function extractSolution(row, headers, foundColumns) {
  // First try to use the foundColumns mapping
  if (foundColumns.solution && row[foundColumns.solution]) {
    return row[foundColumns.solution].toString().trim();
  }
  
  // Then try to find solution-related columns manually
  for (const header of headers) {
    const headerLower = header.toLowerCase().trim();
    if (headerLower.includes('solution') || headerLower.includes('explanation') ||
        headerLower.includes('explain') || headerLower.includes('reasoning') ||
        headerLower.includes('detailed answer') || headerLower.includes('detailed_answer') ||
        headerLower.includes('detailedanswer') || headerLower.includes('detail') ||
        headerLower.includes('answer explanation') || headerLower.includes('answer_explanation') ||
        headerLower.includes('answerexplanation') || headerLower.includes('elaborate') ||
        headerLower.includes('description') || headerLower.includes('rationale') ||
        headerLower.includes('justification') || headerLower.includes('working') ||
        headerLower.includes('step by step') || headerLower.includes('step_by_step') ||
        headerLower.includes('stepbystep') || headerLower.includes('steps')) {
      if (row[header] && row[header].toString().trim()) {
        return row[header].toString().trim();
      }
    }
  }
  
  return '';
}

console.log('🧪 Testing Column Mapping for "Detailed Answer"...\n');

// Test the CSV file
fs.createReadStream('test_detailed_answer.csv')
  .pipe(csv())
  .on('data', (row) => {
    const headers = Object.keys(row);
    console.log('📋 Headers found:', headers);
    console.log('📝 Row data:', row);
    
    const solution = extractSolution(row, headers, {});
    console.log('💡 Extracted solution:', solution);
    console.log('✅ Solution length:', solution.length);
    console.log('---');
  })
  .on('end', () => {
    console.log('🎉 Test completed!');
  });