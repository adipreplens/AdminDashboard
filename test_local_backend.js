#!/usr/bin/env node

// Test script for local backend endpoints
const http = require('http');

const BASE_URL = 'http://localhost:5001';

async function testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Local Backend Endpoints...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const health = await testEndpoint('/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response: ${JSON.stringify(health.data)}\n`);

        // Test 2: Public Statistics
        console.log('2️⃣ Testing Public Statistics...');
        const stats = await testEndpoint('/api/public/statistics');
        console.log(`   Status: ${stats.status}`);
        if (stats.data.success) {
            console.log(`   ✅ Total Questions: ${stats.data.data.totalQuestions}`);
            console.log(`   ✅ Published: ${stats.data.data.publishedQuestions}`);
            console.log(`   ✅ Draft: ${stats.data.data.draftQuestions}`);
            console.log(`   ✅ Total Users: ${stats.data.data.totalUsers}`);
        } else {
            console.log(`   ❌ Error: ${stats.data.error}`);
        }
        console.log('');

        // Test 3: Admin Statistics
        console.log('3️⃣ Testing Admin Statistics...');
        const adminStats = await testEndpoint('/api/admin/statistics');
        console.log(`   Status: ${adminStats.status}`);
        if (adminStats.data.success) {
            console.log(`   ✅ Total Questions: ${adminStats.data.data.totalQuestions}`);
            console.log(`   ✅ Published: ${adminStats.data.data.publishedQuestions}`);
            console.log(`   ✅ Draft: ${adminStats.data.data.draftQuestions}`);
            console.log(`   ✅ Total Users: ${adminStats.data.data.totalUsers}`);
            console.log(`   ✅ Exams: ${adminStats.data.data.examBreakdown.length}`);
            console.log(`   ✅ Subjects: ${adminStats.data.data.subjectBreakdown.length}`);
        } else {
            console.log(`   ❌ Error: ${adminStats.data.error}`);
        }
        console.log('');

        // Test 4: Login
        console.log('4️⃣ Testing Login...');
        const login = await testEndpoint('/auth/login', 'POST', {
            email: 'admin@preplens.com',
            password: 'admin123'
        });
        console.log(`   Status: ${login.status}`);
        if (login.data.message === 'Login successful') {
            console.log(`   ✅ Login successful`);
            console.log(`   ✅ Token: ${login.data.token.substring(0, 20)}...`);
            console.log(`   ✅ User: ${login.data.user.email}`);
        } else {
            console.log(`   ❌ Login failed: ${login.data.error}`);
        }
        console.log('');

        console.log('🎉 All tests completed!');
        console.log('🌐 Admin Dashboard: http://localhost:5001/admin_dashboard.html');
        console.log('📊 Backend API: http://localhost:5001');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTests(); 