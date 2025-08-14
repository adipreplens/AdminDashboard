const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  exam: { type: String, required: true },
  language: { type: String, enum: ['english', 'hindi'], default: 'english' },
  referralCode: { type: String },
  onboardingCompleted: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    const testUsers = [
      {
        name: 'RRB JE User',
        email: 'rrb@preplens.com',
        password: 'rrb123',
        phone: '+91-9876543210',
        exam: 'rrb-je',
        language: 'english',
        referralCode: 'RRB2024',
        onboardingCompleted: true
      },
      {
        name: 'SSC JE User',
        email: 'ssc@preplens.com',
        password: 'ssc123',
        phone: '+91-9876543211',
        exam: 'ssc-je',
        language: 'english',
        referralCode: 'SSC2024',
        onboardingCompleted: true
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        console.log(`✅ Created: ${userData.email} - ${userData.password}`);
      } else {
        console.log(`ℹ️  Already exists: ${userData.email} - ${userData.password}`);
      }
    }

    console.log('\n🎯 Test users ready for exams with most questions!');
    console.log('\n📱 Use these credentials in your Flutter app:');
    console.log('\n🔐 RRB JE User (150 questions):');
    console.log('   Email: rrb@preplens.com');
    console.log('   Password: rrb123');
    console.log('   📚 Exam: RRB Junior Engineer');
    console.log('   📊 Questions Available: 150');
    console.log('\n🔐 SSC JE User (18 questions):');
    console.log('   Email: ssc@preplens.com');
    console.log('   Password: ssc123');
    console.log('   📚 Exam: SSC Junior Engineer');
    console.log('   📊 Questions Available: 18');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUsers(); 