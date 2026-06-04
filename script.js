const ASSET_VERSION = "20260604";

function versionedAsset(path) {
    if (!path || !path.startsWith('assets/')) return path;
    return path.includes('?') ? path : `${path}?v=${ASSET_VERSION}`;
}

function versionProjectImageSrcs(root = document) {
    root.querySelectorAll('img[src^="assets/"]').forEach(img => {
        img.src = versionedAsset(img.getAttribute('src'));
    });
}

// ====================== LOADING ======================

function showLoadingAnimation() {
    const loading = document.getElementById('loading-screen');
    loading.style.display = 'flex';
    loading.setAttribute('aria-hidden', 'false');
}
function hideLoadingAnimation() {
    const loading = document.getElementById('loading-screen');
    loading.style.display = 'none';
    loading.setAttribute('aria-hidden', 'true');
}

// ====================== JUMP TO SECTION ======================
let loadedSections = {};
function jumpToSection(sectionId) {
    if (!loadedSections[sectionId]) {
        showLoadingAnimation();
        createSection(sectionId);
        loadedSections[sectionId] = true;
        setTimeout(() => {
            hideLoadingAnimation();
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }, 400);
    } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
}

// ====================== CREATE SECTIONS ======================
function createSection(sectionId) {
    const section = document.createElement('section');
    section.id = sectionId;
    let html = '';

    if (sectionId === 'about') {
    html = `
        <div class="about-section">
            <h1>ABOUT ME</h1>
            <p>Hi, I'm Wei Rong. I'm a Mathematics student who enjoys building software systems that model, visualize, or interact with complex ideas. My projects often sit between technical tools and interactive experiences, whether that means simulating economies and ecosystems, building game engines and editors, or creating finance and data-driven applications.</p>
            
            <img src="assets/images/sky.jpg" alt="Me">

            <h1>What I Like Building</h1>
            <p>I like projects where the logic underneath matters just as much as what appears on screen. I'm drawn to systems with moving parts: simulations with emergent behavior, tools that turn data into decisions, and interactive applications where design choices affect how users understand the system. Across game development, data, and finance-related work, I enjoy taking abstract rules and turning them into something usable, visual, and testable.</p>

            <button class="collapsible">🎓 Education</button>
            <div class="content">
                <p><strong>Bachelor of Honours Mathematics, Co-operative Program</strong><br>University of Waterloo</p>
            </div>

            <button class="collapsible">🎨 Hobbies</button>
            <div class="content">
                <p>Outside of programming, I enjoy reading, gaming, and watching shows. I'm often interested in how worlds, systems, and stories are structured, which also influences the way I think about projects, interfaces, and user experience.</p>
            </div>
        </div>`;
    }

    else if (sectionId === 'current') {
        html = `
            <div class="current-container">
                <h1>CURRENTLY WORKING ON</h1>
                <p class="current-intro">A small look at the larger projects I am building next.</p>

                <div class="current-grid">
                    <article class="current-card current-card-world">
                        <div class="current-card-header">
                            <span class="current-tag">C++ • Simulation • Procedural Generation</span>
                            <h2>Procedural World Generation System</h2>
                            <p>A large-scale simulation project focused on generating living worlds with terrain, settlements, resources, cultures, factions, and long-term world history. The goal is to create a world where geography, population growth, conflict, trade, and decision-making interact over time to produce emergent outcomes.</p>
                        </div>

                        <div class="current-feature-grid">
                            <div class="current-feature-group">
                                <h3>World Generation</h3>
                                <ul>
                                    <li>Procedural terrain, biomes, rivers, resources, and settlement placement</li>
                                    <li>Region-based map systems for inspecting land, borders, and generated history</li>
                                </ul>
                            </div>

                            <div class="current-feature-group">
                                <h3>Simulation Systems</h3>
                                <ul>
                                    <li>Population, factions, economy, expansion, and conflict systems</li>
                                    <li>Long-term historical events shaped by resources, geography, and faction behavior</li>
                                </ul>
                            </div>

                            <div class="current-feature-group">
                                <h3>Technical Focus</h3>
                                <ul>
                                    <li>Data-driven rules for tuning world behavior without rewriting core logic</li>
                                    <li>Visualization tools for debugging and understanding generated worlds</li>
                                </ul>
                            </div>
                        </div>
                    </article>

                    <article class="current-card current-card-stock">
                        <div class="current-card-header">
                            <span class="current-tag">Web App • Finance • Data</span>
                            <h2>Stock Research Platform</h2>
                            <p>A web application for researching companies, organizing investment notes, comparing businesses, and building simple valuation assumptions. The project is designed around making company research easier to track over time instead of keeping analysis scattered across spreadsheets and notes.</p>
                        </div>

                        <div class="current-feature-grid">
                            <div class="current-feature-group">
                                <h3>Frontend</h3>
                                <ul>
                                    <li>Company search, financial statement pages, ratio dashboard, and watchlist</li>
                                    <li>Notes system, comparison view, and valuation model page</li>
                                </ul>
                            </div>

                            <div class="current-feature-group">
                                <h3>Backend</h3>
                                <ul>
                                    <li>Company database, financial statement storage, and search indexing</li>
                                    <li>Notes/watchlist system and scheduled data fetch jobs</li>
                                </ul>
                            </div>

                            <div class="current-feature-group">
                                <h3>Research Features</h3>
                                <ul>
                                    <li>Compare companies side-by-side and auto-calculate financial ratios</li>
                                    <li>Save investment thesis notes, build simple DCF assumptions, and track thesis changes over time</li>
                                </ul>
                            </div>
                        </div>
                    </article>
                </div>
            </div>`;
    }

    else if (sectionId === 'projects') {
    html = `
        <div class="projects-container">
            <h1 style="text-align:center;color:#00acc1;">PROJECTS</h1>
            <p class="projects-intro">Browse projects by area instead of scanning one long list.</p>
            <div class="project-filter-bar" aria-label="Project filters">
                <button type="button" class="project-filter active" data-filter="all">All</button>
                <button type="button" class="project-filter" data-filter="game-graphics">Game & Graphics</button>
                <button type="button" class="project-filter" data-filter="finance-data">Finance & Data</button>
                <button type="button" class="project-filter" data-filter="simulation">Simulation</button>
                <button type="button" class="project-filter" data-filter="tools-systems">Tools & Systems</button>
            </div>
            <!-- 3D Graphics Rasterizer -->
            <div class="project-item" data-category="game-graphics tools-systems" onclick="toggleProjectDetails('graphics-rasterizer')">
                <img loading="lazy" decoding="async" src="assets/images/projects/3d-graphics-rasterizer/textured.png" alt="Rasterizer">
                <div><h2>3D Graphics Rasterizer</h2><p>From-scratch software 3D renderer with full pipeline and live GUI.</p></div>
                <div class="project-details" id="graphics-rasterizer">
                    <p><strong>Languages:</strong> C++</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Built a complete rasterization pipeline from vertex processing to fragment shading</li>
                            <li>Implemented accurate triangle rasterization with barycentric interpolation</li>
                            <li>Developed a custom shader pipeline supporting diffuse, normal, and specular mapping</li>
                            <li>Added Phong lighting model for realistic shading and highlights</li>
                            <li>Integrated ImGui for real-time parameter tweaking without recompilation</li>
                            <li>Used TGAImage library for texture loading</li>
                            <li>Optimized performance with backface culling</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C++ • SDL2 • ImGui • TGAImage • Catch2</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/software-rasterizer" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/3d-graphics-rasterizer/textured.png"><img loading="lazy" decoding="async" src="assets/images/projects/3d-graphics-rasterizer/normal_map.png"><img loading="lazy" decoding="async" src="assets/images/projects/3d-graphics-rasterizer/Wireframe.png"><img loading="lazy" decoding="async" src="assets/images/projects/3d-graphics-rasterizer/specular.png"></div>
                </div>
            </div>

            <!-- Custom ECS Game Engine -->
            <div class="project-item" data-category="game-graphics tools-systems" onclick="toggleProjectDetails('custom-ecs-game-engine')">
                <img loading="lazy" decoding="async" src="assets/images/projects/custom-ecs-game-engine/editor.png" alt="Custom ECS Game Engine">
                <div>
                    <h2>Custom ECS Game Engine</h2>
                    <p>Lightweight C++ game engine with ECS architecture, editor tooling, Lua scripting, scene serialization, and runtime export.</p>
                </div>
                <div class="project-details" id="custom-ecs-game-engine">
                    <p><strong>Languages:</strong> C++, Lua</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Built modular C++20 engine architecture with ECS-based scene, entity, and component management</li>
                            <li>Created ImGui editor with scene hierarchy, inspector, viewport, asset browser, prefab browser, and runtime preview</li>
                            <li>Implemented JSON scene/prefab serialization with save/load workflows and reusable entity prefabs</li>
                            <li>Added Lua scripting, animation, audio playback, physics/collision, undo/redo, and event systems</li>
                            <li>Developed resource manager with texture/audio caching and PNG/JPG/BMP asset loading</li>
                            <li>Built standalone runtime/export pipeline to separate editor tooling from playable game builds</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C++20, CMake, SDL2, OpenGL, ImGui, Lua, EnTT, GLM, JSON, stb_image</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/CustomECSEngine" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/custom-ecs-game-engine/editor.png"><img loading="lazy" decoding="async" src="assets/images/projects/custom-ecs-game-engine/prefab.png"><img loading="lazy" decoding="async" src="assets/images/projects/custom-ecs-game-engine/transform.png"><img loading="lazy" decoding="async" src="assets/images/projects/custom-ecs-game-engine/animation.png"></div>
                </div>
            </div>
            <!-- Procedural Terrain Generator -->
            <div class="project-item" data-category="game-graphics simulation" onclick="toggleProjectDetails('procedural-terrain-generator')">
                <img loading="lazy" decoding="async" src="assets/images/projects/procedural-terrain-generator/mount.png" alt="Procedural Terrain">
                <div><h2>Procedural Terrain Generator</h2><p>Real-time 3D terrain engine with infinite streaming and erosion simulation.</p></div>
                <div class="project-details" id="procedural-terrain-generator">
                    <p><strong>Languages:</strong> TypeScript</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Built multi-layer noise generation with domain warping for natural landforms</li>
                            <li>Implemented level-of-detail system for performance at large scales</li>
                            <li>Added hydraulic erosion simulation for realistic terrain shaping</li>
                            <li>Developed infinite terrain streaming with dynamic chunk loading</li>
                            <li>Created biome blending using temperature and moisture maps</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>TypeScript • React • Three.js • WebGL • Vite</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/procedural-terrain-generator" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/procedural-terrain-generator/mount.png"><img loading="lazy" decoding="async" src="assets/images/projects/procedural-terrain-generator/island.png"><img loading="lazy" decoding="async" src="assets/images/projects/procedural-terrain-generator/desert.png"></div>
                </div>
            </div>
            
            <!-- World Economy Simulator -->
            <div class="project-item" data-category="simulation finance-data" onclick="toggleProjectDetails('world-economy-simulator')">
                <img loading="lazy" decoding="async" src="assets/images/projects/world-economy-simulator/eco1.png" alt="World Economy">
                <div><h2>World Economy Simulator</h2><p>Interactive multi-country economic simulation with trade networks and AI policies.</p></div>
                <div class="project-details" id="world-economy-simulator">
                    <p><strong>Languages:</strong> TypeScript</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Designed multi-country economic modeling including production, trade, inflation and migration</li>
                            <li>Implemented bilateral trade networks with dynamic dependencies</li>
                            <li>Built AI policy system that adjusts taxes, subsidies and investments in real time</li>
                            <li>Added stochastic event engine with seeded randomness for crises and booms</li>
                            <li>Created real-time data visualization and automated economic insights</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>TypeScript • React • Chart.js</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/world-economy-simulator" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/world-economy-simulator/eco1.png"><img loading="lazy" decoding="async" src="assets/images/projects/world-economy-simulator/eco2.png"><img loading="lazy" decoding="async" src="assets/images/projects/world-economy-simulator/eco3.png"><img loading="lazy" decoding="async" src="assets/images/projects/world-economy-simulator/eco4.png"></div>
                </div>
            </div>

            <!-- Algorithmic Trading Backtester -->
            <div class="project-item" data-category="finance-data" onclick="toggleProjectDetails('algorithmic-trading-backtester')">
                <img loading="lazy" decoding="async" src="assets/images/projects/algorithmic-trading-backtester/charts.png" alt="Algorithmic Trading Backtester">
                <div><h2>Algorithmic Trading Backtester</h2><p>Interactive trading strategy backtester with portfolio analytics, custom rule building and risk reporting.</p></div>
                <div class="project-details" id="algorithmic-trading-backtester">
                    <p><strong>Languages:</strong> Python</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Developed modular backtesting engine supporting equities, multi-asset portfolios, transaction costs and benchmark comparison</li>
                            <li>Implemented technical strategies including RSI, MACD, Bollinger Bands, momentum, mean reversion and pairs trading</li>
                            <li>Built custom no-code strategy builder with rule validation, signal diagnostics and preset templates</li>
                            <li>Added portfolio analytics including Sharpe ratio, Sortino ratio, beta, VaR, CVaR, max drawdown and win-rate metrics</li>
                            <li>Created interactive Streamlit dashboard for strategy comparison, parameter optimization, trade visualization and automated reporting</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>Python • Pandas • NumPy • Plotly • Streamlit • Pytest</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/algorithmic-trading-backtester" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid">
                        <img loading="lazy" decoding="async" src="assets/images/projects/algorithmic-trading-backtester/charts.png">
                        <img loading="lazy" decoding="async" src="assets/images/projects/algorithmic-trading-backtester/charts-more.png">
                        <img loading="lazy" decoding="async" src="assets/images/projects/algorithmic-trading-backtester/custom.png">
                        <img loading="lazy" decoding="async" src="assets/images/projects/algorithmic-trading-backtester/signal.png">
                        <img loading="lazy" decoding="async" src="assets/images/projects/algorithmic-trading-backtester/weights.png">
                    </div>
                </div>
            </div>

            <!-- Neural Network from Scratch -->
            <div class="project-item" data-category="finance-data tools-systems" onclick="toggleProjectDetails('neural-network-from-scratch')">
                <img loading="lazy" decoding="async" src="assets/images/projects/neural-network-from-scratch/learn1.png" alt="NN from Scratch">
                <div><h2>Neural Network from Scratch</h2><p>Complete neural network built from scratch in NumPy that evolves into a full MNIST classifier with training visualizations, experiments, and a polished installable CLI tool.</p></div>
                <div class="project-details" id="neural-network-from-scratch">
                    <p><strong>Languages:</strong> Python</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Implemented a fully modular neural network from scratch using pure NumPy, including dense layers, activations, loss, and backpropagation</li>
                            <li>Built a reusable NeuralNetwork class that supports any architecture defined via CLI flags</li>
                            <li>Added full MNIST loading, preprocessing, and training pipeline with automatic data download</li>
                            <li>Integrated Matplotlib visualizations that automatically generate loss and accuracy plots after training</li>
                            <li>Developed a complete CLI interface using argparse so the tool can be installed and run with simple commands like nn-scratch train</li>
                            <li>Added experiment mode for comparing activations, learning rates, and other hyperparameters directly from the terminal</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>Python • NumPy • Matplotlib • Streamlit</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/nn-from-scratch-cli" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                        <div class="project-images-grid">
                            <img loading="lazy" decoding="async" src="assets/images/projects/neural-network-from-scratch/learn1.png">
                            <img loading="lazy" decoding="async" src="assets/images/projects/neural-network-from-scratch/learn2.png">
                            <img loading="lazy" decoding="async" src="assets/images/projects/neural-network-from-scratch/learn3.png">
                        </div>
                    </div>
                </div>

            
            <!-- Procedural Dungeon Map Generator -->
            <div class="project-item" data-category="game-graphics simulation" onclick="toggleProjectDetails('procedural-dungeon-map-generator')">
                <img loading="lazy" decoding="async" src="assets/images/projects/procedural-dungeon-map-generator/dun1.png" alt="Dungeon Gen">
                <div><h2>Procedural Dungeon Map Generator</h2><p>Real-time procedural dungeon system with multiple algorithms and live analytics.</p></div>
                <div class="project-details" id="procedural-dungeon-map-generator">
                    <p><strong>Languages:</strong> C++</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Implemented five generation algorithms including BSP, Cellular Automata, Drunkard’s Walk, Recursive Backtracker and Random Rooms</li>
                            <li>Built live SDL2 renderer with pan, zoom and overlay analytics</li>
                            <li>Added real-time map statistics for floor coverage, connectivity and largest region</li>
                            <li>Enabled keyboard-controlled parameter tweaking and instant algorithm switching</li>
                            <li>Created JSON export system using nlohmann::json for map persistence</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C++17/20 • SDL2 • SDL2_ttf • nlohmann::json • Multithreading</li>
                        </ul>
                    </div>
                     <a href="https://github.com/wrgdevs/dungeonMapGen" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/procedural-dungeon-map-generator/dun1.png"><img loading="lazy" decoding="async" src="assets/images/projects/procedural-dungeon-map-generator/dun2.png"><img loading="lazy" decoding="async" src="assets/images/projects/procedural-dungeon-map-generator/dun3.png"></div>
                </div>
            </div>

            <!-- Ecosystem Simulation -->
            <div class="project-item" data-category="simulation" onclick="toggleProjectDetails('ecosystem-simulation')">
                <img loading="lazy" decoding="async" src="assets/images/projects/ecosystem-simulation/eco1.png" alt="EcoSim">
                <div><h2>Ecosystem Simulation</h2><p>Real-time 2D ecosystem with plants, prey and predators showing emergent behaviors.</p></div>
                <div class="project-details" id="ecosystem-simulation">
                    <p><strong>Languages:</strong> C++</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Developed interactive SDL2 visualization with dynamic HUD and mouse-over info</li>
                            <li>Developed a multithreaded simulation architecture using a custom thread pool and job system to parallelize large-scale entity updates</li>
                            <li>Built species entities with energy, metabolism, vision, speed and reproduction traits</li>
                            <li>Implemented emergent flocking and clustering behaviors</li>
                            <li>Added heatmaps and density overlays for population analysis</li>
                            <li>Created trail rendering and dynamic camera system using SDL2</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C++17 • SDL2 • SDL2_ttf • Custom ECS • Multithreading</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/EcoSim" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/ecosystem-simulation/eco1.png"><img loading="lazy" decoding="async" src="assets/images/projects/ecosystem-simulation/eco2.png"><img loading="lazy" decoding="async" src="assets/images/projects/ecosystem-simulation/eco3.png"></div>
                </div>
            </div>

            <!-- Monte Carlo Portfolio Simulator -->
            <div class="project-item" data-category="finance-data simulation" onclick="toggleProjectDetails('monte-carlo-portfolio-simulator')">
                <img loading="lazy" decoding="async" src="assets/images/projects/monte-carlo-portfolio-simulator/Monte1.png" alt="Monte Carlo">
                <div><h2>Monte Carlo Portfolio Simulator</h2><p>Advanced risk analysis engine with historical data and interactive UI.</p></div>
                <div class="project-details" id="monte-carlo-portfolio-simulator">
                    <p><strong>Languages:</strong> Python</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Built vectorized Geometric Brownian Motion simulation supporting millions of paths</li>
                            <li>Implemented automated historical data retrieval using yfinance</li>
                            <li>Calculated full risk metrics including VaR, CVaR, Sharpe Ratio and Max Drawdown</li>
                            <li>Created three synchronized charts with confidence bands and histograms</li>
                            <li>Developed web UI with live parameter sliders</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>Python • NumPy • pandas • yfinance • Matplotlib • Streamlit</li>
                        </ul>
                    </div>
                    <a href="https://github.com/wrgdevs/monte-carlo-portfolio-simulator" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/monte-carlo-portfolio-simulator/Monte1.png"><img loading="lazy" decoding="async" src="assets/images/projects/monte-carlo-portfolio-simulator/Monte2.png"><img loading="lazy" decoding="async" src="assets/images/projects/monte-carlo-portfolio-simulator/Monte3.png"><img loading="lazy" decoding="async" src="assets/images/projects/monte-carlo-portfolio-simulator/Monte4.png"></div>
                </div>
            </div>

            <!-- Steam Game Analytics -->
            <div class="project-item" data-category="finance-data" onclick="toggleProjectDetails('steam-game-analytics')">
                <img loading="lazy" decoding="async" src="assets/images/projects/steam-game-analytics/Ana1.png" alt="Steam Analytics">
                <div><h2>Steam Game Analytics</h2><p>Offline analytics platform for 42k+ Steam games with CLI and Streamlit dashboard.</p></div>
                <div class="project-details" id="steam-game-analytics">
                    <p><strong>Languages:</strong> Python</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Developed robust data cleaning pipeline for messy Steam data</li>
                            <li>Built 14+ CLI commands for deep market analysis</li>
                            <li>Implemented content-based recommendation engine using TF-IDF and cosine similarity</li>
                            <li>Added fuzzy title search across 42k games</li>
                            <li>Produced high-quality Matplotlib visualizations and Streamlit dashboard</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>Python • Pandas • NumPy • scikit-learn • rapidfuzz • Click • Streamlit • Matplotlib</li>
                        </ul>
                    </div>
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/steam-game-analytics/Ana1.png"><img loading="lazy" decoding="async" src="assets/images/projects/steam-game-analytics/Ana2.png"><img loading="lazy" decoding="async" src="assets/images/projects/steam-game-analytics/Ana3.png"></div>
                </div>
            </div>

            <!-- 2D Game Editor -->
            <div class="project-item" data-category="game-graphics tools-systems" onclick="toggleProjectDetails('two-d-game-editor')">
                <img loading="lazy" decoding="async" src="assets/images/projects/2d-game-editor/Menu.png" alt="Editor">
                <div><h2>2D Game Editor</h2><p>Custom 2D level editor with real-time feedback and structured data handling.</p></div>
                <div class="project-details" id="two-d-game-editor">
                    <p><strong>Languages:</strong> C++</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Built a full save/load system with JSON serialization for instant map import/export</li>
                            <li>Implemented real-time tile editing with immediate visual feedback using SDL2</li>
                            <li>Developed a smooth camera system with zoom and pan controls</li>
                            <li>Created precise grid snapping and spatial tools for clean level design</li>
                            <li>Added in-editor physics preview using AABB collision and raycasting</li>
                            <li>Integrated ImGui for real-time UI and parameter adjustments</li>
                            <li>Added Lua scripting support for flexible level behavior</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C++ • SDL2 • ImGui • Lua • JSON</li>
                        </ul>
                    </div>
                    <a href="https://github.com/chilly-nap/Hooked-on-Speed" target="_blank" rel="noopener noreferrer" class="github-link">View on GitHub (Not Completely Updated, Old Version)</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/2d-game-editor/Menu.png"><img loading="lazy" decoding="async" src="assets/images/projects/2d-game-editor/Game.png"></div>
                </div>
            </div>

            <!-- Tactical RPG -->
            <div class="project-item" data-category="game-graphics" onclick="toggleProjectDetails('tactical-rpg')">
                <img loading="lazy" decoding="async" src="assets/images/projects/tactical-rpg/Chess.png" alt="Tactical RPG">
                <div><h2>Tactical RPG</h2><p>Chess-inspired grid-based tactical RPG with modular classes.</p></div>
                <div class="project-details" id="tactical-rpg">
                    <p><strong>Languages:</strong> C#</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Implemented grid movement validation with chess-style rule enforcement</li>
                            <li>Built class-specific abilities such as teleport, shield blocking, and AoE spells</li>
                            <li>Developed a modular character system with customizable stats and progression</li>
                            <li>Created turn-based gameplay logic with clean action and state management</li>
                            <li>Designed a scalable board system supporting variable map sizes</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C# • Unity Engine</li>
                        </ul>
                    </div>
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/tactical-rpg/Chess.png"></div>
                </div>
            </div>

             <!-- Shogi Learning App -->
            <div class="project-item" data-category="tools-systems" onclick="toggleProjectDetails('shogi-learning-app')">
                <img loading="lazy" decoding="async" src="assets/images/projects/shogi-learning-app/Tutorial.png" alt="Shogi">
                <div><h2>Shogi Learning App</h2><p>Interactive Shogi tutor with tutorials, puzzles and progress tracking.</p></div>
                <div class="project-details" id="shogi-learning-app">
                    <p><strong>Languages:</strong> Java</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Built step-by-step tutorial system covering rules, piece movement and board setup</li>
                            <li>Created interactive GUI to visualize piece movement and captures using Swing</li>
                            <li>Designed progressive puzzle challenges to reinforce learning concepts</li>
                            <li>Implemented progress tracking and milestone system</li>
                            <li>Added modular lesson structure for easy content expansion</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>Java • Swing • JUnit</li>
                        </ul>
                    </div>
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/shogi-learning-app/Teach.png"><img loading="lazy" decoding="async" src="assets/images/projects/shogi-learning-app/Tutorial.png"></div>
                </div>
            </div>

            <!-- CHIP-8 Emulator -->
            <div class="project-item" data-category="tools-systems game-graphics" onclick="toggleProjectDetails('chip8-emulator')">
                <img loading="lazy" decoding="async" src="assets/images/projects/chip8-emulator/game1.png" alt="CHIP-8 Emulator">
                <div><h2>CHIP-8 Emulator</h2><p>Low-level CHIP-8 emulator with accurate instruction handling and custom graphics.</p></div>
                <div class="project-details" id="chip8-emulator">
                    <p><strong>Languages:</strong> C++</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Recreated the full CHIP-8 architecture including memory, registers, stack and program counter</li>
                            <li>Implemented complete instruction set interpreter for accurate opcode execution</li>
                            <li>Built real-time 64×32 monochrome display rendering with SDL2</li>
                            <li>Added hexadecimal keypad input mapping to keyboard controls</li>
                            <li>Developed stack system supporting subroutine calls and returns</li>
                        </ul>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>C++ • SDL2</li>
                        </ul>
                    </div>
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img loading="lazy" decoding="async" src="assets/images/projects/chip8-emulator/game1.png"></div>
                </div>
            </div>
        </div>`;
    }

    else if (sectionId === 'contact') {
        html = `
            <div class="contact-section">
                <h1>CONTACT</h1>
                <p>Want to chat or collaborate?</p>
                <img src="assets/images/robot.png" alt="Robot">
                <p style="font-size:1.3em;margin-top:20px;">wrgao@uwaterloo.ca</p>
                <button type="button" onclick="openGithubModal()" class="github-link profile-github-link">View GitHub Profile</button>
            </div>`;
    }

    section.innerHTML = html;
    versionProjectImageSrcs(section);
    document.body.appendChild(section);
}

// ====================== PROJECT TOGGLE ======================
function toggleProjectDetails(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const isOpen = el.classList.toggle('is-open');
    el.style.display = isOpen ? 'block' : 'none';
}


// ====================== PROJECT IMAGE CAROUSEL ======================
let carouselImages = [];
let carouselIndex = 0;

function ensureImageCarousel() {
    let modal = document.getElementById('image-carousel-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'image-carousel-modal';
    modal.className = 'image-carousel-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="image-carousel-card">
            <button class="image-carousel-close" type="button" aria-label="Close image carousel">×</button>
            <button class="image-carousel-nav image-carousel-prev" type="button" aria-label="Previous image">‹</button>
            <img class="image-carousel-image" src="" alt="Project screenshot preview">
            <button class="image-carousel-nav image-carousel-next" type="button" aria-label="Next image">›</button>
            <p class="image-carousel-counter"></p>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.image-carousel-close').addEventListener('click', closeImageCarousel);
    modal.querySelector('.image-carousel-prev').addEventListener('click', () => moveImageCarousel(-1));
    modal.querySelector('.image-carousel-next').addEventListener('click', () => moveImageCarousel(1));
    modal.addEventListener('click', event => {
        if (event.target === modal) closeImageCarousel();
    });

    return modal;
}

function getProjectImages(projectItem) {
    const detailImages = Array.from(projectItem.querySelectorAll('.project-images-grid img'));
    const mainImage = projectItem.querySelector(':scope > img');
    const images = detailImages.length ? detailImages : (mainImage ? [mainImage] : []);

    return images.map(img => ({
        src: versionedAsset(img.getAttribute('src')),
        alt: img.getAttribute('alt') || projectItem.querySelector('h2')?.textContent || 'Project screenshot'
    }));
}

function openImageCarousel(projectItem, clickedSrc) {
    carouselImages = getProjectImages(projectItem);
    if (!carouselImages.length) return;

    const normalizedClickedSrc = (clickedSrc || '').split('?')[0];
    carouselIndex = Math.max(0, carouselImages.findIndex(image => image.src.split('?')[0] === normalizedClickedSrc));

    const modal = ensureImageCarousel();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    renderImageCarousel();
}

function renderImageCarousel() {
    const modal = ensureImageCarousel();
    const image = modal.querySelector('.image-carousel-image');
    const counter = modal.querySelector('.image-carousel-counter');
    const current = carouselImages[carouselIndex];

    image.src = current.src;
    image.alt = current.alt;
    counter.textContent = `${carouselIndex + 1} / ${carouselImages.length}`;
}

function moveImageCarousel(direction) {
    if (!carouselImages.length) return;
    carouselIndex = (carouselIndex + direction + carouselImages.length) % carouselImages.length;
    renderImageCarousel();
}

function closeImageCarousel() {
    const modal = document.getElementById('image-carousel-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

// ====================== MOUSE PARTICLES + PROGRESS + INIT ======================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.addEventListener("mousemove", e => {
    if (reduceMotion.matches) return;

    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = e.pageX + "px";
    p.style.top = e.pageY + "px";
    p.style.width = p.style.height = Math.random() * 6 + 3 + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}, { passive: true });

const circle = document.querySelector('.progress-ring__circle');
const circumference = 175;
circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

function updateProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    circle.style.strokeDashoffset = circumference * (1 - scrollPercent);
}
window.addEventListener('scroll', updateProgress, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
    hideLoadingAnimation();
    document.getElementById('typed-header').textContent = "WELCOME TO MY PORTFOLIO";
    document.getElementById('typed-subheader').textContent = "DIVE INTO MY WORK!";
});


function filterProjects(filter) {
    document.querySelectorAll('.project-filter').forEach(button => {
        button.classList.toggle('active', button.dataset.filter === filter);
    });

    document.querySelectorAll('.project-item').forEach(item => {
        const categories = item.dataset.category || '';
        const show = filter === 'all' || categories.split(' ').includes(filter);
        item.classList.toggle('is-hidden', !show);
    });
}


// ====================== GITHUB MODAL ======================
function openGithubModal() {
    const modal = document.getElementById('github-modal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeGithubModal() {
    const modal = document.getElementById('github-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}


document.addEventListener('click', event => {
    const clickedImage = event.target.closest?.('.project-item > img, .project-images-grid img');
    if (!clickedImage) return;

    const projectItem = clickedImage.closest('.project-item');
    if (!projectItem) return;

    event.preventDefault();
    event.stopPropagation();
    openImageCarousel(projectItem, clickedImage.getAttribute('src'));
}, true);

document.addEventListener('click', e => {
    if (e.target.id === 'github-modal') {
        closeGithubModal();
    }

    if (e.target.classList.contains('project-filter')) {
        filterProjects(e.target.dataset.filter);
    }

    if (e.target.classList.contains('collapsible')) {
        e.target.classList.toggle('active');
        const content = e.target.nextElementSibling;
        content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    }
});


document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeGithubModal();
        closeImageCarousel();
    }

    if (document.getElementById('image-carousel-modal')?.classList.contains('is-open')) {
        if (e.key === 'ArrowLeft') moveImageCarousel(-1);
        if (e.key === 'ArrowRight') moveImageCarousel(1);
    }
});
