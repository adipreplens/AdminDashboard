const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'https://admindashboard-x0hk.onrender.com';

async function testModuleCreator() {
  console.log('🧪 Testing Module Creator Backend Endpoints');
  console.log('==========================================\n');

  try {
    // Test 1: Get tags
    console.log('📋 Test 1: Fetching available tags...');
    const tagsResponse = await fetch(`${API_BASE_URL}/tags`);
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json();
      console.log('✅ Tags fetched successfully');
      console.log(`📊 Found ${tagsData.tags.length} unique tags`);
      console.log('📝 Sample tags:', tagsData.tags.slice(0, 5));
    } else {
      console.log('❌ Failed to fetch tags');
    }
    console.log('');

    // Test 2: Get questions for module creation
    console.log('📝 Test 2: Fetching questions for selection...');
    const questionsResponse = await fetch(`${API_BASE_URL}/questions/all?limit=5`);
    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json();
      console.log('✅ Questions fetched successfully');
      console.log(`📊 Found ${questionsData.questions.length} questions`);
      console.log('📝 Sample questions:', questionsData.questions.slice(0, 2).map(q => ({
        id: q._id,
        text: q.text.substring(0, 50) + '...',
        subject: q.subject,
        exam: q.exam,
        marks: q.marks
      })));
    } else {
      console.log('❌ Failed to fetch questions');
    }
    console.log('');

    // Test 3: Create a test module
    console.log('📚 Test 3: Creating a test module...');
    const testModuleData = {
      name: 'Test Module - Mathematics Practice',
      description: 'A test module for mathematics practice questions',
      exam: 'SSC CGL',
      subject: 'Quantitative Aptitude',
      difficulty: 'Medium',
      tags: ['test', 'mathematics', 'practice'],
      questions: [], // Will be populated with actual question IDs
      moduleType: 'practice',
      isPremium: false,
      language: 'english',
      instructions: 'Complete all questions within the time limit.'
    };

    // Get some question IDs first
    const questionsForModule = await fetch(`${API_BASE_URL}/questions/all?limit=3`);
    if (questionsForModule.ok) {
      const questionsData = await questionsForModule.json();
      if (questionsData.questions.length > 0) {
        testModuleData.questions = questionsData.questions.slice(0, 2).map(q => q._id);
        
        const createModuleResponse = await fetch(`${API_BASE_URL}/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testModuleData),
        });

        if (createModuleResponse.ok) {
          const moduleData = await createModuleResponse.json();
          console.log('✅ Test module created successfully!');
          console.log('📊 Module details:', {
            id: moduleData.module._id,
            name: moduleData.module.name,
            questions: moduleData.module.questions.length,
            totalMarks: moduleData.module.totalMarks,
            totalTime: moduleData.module.totalTime
          });
          
          // Test 4: Get the created module
          console.log('\n📖 Test 4: Fetching created module...');
          const getModuleResponse = await fetch(`${API_BASE_URL}/modules/${moduleData.module._id}`);
          if (getModuleResponse.ok) {
            const fetchedModule = await getModuleResponse.json();
            console.log('✅ Module fetched successfully');
            console.log('📊 Module details:', {
              name: fetchedModule.module.name,
              questions: fetchedModule.module.questions.length,
              publishStatus: fetchedModule.module.publishStatus
            });
          } else {
            console.log('❌ Failed to fetch module');
          }

          // Test 5: Get all modules
          console.log('\n📚 Test 5: Fetching all modules...');
          const allModulesResponse = await fetch(`${API_BASE_URL}/modules`);
          if (allModulesResponse.ok) {
            const modulesData = await allModulesResponse.json();
            console.log('✅ Modules fetched successfully');
            console.log(`📊 Total modules: ${modulesData.total}`);
            console.log('📝 Modules:', modulesData.modules.map(m => ({
              name: m.name,
              questions: m.questions.length,
              publishStatus: m.publishStatus
            })));
          } else {
            console.log('❌ Failed to fetch modules');
          }

        } else {
          const errorData = await createModuleResponse.json();
          console.log('❌ Failed to create module:', errorData.error);
        }
      } else {
        console.log('❌ No questions available for module creation');
      }
    } else {
      console.log('❌ Failed to fetch questions for module creation');
    }

  } catch (error) {
    console.error('💥 Error during testing:', error.message);
  }

  console.log('\n🏁 Module Creator backend testing completed!');
}

testModuleCreator(); 