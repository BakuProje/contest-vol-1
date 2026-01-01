#!/usr/bin/env node

/**
 * 🔍 Pre-Deployment Check Script
 * Validates project before deployment to catch issues early
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment checks...\n');

let hasErrors = false;

// Check 1: Required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'vercel.json',
  '.env.example',
  'src/main.tsx',
  'src/App.tsx',
  'index.html'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

// Check 2: Environment variables
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredEnvVars = [
    'VITE_SUPABASE_PROJECT_ID',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`  ✅ ${envVar}`);
    } else {
      console.log(`  ❌ ${envVar} - MISSING`);
      hasErrors = true;
    }
  });
} else {
  console.log('  ❌ .env file not found');
  hasErrors = true;
}

// Check 3: Package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'preview'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ ${script} script`);
    } else {
      console.log(`  ❌ ${script} script - MISSING`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading package.json');
  hasErrors = true;
}

// Check 4: Build test
console.log('\n🏗️  Testing build process...');
try {
  const { execSync } = require('child_process');
  
  console.log('  📦 Installing dependencies...');
  execSync('npm install', { stdio: 'pipe' });
  console.log('  ✅ Dependencies installed');
  
  console.log('  🔨 Running build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('  ✅ Build successful');
  
  // Check if dist folder was created
  if (fs.existsSync('dist')) {
    console.log('  ✅ dist folder created');
    
    // Check if index.html exists in dist
    if (fs.existsSync('dist/index.html')) {
      console.log('  ✅ index.html generated');
    } else {
      console.log('  ❌ index.html not found in dist');
      hasErrors = true;
    }
  } else {
    console.log('  ❌ dist folder not created');
    hasErrors = true;
  }
  
} catch (error) {
  console.log('  ❌ Build failed');
  console.log(`  Error: ${error.message}`);
  hasErrors = true;
}

// Check 5: TypeScript compilation
console.log('\n🔍 Checking TypeScript...');
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('  ✅ TypeScript compilation successful');
} catch (error) {
  console.log('  ❌ TypeScript errors found');
  hasErrors = true;
}

// Final result
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Pre-deployment checks FAILED');
  console.log('Please fix the issues above before deploying.');
  process.exit(1);
} else {
  console.log('✅ All pre-deployment checks PASSED');
  console.log('🚀 Project is ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Run: git add .');
  console.log('2. Run: git commit -m "Ready for deployment"');
  console.log('3. Run: git push origin main');
  console.log('4. Deploy on Vercel');
}
console.log('='.repeat(50));