#!/usr/bin/env node

/**
 * Build Installer Script
 *
 * This script automates the process of building the Astrante Theme installer:
 * 1. Runs the project build (npm run build)
 * 2. Compiles the Inno Setup installer
 *
 * Requirements:
 * - Node.js
 * - Inno Setup 6.x installed
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const installerDir = __dirname;

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logStep(step) {
    log(`\n${colors.bright}${colors.cyan}[Step] ${step}${colors.reset}\n`);
}

function logSuccess(message) {
    log(`✓ ${message}`, colors.green);
}

function logError(message) {
    log(`✗ ${message}`, colors.red);
}

function execCommand(command, description) {
    try {
        logStep(description);
        execSync(command, {
            cwd: projectRoot,
            stdio: 'inherit',
            shell: true
        });
        logSuccess(`${description} - OK`);
        return true;
    } catch (error) {
        logError(`${description} - FAILED`);
        return false;
    }
}

// Check if Inno Setup is installed and return ISCC path
function findInnoSetup() {
    logStep('Checking Inno Setup installation');

    const possiblePaths = [
        'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
        'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
        'C:\\Program Files (x86)\\Inno Setup 5\\ISCC.exe',
        'C:\\Program Files\\Inno Setup 5\\ISCC.exe',
    ];

    // Try to find ISCC in PATH first
    try {
        execSync('where ISCC.exe', { stdio: 'ignore' });
        logSuccess('Inno Setup found in PATH');
        return 'ISCC.exe';
    } catch {
        // Not in PATH, check common locations
        for (const path of possiblePaths) {
            if (existsSync(path)) {
                logSuccess(`Inno Setup found at: ${path}`);
                return path;
            }
        }
    }

    // Not found
    logError('Inno Setup not found!');
    log(`\n${colors.yellow}Please install Inno Setup:${colors.reset}`);
    log(`  🔗 https://jrsoftware.org/isdl.php\n`);
    log(`After installation:`);
    log(`  1. Restart your terminal, OR`);
    log(`  2. Make sure it's installed in a standard location:\n`);
    possiblePaths.forEach(path => log(`     ${path}`));
    log('');
    return null;
}

// Main build process
async function buildInstaller() {
    log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           Astrante Theme Installer Builder                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

    // Find Inno Setup
    const isccPath = findInnoSetup();
    if (!isccPath) {
        process.exit(1);
    }

    // Build the project
    const buildSuccess = execCommand('npm run build', 'Building project');

    if (!buildSuccess) {
        logError('\nProject build failed. Please fix the errors above and try again.');
        process.exit(1);
    }

    // Check if dist folder exists
    const distPath = resolve(projectRoot, 'dist');
    if (!existsSync(distPath)) {
        logError('Build output folder "dist" not found!');
        process.exit(1);
    }

    // Build the installer
    const installerScript = resolve(installerDir, 'installer.iss');

    if (!existsSync(installerScript)) {
        logError(`Installer script not found: ${installerScript}`);
        process.exit(1);
    }

    const compileSuccess = execCommand(
        `"${isccPath}" "${installerScript}"`,
        'Compiling installer with Inno Setup'
    );

    if (!compileSuccess) {
        logError('\nInstaller compilation failed!');
        process.exit(1);
    }

    // Success!
    log(`\n${colors.bright}${colors.green}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              ✓ BUILD SUCCESSFUL!                          ║
║                                                           ║
║   The installer has been created in the                  ║
║   installer/output folder.                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}\n`);

    const outputPath = resolve(installerDir, 'output', 'AstranteTheme-Installer.exe');
    log(`Installer location: ${outputPath}\n`, colors.cyan);
}

// Run the build
buildInstaller().catch(error => {
    logError(`\nUnexpected error: ${error.message}`);
    process.exit(1);
});
