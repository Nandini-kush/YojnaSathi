#!/usr/bin/env node

/**
 * Frontend Setup Verification Script
 * Checks if all required files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

const requiredFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/vite-env.d.ts',
  'src/styles/index.css',
  'src/lib/api.ts',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/landing/HeroSection.tsx',
  'src/components/landing/FeaturesSection.tsx',
  'src/components/landing/HowItWorksSection.tsx',
  'src/components/landing/CTASection.tsx',
  'src/components/landing/TestimonialsSection.tsx',
  'src/components/admin/SchemeDialog.tsx',
  'src/components/admin/DeleteSchemeDialog.tsx',
  'src/components/ui/NavLink.tsx',
  '.env',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
];

const requiredDependencies = [
  'react',
  'react-dom',
  'react-router-dom',
  'axios',
  'zustand',
  'framer-motion',
  'lucide-react',
  '@tanstack/react-query',
  'tailwindcss',
];

console.log(`${BLUE}🔍 YojnaSathi Frontend Setup Verification${RESET}\n`);

// Check files
console.log(`${BLUE}📁 Checking required files...${RESET}`);
let filesOk = true;
requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(
    `${exists ? GREEN : RED}${exists ? '✓' : '✗'} ${file}${RESET}`
  );
  if (!exists) filesOk = false;
});

console.log();

// Check package.json dependencies
console.log(`${BLUE}📦 Checking dependencies...${RESET}`);
const packageJson = require(path.join(__dirname, '..', 'package.json'));
let depsOk = true;
requiredDependencies.forEach((dep) => {
  const exists =
    packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`${exists ? GREEN : RED}${exists ? '✓' : '✗'} ${dep}${RESET}`);
  if (!exists) depsOk = false;
});

console.log();

// Check Node modules
console.log(`${BLUE}🔗 Checking node_modules...${RESET}`);
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const nodeModulesExists = fs.existsSync(nodeModulesPath);
console.log(
  `${nodeModulesExists ? GREEN : YELLOW}${nodeModulesExists ? '✓' : '!'} node_modules ${nodeModulesExists ? 'exists' : 'not installed'}${RESET}`
);

console.log();

// Summary
console.log(`${BLUE}📋 Summary${RESET}`);
if (filesOk && depsOk && nodeModulesExists) {
  console.log(
    `${GREEN}✓ All checks passed! Frontend is ready to run.${RESET}`
  );
  console.log();
  console.log(`${YELLOW}Next steps:${RESET}`);
  console.log(`  1. Start backend: cd app && python -m uvicorn main:app --reload`);
  console.log(`  2. Start frontend: npm run dev`);
  console.log(`  3. Open browser: http://localhost:5173`);
} else {
  console.log(
    `${RED}✗ Some checks failed. Please review the output above.${RESET}`
  );
  if (!nodeModulesExists) {
    console.log();
    console.log(`${YELLOW}To install dependencies, run:${RESET}`);
    console.log(`  npm install`);
  }
}
