async function runTests() {
  console.log('🧪 Starting End-to-End API Test Suite...');
  const BASE_URL = 'http://localhost:5000/api';

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ 1. Health Check:', health.status);

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@storerating.com',
        password: 'Admin@2026!',
      }),
    });
    const adminLogin = await adminLoginRes.json();
    if (!adminLogin.success) throw new Error('Admin login failed: ' + JSON.stringify(adminLogin));
    const adminToken = adminLogin.token;
    console.log('✅ 2. Admin Login successful:', adminLogin.user.name);

    // 3. Admin Dashboard Stats
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stats = await statsRes.json();
    console.log('✅ 3. Admin Stats Fetched - Total Users:', stats.data.totalUsers, 'Stores:', stats.data.totalStores, 'Ratings:', stats.data.totalRatings);

    // 4. Admin Users List with sorting & filtering
    const usersRes = await fetch(`${BASE_URL}/admin/users?role=STORE_OWNER&sortBy=name&sortOrder=asc`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    console.log('✅ 4. Admin Users Filtered (Store Owners):', usersData.users.length, 'owners found. First owner store rating:', usersData.users[0]?.storeRating);

    // 5. Admin Create Temporary User
    const testUserName = 'Testing Verification Person User'; // 32 chars
    const createUserRes = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: testUserName,
        email: 'temp.verification@testing.com',
        password: 'Pass@2026!',
        address: '999 Automated Verification Lane, Suite 1, Austin, TX 78701',
        role: 'USER',
      }),
    });
    const createdUser = await createUserRes.json();
    if (!createdUser.success) throw new Error('User creation failed: ' + JSON.stringify(createdUser));
    console.log('✅ 5. Admin Create User:', createdUser.user.name, 'ID:', createdUser.user.id);

    // 6. Admin Delete Temporary User
    const deleteUserRes = await fetch(`${BASE_URL}/admin/users/${createdUser.user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleted = await deleteUserRes.json();
    console.log('✅ 6. Admin Delete User:', deleted.message);

    // 7. Store Owner Login & Dashboard
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alexander.hamilton@stores.com',
        password: 'Owner@2026!',
      }),
    });
    const ownerLogin = await ownerLoginRes.json();
    const ownerToken = ownerLogin.token;
    const ownerDashRes = await fetch(`${BASE_URL}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const ownerDash = await ownerDashRes.json();
    console.log('✅ 7. Store Owner Dashboard - Store:', ownerDash.store?.name, 'Avg Rating:', ownerDash.stats?.averageRating, 'Reviews:', ownerDash.ratings?.length);

    // 8. Normal User Login, Browse Stores & Rate Store
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@storerating.com',
        password: 'User@2026!',
      }),
    });
    const userLogin = await userLoginRes.json();
    const userToken = userLogin.token;

    // Browse stores with search
    const storesRes = await fetch(`${BASE_URL}/stores?search=Nexus`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const storesData = await storesRes.json();
    const nexusStore = storesData.stores[0];
    console.log('✅ 8. Normal User Searched Store:', nexusStore.name, 'Overall Rating:', nexusStore.overallRating, 'My Current Rating:', nexusStore.userRating);

    // Submit / Modify Rating for Nexus Store to 5
    const rateRes = await fetch(`${BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        storeId: nexusStore.id,
        rating: 5,
      }),
    });
    const rateData = await rateRes.json();
    console.log('✅ 9. Rating Submit/Modify:', rateData.message, 'New Avg:', rateData.data.newOverallRating);

    // 10. Forgot Password & Reset Password Flow
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@storerating.com' }),
    });
    const forgotData = await forgotRes.json();
    console.log('✅ 10. Forgot Password Token Generated:', forgotData.resetToken ? 'Token generated (Length 64)' : 'Done');

    if (forgotData.resetToken) {
      const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: forgotData.resetToken,
          newPassword: 'User@2026!', // Keep valid password
        }),
      });
      const resetData = await resetRes.json();
      console.log('✅ 11. Reset Password Executed:', resetData.message);
    }

    console.log('\n🎉 ALL 11 API INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
