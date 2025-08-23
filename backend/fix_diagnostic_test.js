const fs = require('fs');

// Read the user_apis.js file
const filePath = './user_apis.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the diagnostic test logic with a more flexible approach
const oldLogic = `      // Get questions in difficulty order (easy -> medium -> hard)
      const easyQuestions = await Question.find({ 
        exam: examType, 
        difficulty: 'easy' 
      }).limit(10).select('text options answer subject difficulty explanation');

      const mediumQuestions = await Question.find({ 
        exam: examType, 
        difficulty: 'medium' 
      }).limit(10).select('text options answer subject difficulty explanation');

      const hardQuestions = await Question.find({ 
        exam: examType, 
        difficulty: 'hard' 
      }).limit(10).select('text options answer subject difficulty explanation');

      // Combine questions for diagnostic test
      const diagnosticQuestions = [
        ...easyQuestions.slice(0, 10),
        ...mediumQuestions.slice(0, 10),
        ...hardQuestions.slice(0, 10)
      ].slice(0, 30); // Ensure max 30 questions`;

const newLogic = `      // Get questions in difficulty order (easy -> medium -> hard)
      // Use more flexible approach since not all difficulties may have questions
      const easyQuestions = await Question.find({ 
        exam: examType, 
        difficulty: 'easy' 
      }).limit(10).select('text options answer subject difficulty explanation');

      const mediumQuestions = await Question.find({ 
        exam: examType, 
        difficulty: 'medium' 
      }).limit(15).select('text options answer subject difficulty explanation');

      const hardQuestions = await Question.find({ 
        exam: examType, 
        difficulty: 'hard' 
      }).limit(10).select('text options answer subject difficulty explanation');

      // Combine questions for diagnostic test, prioritizing available difficulties
      let diagnosticQuestions = [];
      
      // Add available questions from each difficulty
      if (easyQuestions.length > 0) {
        diagnosticQuestions.push(...easyQuestions.slice(0, 10));
      }
      if (mediumQuestions.length > 0) {
        diagnosticQuestions.push(...mediumQuestions.slice(0, 15));
      }
      if (hardQuestions.length > 0) {
        diagnosticQuestions.push(...hardQuestions.slice(0, 10));
      }

      // If no questions found by difficulty, get any questions available
      if (diagnosticQuestions.length === 0) {
        diagnosticQuestions = await Question.find({ 
          exam: examType 
        }).limit(30).select('text options answer subject difficulty explanation');
      }

      // Ensure we have questions
      if (diagnosticQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No questions available for diagnostic test'
        });
      }

      // Limit to max 30 questions
      diagnosticQuestions = diagnosticQuestions.slice(0, 30);`;

// Replace the first occurrence only
const firstOccurrenceIndex = content.indexOf(oldLogic);
if (firstOccurrenceIndex !== -1) {
  content = content.substring(0, firstOccurrenceIndex) + 
            newLogic + 
            content.substring(firstOccurrenceIndex + oldLogic.length);
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Diagnostic test logic updated successfully!');
} else {
  console.log('❌ Could not find the diagnostic test logic to replace');
} 