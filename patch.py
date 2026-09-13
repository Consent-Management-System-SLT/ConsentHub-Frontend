import re

with open('src/components/auth/Login.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"(\{t\('auth\.signUp'\)\}\s*</Link>\s*</div>)\s*</form>"

replacement = r'''\1
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
          </form>'''

new_content = re.sub(pattern, replacement, content)

with open('src/components/auth/Login.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patched.")
