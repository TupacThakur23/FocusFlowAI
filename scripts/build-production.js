/**
 * Production Build Script for FocusFlow AI
 * 
 * Automated production build process:
 * - Environment validation
 * - Code quality checks
 * - Asset optimization
 * - Bundle generation
 * - Extension packaging
 * - Version management
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const Zip = require('adm-zip');

class ProductionBuilder {
  constructor(options = {}) {
    this.config = {
      // Build configuration
      outputPath: options.outputPath || path.join(__dirname, '../dist'),
      sourcePath: options.sourcePath || path.join(__dirname, '../src'),
      publicPath: options.publicPath || path.join(__dirname, '../public'),
      
      // Environment
      environment: options.environment || 'production',
      nodeEnv: options.nodeEnv || 'production',
      
      // Optimization
      enableMinification: options.enableMinification !== false,
      enableCompression: options.enableCompression !== false,
      enableSourceMaps: options.enableSourceMaps !== false,
      enableBundleAnalysis: options.enableBundleAnalysis !== false,
      
      // Quality gates
      enableLinting: options.enableLinting !== false,
      enableTypeChecking: options.enableTypeChecking !== false,
      enableTesting: options.enableTesting !== false,
      minCoverage: options.minCoverage || 90,
      
      // Version management
      autoVersion: options.autoVersion !== false,
      versionStrategy: options.versionStrategy || 'semantic',
      
      // Extension specific
      enableExtensionBuild: options.enableExtensionBuild !== false,
      enableStorePackage: options.enableStorePackage !== false,
      
      // Validation
      enableManifestValidation: options.enableManifestValidation !== false,
      enableSecurityAudit: options.enableSecurityAudit !== false
    };

    this.buildStartTime = Date.now();
    this.buildMetrics = {
      duration: 0,
      bundleSize: 0,
      errors: [],
      warnings: [],
      optimizations: []
    };
  }

  /**
   * Execute production build
   * @returns {Object} Build results
   */
  async build() {
    console.log('🚀 Starting production build...');
    
    try {
      // Pre-build validation
      await this.validateEnvironment();
      await this.validateDependencies();
      
      // Code quality checks
      if (this.config.enableLinting) {
        await this.runLinting();
      }
      
      if (this.config.enableTypeChecking) {
        await this.runTypeChecking();
      }
      
      if (this.config.enableTesting) {
        await this.runTests();
      }
      
      // Security audit
      if (this.config.enableSecurityAudit) {
        await this.runSecurityAudit();
      }
      
      // Clean previous build
      await this.cleanBuildDirectory();
      
      // Build application
      await this.buildApplication();
      
      // Optimize assets
      await this.optimizeAssets();
      
      // Generate extensions
      if (this.config.enableExtensionBuild) {
        await this.buildExtension();
      }
      
      // Create store package
      if (this.config.enableStorePackage) {
        await this.createStorePackage();
      }
      
      // Validate build
      await this.validateBuild();
      
      // Generate reports
      await this.generateReports();
      
      // Update version
      if (this.config.autoVersion) {
        await this.updateVersion();
      }
      
      this.buildMetrics.duration = Date.now() - this.buildStartTime;
      
      console.log('✅ Production build completed successfully!');
      return this.getBuildResults();
      
    } catch (error) {
      this.buildMetrics.errors.push({
        type: 'build_error',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      console.error('❌ Production build failed:', error);
      throw error;
    }
  }

  /**
   * Validate build environment
   */
  async validateEnvironment() {
    console.log('🔍 Validating build environment...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const minVersion = '18.0.0';
    
    if (!this.isVersionValid(nodeVersion, minVersion)) {
      throw new Error(`Node.js version ${minVersion} or higher required. Current: ${nodeVersion}`);
    }
    
    // Check required tools
    const requiredTools = ['npm', 'git'];
    for (const tool of requiredTools) {
      try {
        execSync(`${tool} --version`, { stdio: 'ignore' });
      } catch (error) {
        throw new Error(`Required tool not found: ${tool}`);
      }
    }
    
    // Check environment variables
    const requiredEnvVars = ['NODE_ENV'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Required environment variable not set: ${envVar}`);
      }
    }
    
    console.log('✅ Environment validation passed');
  }

  /**
   * Validate dependencies
   */
  async validateDependencies() {
    console.log('🔍 Validating dependencies...');
    
    try {
      // Check for security vulnerabilities
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities && audit.vulnerabilities.length > 0) {
        const highVulns = audit.vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical');
        if (highVulns.length > 0) {
          throw new Error(`Found ${highVulns.length} high/critical vulnerabilities. Run 'npm audit fix'`);
        }
      }
      
      // Check for outdated packages
      const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdated = JSON.parse(outdatedResult);
      
      if (Object.keys(outdated).length > 0) {
        console.log(`⚠️  Found ${Object.keys(outdated).length} outdated packages`);
      }
      
    } catch (error) {
      if (error.message.includes('vulnerabilities')) {
        throw error;
      }
      console.log('⚠️  Dependency validation warning:', error.message);
    }
    
    console.log('✅ Dependency validation passed');
  }

  /**
   * Run linting
   */
  async runLinting() {
    console.log('🔍 Running linting...');
    
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ Linting passed');
    } catch (error) {
      throw new Error('Linting failed. Fix linting errors before building.');
    }
  }

  /**
   * Run type checking
   */
  async runTypeChecking() {
    console.log('🔍 Running type checking...');
    
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      console.log('✅ Type checking passed');
    } catch (error) {
      throw new Error('Type checking failed. Fix type errors before building.');
    }
  }

  /**
   * Run tests
   */
  async runTests() {
    console.log('🔍 Running tests...');
    
    try {
      // Run unit tests with coverage
      const testResult = execSync('npm run test:coverage', { encoding: 'utf8' });
      
      // Extract coverage from test output
      const coverageMatch = testResult.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage < this.config.minCoverage) {
          throw new Error(`Test coverage ${coverage}% below threshold ${this.config.minCoverage}%`);
        }
      }
      
      console.log('✅ Tests passed');
    } catch (error) {
      throw new Error('Tests failed. Fix failing tests before building.');
    }
  }

  /**
   * Run security audit
   */
  async runSecurityAudit() {
    console.log('🔍 Running security audit...');
    
    try {
      const auditResult = execSync('npm audit --audit-level high', { stdio: 'pipe' });
      console.log('✅ Security audit passed');
    } catch (error) {
      throw new Error('Security audit failed. Fix security issues before building.');
    }
  }

  /**
   * Clean build directory
   */
  async cleanBuildDirectory() {
    console.log('🧹 Cleaning build directory...');
    
    if (fs.existsSync(this.config.outputPath)) {
      fs.rmSync(this.config.outputPath, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.config.outputPath, { recursive: true });
    console.log('✅ Build directory cleaned');
  }

  /**
   * Build application
   */
  async buildApplication() {
    console.log('🏗️  Building application...');
    
    const webpackConfig = this.getWebpackConfig();
    
    return new Promise((resolve, reject) => {
      const compiler = webpack(webpackConfig);
      
      compiler.run((error, stats) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (stats.hasErrors()) {
          const errorInfo = stats.toJson({ errors: true });
          reject(new Error(`Build errors: ${errorInfo.errors.join(', ')}`));
          return;
        }
        
        if (stats.hasWarnings()) {
          const warningInfo = stats.toJson({ warnings: true });
          this.buildMetrics.warnings.push(...warningInfo.warnings);
        }
        
        // Record build metrics
        const info = stats.toJson({
          assets: true,
          chunks: true,
          modules: true
        });
        
        this.buildMetrics.bundleSize = this.calculateBundleSize(info.assets);
        this.buildMetrics.optimizations.push('webpack_build');
        
        console.log('✅ Application built successfully');
        resolve(info);
      });
    });
  }

  /**
   * Get webpack configuration
   * @returns {Object} Webpack config
   */
  getWebpackConfig() {
    return {
      mode: this.config.nodeEnv,
      entry: {
        main: path.join(this.config.sourcePath, 'index.js'),
        content: path.join(this.config.publicPath, 'content.js'),
        background: path.join(this.config.publicPath, 'background.js')
      },
      output: {
        path: this.config.outputPath,
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        clean: true,
        publicPath: '/'
      },
      optimization: {
        minimize: this.config.enableMinification,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true
              }
            }
          }),
          new CssMinimizerPlugin()
        ],
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        }
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: ['@babel/plugin-transform-runtime']
              }
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader', 'postcss-loader']
          },
          {
            test: /\.(png|jpg|jpeg|gif|svg)$/i,
            type: 'asset/resource',
            generator: {
              filename: 'images/[name].[contenthash][ext]'
            }
          }
        ]
      },
      plugins: [
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                jpeg: { quality: 80 },
                webp: { quality: 80 },
                png: { quality: 80 }
              }
            }
          }
        })
      ],
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
          '@': path.resolve(this.config.sourcePath),
          '@public': path.resolve(this.config.publicPath)
        }
      },
      devtool: this.config.enableSourceMaps ? 'source-map' : false
    };
  }

  /**
   * Optimize assets
   */
  async optimizeAssets() {
    console.log('⚡ Optimizing assets...');
    
    // Optimize images
    await this.optimizeImages();
    
    // Minify CSS
    await this.minifyCSS();
    
    // Generate service worker
    await this.generateServiceWorker();
    
    this.buildMetrics.optimizations.push('asset_optimization');
    console.log('✅ Assets optimized');
  }

  /**
   * Optimize images
   */
  async optimizeImages() {
    const imageDir = path.join(this.config.outputPath, 'images');
    
    if (!fs.existsSync(imageDir)) {
      return;
    }
    
    const images = fs.readdirSync(imageDir).filter(file => 
      /\.(png|jpg|jpeg|gif|svg)$/i.test(file)
    );
    
    for (const image of images) {
      const imagePath = path.join(imageDir, image);
      // Image optimization is handled by webpack plugin
    }
  }

  /**
   * Minify CSS
   */
  async minifyCSS() {
    // CSS minification is handled by webpack plugin
    this.buildMetrics.optimizations.push('css_minification');
  }

  /**
   * Generate service worker
   */
  async generateServiceWorker() {
    const serviceWorkerContent = `
      // Service Worker for FocusFlow AI
      const CACHE_NAME = 'focusflow-ai-v${this.getVersion()}';
      const urlsToCache = [
        '/',
        '/main.js',
        '/content.js',
        '/background.js'
      ];

      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
        );
      });

      self.addEventListener('fetch', event => {
        event.respondWith(
          caches.match(event.request)
            .then(response => {
              return response || fetch(event.request);
            })
        );
      });
    `;
    
    const swPath = path.join(this.config.outputPath, 'sw.js');
    fs.writeFileSync(swPath, serviceWorkerContent);
    
    this.buildMetrics.optimizations.push('service_worker');
  }

  /**
   * Build Chrome extension
   */
  async buildExtension() {
    console.log('🔧 Building Chrome extension...');
    
    const extensionDir = path.join(this.config.outputPath, 'extension');
    fs.mkdirSync(extensionDir, { recursive: true });
    
    // Copy manifest
    await this.copyManifest(extensionDir);
    
    // Copy built files
    await this.copyBuiltFiles(extensionDir);
    
    // Copy icons
    await this.copyIcons(extensionDir);
    
    // Copy public files
    await this.copyPublicFiles(extensionDir);
    
    // Validate manifest
    if (this.config.enableManifestValidation) {
      await this.validateManifest(extensionDir);
    }
    
    this.buildMetrics.optimizations.push('extension_build');
    console.log('✅ Extension built successfully');
  }

  /**
   * Copy manifest
   */
  async copyManifest(extensionDir) {
    const manifestPath = path.join(this.config.publicPath, 'manifest.json');
    const targetPath = path.join(extensionDir, 'manifest.json');
    
    if (fs.existsSync(manifestPath)) {
      let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Update manifest for production
      manifest.version = this.getVersion();
      manifest.name = 'FocusFlow AI';
      manifest.description = 'AI-powered contextual research workspace';
      
      fs.writeFileSync(targetPath, JSON.stringify(manifest, null, 2));
    } else {
      throw new Error('Manifest file not found');
    }
  }

  /**
   * Copy built files
   */
  async copyBuiltFiles(extensionDir) {
    const builtFiles = ['main.js', 'content.js', 'background.js'];
    
    for (const file of builtFiles) {
      const sourcePath = path.join(this.config.outputPath, file);
      const targetPath = path.join(extensionDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * Copy icons
   */
  async copyIcons(extensionDir) {
    const iconDir = path.join(extensionDir, 'icons');
    fs.mkdirSync(iconDir, { recursive: true });
    
    const iconSizes = [16, 48, 128, 512];
    
    for (const size of iconSizes) {
      const sourceIcon = path.join(this.config.publicPath, 'icons', `icon-${size}.png`);
      const targetIcon = path.join(iconDir, `icon-${size}.png`);
      
      if (fs.existsSync(sourceIcon)) {
        fs.copyFileSync(sourceIcon, targetIcon);
      }
    }
  }

  /**
   * Copy public files
   */
  async copyPublicFiles(extensionDir) {
    const publicFiles = ['popup.html', 'popup.js', 'popup.css', 'options.html', 'options.js', 'options.css'];
    
    for (const file of publicFiles) {
      const sourcePath = path.join(this.config.publicPath, file);
      const targetPath = path.join(extensionDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * Validate manifest
   */
  async validateManifest(extensionDir) {
    const manifestPath = path.join(extensionDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Required fields
    const requiredFields = ['manifest_version', 'name', 'version'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`Missing required manifest field: ${field}`);
      }
    }
    
    // Manifest version
    if (manifest.manifest_version !== 3) {
      throw new Error('Manifest must be version 3');
    }
    
    console.log('✅ Manifest validation passed');
  }

  /**
   * Create store package
   */
  async createStorePackage() {
    console.log('📦 Creating Chrome Web Store package...');
    
    const extensionDir = path.join(this.config.outputPath, 'extension');
    const packagePath = path.join(this.config.outputPath, 'focusflow-ai-store.zip');
    
    if (!fs.existsSync(extensionDir)) {
      throw new Error('Extension directory not found');
    }
    
    const zip = new Zip();
    zip.addLocalFolder(extensionDir);
    zip.writeZip(packagePath);
    
    this.buildMetrics.optimizations.push('store_package');
    console.log('✅ Store package created');
  }

  /**
   * Validate build
   */
  async validateBuild() {
    console.log('🔍 Validating build...');
    
    // Check output directory exists
    if (!fs.existsSync(this.config.outputPath)) {
      throw new Error('Build output directory not found');
    }
    
    // Check essential files
    const essentialFiles = ['main.js', 'content.js', 'background.js'];
    for (const file of essentialFiles) {
      const filePath = path.join(this.config.outputPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Essential file not found: ${file}`);
      }
    }
    
    // Check bundle size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (this.buildMetrics.bundleSize > maxSize) {
      throw new Error(`Bundle size ${this.buildMetrics.bundleSize} exceeds limit ${maxSize}`);
    }
    
    console.log('✅ Build validation passed');
  }

  /**
   * Generate reports
   */
  async generateReports() {
    console.log('📊 Generating build reports...');
    
    const reports = {
      build: this.getBuildResults(),
      bundle: await this.generateBundleReport(),
      security: await this.generateSecurityReport()
    };
    
    const reportsDir = path.join(this.config.outputPath, 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    
    // Write reports
    fs.writeFileSync(
      path.join(reportsDir, 'build-report.json'),
      JSON.stringify(reports, null, 2)
    );
    
    if (this.config.enableBundleAnalysis) {
      await this.generateBundleAnalysis();
    }
    
    console.log('✅ Reports generated');
  }

  /**
   * Generate bundle report
   * @returns {Object} Bundle report
   */
  async generateBundleReport() {
    const bundleDir = this.config.outputPath;
    const files = fs.readdirSync(bundleDir);
    
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    return {
      jsFiles: jsFiles.map(file => ({
        name: file,
        size: fs.statSync(path.join(bundleDir, file)).size
      })),
      cssFiles: cssFiles.map(file => ({
        name: file,
        size: fs.statSync(path.join(bundleDir, file)).size
      })),
      totalSize: this.buildMetrics.bundleSize
    };
  }

  /**
   * Generate security report
   * @returns {Object} Security report
   */
  async generateSecurityReport() {
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      return {
        vulnerabilities: audit.vulnerabilities || [],
        metadata: audit.metadata || {}
      };
    } catch (error) {
      return {
        vulnerabilities: [],
        error: error.message
      };
    }
  }

  /**
   * Generate bundle analysis
   */
  async generateBundleAnalysis() {
    try {
      execSync('npx webpack-bundle-analyzer dist/*.js --mode json --report dist/reports/bundle-analysis.json');
      this.buildMetrics.optimizations.push('bundle_analysis');
    } catch (error) {
      console.log('⚠️  Bundle analysis failed:', error.message);
    }
  }

  /**
   * Update version
   */
  async updateVersion() {
    console.log('🏷️  Updating version...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const currentVersion = packageJson.version;
    const newVersion = this.incrementVersion(currentVersion);
    
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Commit version change
    try {
      execSync(`git add package.json`);
      execSync(`git commit -m "chore: bump version to ${newVersion}"`);
      execSync(`git tag v${newVersion}`);
      
      this.buildMetrics.optimizations.push('version_update');
      console.log(`✅ Version updated to ${newVersion}`);
    } catch (error) {
      console.log('⚠️  Failed to commit version change:', error.message);
    }
  }

  /**
   * Get current version
   * @returns {string} Version
   */
  getVersion() {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  }

  /**
   * Increment version
   * @param {string} currentVersion - Current version
   * @returns {string} New version
   */
  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }

  /**
   * Calculate bundle size
   * @param {Array} assets - Webpack assets
   * @returns {number} Total size
   */
  calculateBundleSize(assets) {
    return assets.reduce((total, asset) => total + asset.size, 0);
  }

  /**
   * Check if version is valid
   * @param {string} current - Current version
   * @param {string} minimum - Minimum version
   * @returns {boolean} Valid
   */
  isVersionValid(current, minimum) {
    const currentParts = current.replace('v', '').split('.').map(Number);
    const minimumParts = minimum.replace('v', '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, minimumParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const minimumPart = minimumParts[i] || 0;
      
      if (currentPart > minimumPart) return true;
      if (currentPart < minimumPart) return false;
    }
    
    return true;
  }

  /**
   * Get build results
   * @returns {Object} Build results
   */
  getBuildResults() {
    return {
      success: this.buildMetrics.errors.length === 0,
      duration: this.buildMetrics.duration,
      bundleSize: this.buildMetrics.bundleSize,
      errors: this.buildMetrics.errors,
      warnings: this.buildMetrics.warnings,
      optimizations: this.buildMetrics.optimizations,
      version: this.getVersion(),
      timestamp: Date.now()
    };
  }
}

// Export for use in other scripts
module.exports = ProductionBuilder;

// Run build if called directly
if (require.main === module) {
  const builder = new ProductionBuilder();
  builder.build()
    .then(results => {
      console.log('Build completed:', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('Build failed:', error);
      process.exit(1);
    });
}
