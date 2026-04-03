// ============================================
// 🔐 UNIADMIN LOGIN
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1️⃣ CONFIGURATION SUPABASE
    // ============================================
    const SUPABASE_URL = 'https://mxemardtyidrhfsnxvad.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZW1hcmR0eWlkcmhmc254dmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzkwMzQsImV4cCI6MjA4ODQ1NTAzNH0.u1eFWdodluIqZQ-_Cr5IzSNMNUE1H4GQU-oDYT4Z1oo';
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ UniAdmin Supabase initialized');

    // ============================================
    // 2️⃣ TOGGLE PASSWORD VISIBILITY
    // ============================================
    const togglePassword = document.getElementById('toggleAdminPassword');
    const passwordInput = document.getElementById('adminPassword');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            const icon = togglePassword.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    }

    // ============================================
    // 3️⃣ ERROR DISPLAY FUNCTION
    // ============================================
    const showError = (message) => {
        const errorEl = document.getElementById('adminLoginError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            console.error('❌', message);
            
            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 5000);
        }
    };

    // ============================================
    // 4️⃣ CHECK IF ADMIN ALREADY LOGGED IN
    // ============================================
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            const adminId = localStorage.getItem('admin_id');
            if (adminId) {
                console.log('✅ Admin already logged in, redirecting...');
                window.location.href = 'index.html';
            }
        }
    });

    // ============================================
    // 5️⃣ MAIN LOGIN FUNCTION
    // ============================================
    const form = document.getElementById('adminLoginForm');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form) {
        console.error('❌ Admin login form not found!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value.trim();

        const errorEl = document.getElementById('adminLoginError');
        if (errorEl) errorEl.classList.add('hidden');

        // Validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Disable button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
        }

        try {
            console.log('=== 🔐 ADMIN LOGIN ATTEMPT ===');
            console.log('Email:', email);

            // Step 1: Authenticate with Supabase
            const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                console.error('Auth Error:', authError);
                showError('Invalid email or password');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOGIN';
                }
                return;
            }

            if (!authData.user) {
                showError('User not found');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOGIN';
                }
                return;
            }

            console.log('✅ Authentication successful - User ID:', authData.user.id);

            // Step 2: Verify admin role from profiles table
            const { data: adminProfile, error: adminError } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .eq('role', 'admin')
                .single();

            if (adminError || !adminProfile) {
                console.error('Admin verification failed:', adminError);
                showError('Access denied. Admin privileges required.');
                await supabaseClient.auth.signOut();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOGIN';
                }
                return;
            }

            console.log('✅ Admin verified:', {
                admin_id: adminProfile.id,
                name: `${adminProfile.first_name} ${adminProfile.last_name}`,
                email: adminProfile.email,
                role: adminProfile.role
            });

            // Step 3: Store admin data in localStorage
            const adminData = {
                admin_id: adminProfile.id,
                last_name: adminProfile.last_name,
                first_name: adminProfile.first_name,
                email: adminProfile.email,
                role: adminProfile.role,
                supabase_user_id: authData.user.id,
                login_time: new Date().toISOString()
            };
            
            Object.entries(adminData).forEach(([key, value]) => {
                if (value) localStorage.setItem(key, value);
            });
            
            console.log('✅ Admin data stored successfully');

            // Step 4: Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);

        } catch (err) {
            console.error('💥 Fatal error:', err);
            showError('Technical error: ' + err.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'LOGIN';
            }
        }
    });

//Dark mood

     (function() {
            const themeToggle = document.getElementById('theme-toggle');
            const themeIcon = document.getElementById('theme-icon');
            const html = document.documentElement;
            
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                html.classList.add('dark');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }
            
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    if (html.classList.contains('dark')) {
                        html.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                        if (themeIcon) {
                            themeIcon.classList.remove('fa-sun');
                            themeIcon.classList.add('fa-moon');
                        }
                    } else {
                        html.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                        if (themeIcon) {
                            themeIcon.classList.remove('fa-moon');
                            themeIcon.classList.add('fa-sun');
                        }
                    }
                });
            }
        })();
});