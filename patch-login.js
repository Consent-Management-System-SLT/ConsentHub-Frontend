const fs = require('fs');
let content = fs.readFileSync('src/components/auth/Login.tsx', 'utf8');

const target =               <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-600 transition-colors"
              >
                {t('auth.signUp')}
              </Link>
            </div>
          </form>;

const replacement =               <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-600 transition-colors"
              >
                {t('auth.signUp')}
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <span className="text-sm text-slate-600 block mb-2">Are you an EasyApply customer?</span>
                <Link
                  to="/customer/login"
                  className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  Sign in with Mobile Number
                </Link>
              </div>
            </div>
          </form>;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/auth/Login.tsx', content);
  console.log('Patched successfully');
} else {
  // try regex with whitespace flexibility
  const pattern = /\{\s*t\('auth\.signUp'\)\s*\}\s*<\/Link>\s*<\/div>\s*<\/form>/g;
  content = content.replace(pattern, \{t('auth.signUp')}
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <span className="text-sm text-slate-600 block mb-2">Are you an EasyApply customer?</span>
                <Link
                  to="/customer/login"
                  className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  Sign in with Mobile Number
                </Link>
              </div>
            </div>
          </form>\);
  fs.writeFileSync('src/components/auth/Login.tsx', content);
  console.log('Patched with regex');
}
