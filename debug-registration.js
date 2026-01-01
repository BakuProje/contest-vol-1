#!/usr/bin/env node

/**
 * 🔍 Registration Form Debug Script
 * Helps identify and fix issues with the registration form
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Registration Form Issues...\n');

// Check 1: Verify all required files exist
const requiredFiles = [
  'src/components/RegistrationForm.tsx',
  'src/components/RegistrationFormSimple.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/pages/Index.tsx',
  'src/hooks/useGPSSecurity.ts',
  'src/hooks/useLocationPermission.ts',
  'src/assets/index.ts'
];

console.log('📁 Checking required files...');
let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Check 2: Verify imports in RegistrationForm
console.log('\n📦 Checking imports...');
try {
  const registrationFormContent = fs.readFileSync('src/components/RegistrationForm.tsx', 'utf8');
  
  const imports = [
    '@/components/ui/button',
    '@/components/ui/input',
    '@/components/ui/label',
    '@/hooks/useGPSSecurity',
    '@/hooks/useLocationPermission',
    '@/assets'
  ];
  
  imports.forEach(importPath => {
    if (registrationFormContent.includes(importPath)) {
      console.log(`  ✅ ${importPath}`);
    } else {
      console.log(`  ❌ ${importPath} - NOT FOUND`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading RegistrationForm.tsx');
}

// Check 3: Verify assets
console.log('\n🎨 Checking assets...');
try {
  const assetsContent = fs.readFileSync('src/assets/index.ts', 'utf8');
  const requiredAssets = [
    'whatsappIcon',
    'motorcycleIcon',
    'categoryIcon',
    'instagramIcon',
    'tiktokIcon'
  ];
  
  requiredAssets.forEach(asset => {
    if (assetsContent.includes(asset)) {
      console.log(`  ✅ ${asset}`);
    } else {
      console.log(`  ❌ ${asset} - NOT EXPORTED`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading assets/index.ts');
}

// Check 4: Build test
console.log('\n🏗️  Testing build...');
try {
  const { execSync } = require('child_process');
  
  console.log('  🔨 Running TypeScript check...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('  ✅ TypeScript check passed');
  
} catch (error) {
  console.log('  ❌ TypeScript errors found:');
  console.log('  ', error.stdout?.toString() || error.message);
}

// Recommendations
console.log('\n' + '='.repeat(50));
console.log('🎯 RECOMMENDATIONS:');

if (missingFiles.length > 0) {
  console.log('❌ Missing files detected - please create them');
}

console.log('✅ QUICK FIXES:');
console.log('1. Use simple form: Add ?debug=true to URL');
console.log('2. Check browser console for detailed errors');
console.log('3. Try clearing browser cache');
console.log('4. Restart development server');

console.log('\n🔗 DEBUG URLs:');
console.log('- Simple Form: http://localhost:8080/?debug=true');
console.log('- Normal Form: http://localhost:8080/');
console.log('- Admin (working): http://localhost:8080/5tladminmode');

console.log('\n📝 NEXT STEPS:');
console.log('1. Open browser console (F12)');
console.log('2. Navigate to registration page');
console.log('3. Check for JavaScript errors');
console.log('4. Report specific error messages');

console.log('='.repeat(50));