// ====================== LOADING ======================
function showLoadingAnimation() {
    document.getElementById('loading-screen').style.display = 'flex';
}
function hideLoadingAnimation() {
    document.getElementById('loading-screen').style.display = 'none';
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
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
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
                <p>Hi, I’m Wei Rong. I am an aspiring software developer with an interest in building interactive experiences, 
        from games to practical tools. I enjoy turning ideas into real, working systems and continuously improving my skills along the way.</p>
                <img src="assets/images/sky.jpg" alt="Me">
                <h1>My Journey</h1>
                <p>I started by creating simple games and experimenting with different technologies. Over time, this grew into a deeper 
        passion for software development, where I now focus on writing code and exploring new tools.</p>

                <button class="collapsible">🎓 Education</button>
                <div class="content">
                    <p><strong>Bachelor of Honours Mathematics, Co-operative Program</strong><br>University of Waterloo</p>
                </div>

                <button class="collapsible">🎨 Hobbies</button>
                <div class="content">
                    <p>In my free time, I enjoy reading, playing games, and watching shows. These interests often inspire ideas for new projects and help me think about user experience from different perspectives.</p>
                </div>
            </div>`;
    }

    else if (sectionId === 'tools') {
    html = `
    <div class="tools-container">
        <h1>TOOLS & SKILLS</h1>
        <img src="assets/images/jg.jpg" alt="Tools">

        <div class="tools-section">
            <!-- Languages -->
            <div>
                <h2>Languages</h2>
                <ul>
                    <li>C</li>
                    <li>C++</li>
                    <li>C#</li>
                    <li>Java</li>
                    <li>JavaScript</li>
                    <li>TypeScript</li>
                    <li>Python</li>
                    <li>Lua</li>
                    <li>SQL</li>
                </ul>
            </div>

            <!-- Technologies -->
            <div>
                <h2>Technology</h2>
                <ul>
                    <li>Qt</li>
                    <li>SDL2</li>
                    <li>ImGUI</li>
                    <li>OpenGL</li>
                    <li>WebGL</li> <!-- NEW -->
                    <li>Three.js</li> <!-- NEW -->
                    <li>.NET</li>
                    <li>React</li>
                    <li>Node.js</li>
                    <li>Streamlit</li> <!-- NEW -->
                    <li>Chart.js</li> <!-- NEW -->
                </ul>
            </div>

            <!-- Tools -->
            <div>
                <h2>Tools</h2>
                <ul>
                    <li>Git</li>
                    <li>Docker</li>
                    <li>Visual Studio</li>
                    <li>VS Code</li>
                    <li>Unity</li>
                    <li>Unreal Engine</li>
                    <li>Blender</li>
                    <li>Vite</li> <!-- NEW -->
                    <li>Command-Line Tools</li> <!-- NEW -->
                </ul>
            </div>

            <!-- Concepts -->
            <div>
                <h2>Concepts</h2>
                <ul>
                    <li>Object-Oriented Programming</li>
                    <li>Multithreading</li>
                    <li>Computer Graphics</li>
                    <li>Entity Component Systems</li>
                    <li>Networking</li>
                    <li>CI/CD</li>
                    <li>Procedural Generation</li>
                    <li>Data Structures & Algorithms</li> 
                    <li>Machine Learning Fundamentals</li>
                </ul>
            </div>
        </div>
    </div>`;
    }

    else if (sectionId === 'projects') {
    html = `
        <div class="projects-container">
            <h1 style="text-align:center;color:#00acc1;">PROJECTS</h1>

            <!-- 1. 2D Game Editor -->
            <div class="project-item" onclick="toggleProjectDetails('p1')">
                <img src="assets/images/projects/Project1/Menu.png" alt="Editor">
                <div><h2>2D Game Editor</h2><p>Custom 2D level editor with real-time feedback and structured data handling.</p></div>
                <div class="project-details" id="p1">
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
                    <a href="https://github.com/chilly-nap/Hooked-on-Speed" target="_blank" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project1/Menu.png"><img src="assets/images/projects/Project1/Game.png"></div>
                </div>
            </div>

            <!-- 2. 3D Graphics Rasterizer -->
            <div class="project-item" onclick="toggleProjectDetails('p2')">
                <img src="assets/images/projects/Project2/Standard.png" alt="Rasterizer">
                <div><h2>3D Graphics Rasterizer</h2><p>From-scratch software 3D renderer with full pipeline and live GUI.</p></div>
                <div class="project-details" id="p2">
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
                    <a href="https://github.com/chilly-nap/Rasterizer" target="_blank" class="github-link">View on GitHub</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project2/Standard.png"><img src="assets/images/projects/Project2/Custom.png"><img src="assets/images/projects/Project2/Wireframe.png"></div>
                </div>
            </div>

            <!-- 3. Tactical RPG -->
            <div class="project-item" onclick="toggleProjectDetails('p3')">
                <img src="assets/images/projects/Project3/Chess.png" alt="Tactical RPG">
                <div><h2>Tactical RPG</h2><p>Chess-inspired grid-based tactical RPG with modular classes.</p></div>
                <div class="project-details" id="p3">
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
                    <div class="project-images-grid"><img src="assets/images/projects/Project3/Chess.png"></div>
                </div>
            </div>

            <!-- 4. Shogi Learning App -->
            <div class="project-item" onclick="toggleProjectDetails('p4')">
                <img src="assets/images/projects/Project4/Tutorial.png" alt="Shogi">
                <div><h2>Shogi Learning App</h2><p>Interactive Shogi tutor with tutorials, puzzles and progress tracking.</p></div>
                <div class="project-details" id="p4">
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
                    <div class="project-images-grid"><img src="assets/images/projects/Project4/Teach.png"><img src="assets/images/projects/Project4/Tutorial.png"></div>
                </div>
            </div>

            <!-- 5. CHIP-8 Emulator -->
            <div class="project-item" onclick="toggleProjectDetails('p5')">
                <img src="assets/images/projects/Project11/game1.png" alt="CHIP-8 Emulator">
                <div><h2>CHIP-8 Emulator</h2><p>Low-level CHIP-8 emulator with accurate instruction handling and custom graphics.</p></div>
                <div class="project-details" id="p5">
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
                    <div class="project-images-grid"><img src="assets/images/projects/Project11/game1.png"></div>
                </div>
            </div>

            <!-- 6. Procedural Dungeon Map Generator -->
            <div class="project-item" onclick="toggleProjectDetails('p6')">
                <img src="assets/images/projects/Project5/DungeonMap1.png" alt="Dungeon Gen">
                <div><h2>Procedural Dungeon Map Generator</h2><p>Real-time procedural dungeon system with multiple algorithms and live analytics.</p></div>
                <div class="project-details" id="p6">
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
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project5/DungeonMap1.png"><img src="assets/images/projects/Project5/DungeonMap2.png"><img src="assets/images/projects/Project5/DungeonMap3.png"></div>
                </div>
            </div>

            <!-- 7. EcoSim -->
            <div class="project-item" onclick="toggleProjectDetails('p7')">
                <img src="assets/images/projects/Project6/Sim1.png" alt="EcoSim">
                <div><h2>EcoSim — Ecosystem Simulation</h2><p>Real-time 2D ecosystem with plants, prey and predators showing emergent behaviors.</p></div>
                <div class="project-details" id="p7">
                    <p><strong>Languages:</strong> C++</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>
                            <li>Developed interactive SDL2 visualization with dynamic HUD and mouse-over info</li>
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
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project6/Sim1.png"><img src="assets/images/projects/Project6/Sim2.png"></div>
                </div>
            </div>

            <!-- 8. Monte Carlo Portfolio Simulator -->
            <div class="project-item" onclick="toggleProjectDetails('p8')">
                <img src="assets/images/projects/Project8/Monte1.png" alt="Monte Carlo">
                <div><h2>Monte Carlo Portfolio Simulator</h2><p>Advanced risk analysis engine with historical data and interactive UI.</p></div>
                <div class="project-details" id="p8">
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
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project8/Monte1.png"><img src="assets/images/projects/Project8/Monte2.png"><img src="assets/images/projects/Project8/Monte3.png"></div>
                </div>
            </div>

            <!-- 9. Steam Game Analytics -->
            <div class="project-item" onclick="toggleProjectDetails('p9')">
                <img src="assets/images/projects/Project7/Ana1.png" alt="Steam Analytics">
                <div><h2>Steam Game Analytics</h2><p>Offline analytics platform for 42k+ Steam games with CLI and Streamlit dashboard.</p></div>
                <div class="project-details" id="p9">
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
                    <div class="project-images-grid"><img src="assets/images/projects/Project7/Ana1.png"><img src="assets/images/projects/Project7/Ana2.png"><img src="assets/images/projects/Project7/Ana3.png"></div>
                </div>
            </div>

            <!-- 10. Procedural Terrain Generator -->
            <div class="project-item" onclick="toggleProjectDetails('p10')">
                <img src="assets/images/projects/Project9/Mount.png" alt="Procedural Terrain">
                <div><h2>Procedural Terrain Generator</h2><p>Real-time 3D terrain engine with infinite streaming and erosion simulation.</p></div>
                <div class="project-details" id="p10">
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
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project9/Mount.png"><img src="assets/images/projects/Project9/island.png"><img src="assets/images/projects/Project9/desert.png"></div>
                </div>
            </div>

            <!-- 11. World Economy Simulator -->
            <div class="project-item" onclick="toggleProjectDetails('p11')">
                <img src="assets/images/projects/Project10/eco1.png" alt="World Economy">
                <div><h2>World Economy Simulator</h2><p>Interactive multi-country economic simulation with trade networks and AI policies.</p></div>
                <div class="project-details" id="p11">
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
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                    <div class="project-images-grid"><img src="assets/images/projects/Project10/eco1.png"><img src="assets/images/projects/Project10/eco2.png"><img src="assets/images/projects/Project10/eco3.png"><img src="assets/images/projects/Project10/eco4.png"></div>
                </div>
            </div>

            <!-- 12. Neural Network from Scratch -->
            <div class="project-item" onclick="toggleProjectDetails('p12')">
                <img src="assets/images/projects/Project12/learn1.png" alt="NN from Scratch">
                <div><h2>Neural Network from Scratch</h2><p>Complete neural network built from scratch in NumPy that evolves into a full MNIST classifier with training visualizations, experiments, and a polished installable CLI tool.</p></div>
                <div class="project-details" id="p12">
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
                    <a href="javascript:void(0);" class="github-link">Not on GitHub yet</a>
                        <div class="project-images-grid">
                            <img src="assets/images/projects/Project12/learn1.png">
                            <img src="assets/images/projects/Project12/learn2.png">
                        </div>
                    </div>
                </div>
            <p style="text-align:center;margin-top:60px;opacity:0.7;">All 11 projects now live • More coming soon!</p>
        </div>`;
    }

    else if (sectionId === 'contact') {
        html = `
            <div class="contact-section">
                <h1>CONTACT</h1>
                <p>Want to chat or collaborate?</p>
                <img src="assets/images/robot.png" alt="Robot">
                <p style="font-size:1.3em;margin-top:20px;">wrgao5@gmail.com</p>
            </div>`;
    }

    section.innerHTML = html;
    document.body.appendChild(section);
}

// ====================== PROJECT TOGGLE ======================
function toggleProjectDetails(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}

// ====================== MOUSE PARTICLES + PROGRESS + INIT ======================
document.addEventListener("mousemove", e => {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = e.pageX + "px";
    p.style.top = e.pageY + "px";
    p.style.width = p.style.height = Math.random() * 6 + 3 + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
});

const circle = document.querySelector('.progress-ring__circle');
const circumference = 175;
circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

function updateProgress() {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    circle.style.strokeDashoffset = circumference * (1 - scrollPercent);
}
window.addEventListener('scroll', updateProgress);

document.addEventListener("DOMContentLoaded", () => {
    hideLoadingAnimation();
    document.getElementById('typed-header').textContent = "WELCOME TO MY PORTFOLIO";
    document.getElementById('typed-subheader').textContent = "DIVE INTO MY WORK!";
});

document.addEventListener('click', e => {
    if (e.target.classList.contains('collapsible')) {
        e.target.classList.toggle('active');
        const content = e.target.nextElementSibling;
        content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    }
});