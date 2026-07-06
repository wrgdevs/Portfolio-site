const ASSET_VERSION = "20260706b";

const PROJECT_FILTERS = [
    { id: "all", label: "All" },
    { id: "game-graphics", label: "Game & Graphics" },
    { id: "finance-data", label: "Finance & Data" },
    { id: "simulation", label: "Simulation" },
    { id: "tools-systems", label: "Tools & Systems" }
];

const SECTION_KEYS = {
    "1": "about",
    "2": "current",
    "3": "projects",
    "4": "contact"
};

const PROJECTS = [
    {
        id: "graphics-rasterizer",
        title: "3D Graphics Rasterizer",
        summary: "From-scratch software 3D renderer with a full rasterization pipeline and live GUI.",
        categories: ["game-graphics", "tools-systems"],
        image: "assets/images/projects/3d-graphics-rasterizer/textured.webp",
        imageAlt: "Textured model rendered in the software rasterizer",
        languages: ["C++"],
        techStack: ["C++", "SDL2", "ImGui", "TGAImage", "Catch2"],
        features: [
            "Built a complete rasterization pipeline from vertex processing to fragment shading",
            "Implemented triangle rasterization with barycentric interpolation",
            "Developed a custom shader pipeline supporting diffuse, normal, and specular mapping",
            "Added Phong lighting for realistic shading and highlights",
            "Integrated ImGui for real-time parameter tweaking without recompilation",
            "Used TGAImage for texture loading",
            "Optimized rendering with backface culling"
        ],
        github: { url: "https://github.com/wrgdevs/software-rasterizer", label: "View on GitHub" },
        images: [
            "assets/images/projects/3d-graphics-rasterizer/textured.webp",
            "assets/images/projects/3d-graphics-rasterizer/normal_map.webp",
            "assets/images/projects/3d-graphics-rasterizer/Wireframe.webp",
            "assets/images/projects/3d-graphics-rasterizer/specular.webp"
        ]
    },
    {
        id: "custom-ecs-game-engine",
        title: "Custom ECS Game Engine",
        summary: "Lightweight C++ game engine with ECS architecture, editor tooling, Lua scripting, scene serialization, and runtime export.",
        categories: ["game-graphics", "tools-systems"],
        image: "assets/images/projects/custom-ecs-game-engine/editor.webp",
        imageAlt: "Custom ECS game engine editor interface",
        languages: ["C++", "Lua"],
        techStack: ["C++20", "CMake", "SDL2", "OpenGL", "ImGui", "Lua", "EnTT", "GLM", "JSON", "stb_image"],
        features: [
            "Built modular C++20 engine architecture with ECS-based scene, entity, and component management",
            "Created ImGui editor with scene hierarchy, inspector, viewport, asset browser, prefab browser, and runtime preview",
            "Implemented JSON scene and prefab serialization with reusable entity prefabs",
            "Added Lua scripting, animation, audio playback, physics, collision, undo, redo, and event systems",
            "Developed a resource manager with texture and audio caching",
            "Built standalone runtime export pipeline to separate editor tooling from playable builds"
        ],
        github: { url: "https://github.com/wrgdevs/CustomECSEngine", label: "View on GitHub" },
        images: [
            "assets/images/projects/custom-ecs-game-engine/editor.webp",
            "assets/images/projects/custom-ecs-game-engine/prefab.webp",
            "assets/images/projects/custom-ecs-game-engine/transform.webp",
            "assets/images/projects/custom-ecs-game-engine/animation.webp"
        ]
    },
    {
        id: "procedural-terrain-generator",
        title: "Procedural Terrain Generator",
        summary: "Real-time 3D terrain engine with infinite streaming and erosion simulation.",
        categories: ["game-graphics", "simulation"],
        image: "assets/images/projects/procedural-terrain-generator/mount.webp",
        imageAlt: "Generated mountain terrain",
        languages: ["TypeScript"],
        techStack: ["TypeScript", "React", "Three.js", "WebGL", "Vite"],
        features: [
            "Built multi-layer noise generation with domain warping for natural landforms",
            "Implemented level-of-detail system for performance at large scales",
            "Added hydraulic erosion simulation for realistic terrain shaping",
            "Developed infinite terrain streaming with dynamic chunk loading",
            "Created biome blending using temperature and moisture maps"
        ],
        github: { url: "https://github.com/wrgdevs/procedural-terrain-generator", label: "View on GitHub" },
        images: [
            "assets/images/projects/procedural-terrain-generator/mount.webp",
            "assets/images/projects/procedural-terrain-generator/island.webp",
            "assets/images/projects/procedural-terrain-generator/desert.webp"
        ]
    },
    {
        id: "world-economy-simulator",
        title: "World Economy Simulator",
        summary: "Interactive multi-country economic simulation with trade networks and AI policies.",
        categories: ["simulation", "finance-data"],
        image: "assets/images/projects/world-economy-simulator/eco1.webp",
        imageAlt: "World economy simulator dashboard",
        languages: ["TypeScript"],
        techStack: ["TypeScript", "React", "Chart.js"],
        features: [
            "Designed multi-country economic modeling including production, trade, inflation, and migration",
            "Implemented bilateral trade networks with dynamic dependencies",
            "Built AI policy system that adjusts taxes, subsidies, and investments in real time",
            "Added stochastic event engine with seeded randomness for crises and booms",
            "Created real-time data visualization and automated economic insights"
        ],
        github: { url: "https://github.com/wrgdevs/world-economy-simulator", label: "View on GitHub" },
        images: [
            "assets/images/projects/world-economy-simulator/eco1.webp",
            "assets/images/projects/world-economy-simulator/eco2.webp",
            "assets/images/projects/world-economy-simulator/eco3.webp",
            "assets/images/projects/world-economy-simulator/eco4.webp"
        ]
    },
    {
        id: "algorithmic-trading-backtester",
        title: "Algorithmic Trading Backtester",
        summary: "Interactive trading strategy backtester with portfolio analytics, custom rule building, and risk reporting.",
        categories: ["finance-data"],
        image: "assets/images/projects/algorithmic-trading-backtester/charts.webp",
        imageAlt: "Algorithmic trading backtester charts",
        languages: ["Python"],
        techStack: ["Python", "Pandas", "NumPy", "Plotly", "Streamlit", "Pytest"],
        features: [
            "Developed modular backtesting engine supporting equities, multi-asset portfolios, transaction costs, and benchmark comparison",
            "Implemented technical strategies including RSI, MACD, Bollinger Bands, momentum, mean reversion, and pairs trading",
            "Built custom no-code strategy builder with rule validation, signal diagnostics, and preset templates",
            "Added portfolio analytics including Sharpe ratio, Sortino ratio, beta, VaR, CVaR, max drawdown, and win-rate metrics",
            "Created interactive Streamlit dashboard for strategy comparison, parameter optimization, trade visualization, and automated reporting"
        ],
        github: { url: "https://github.com/wrgdevs/algorithmic-trading-backtester", label: "View on GitHub" },
        images: [
            "assets/images/projects/algorithmic-trading-backtester/charts.webp",
            "assets/images/projects/algorithmic-trading-backtester/charts-more.webp",
            "assets/images/projects/algorithmic-trading-backtester/custom.webp",
            "assets/images/projects/algorithmic-trading-backtester/signal.webp",
            "assets/images/projects/algorithmic-trading-backtester/weights.webp"
        ]
    },
    {
        id: "banking-transaction-ledger",
        title: "Banking Transaction Ledger",
        summary: "Full-stack banking ledger with double-entry accounting, JWT role policies, reconciliation, and concurrency-safe transactions.",
        categories: ["finance-data", "tools-systems"],
        image: "assets/images/projects/bank-ledger/overview.webp",
        imageAlt: "Banking transaction ledger account overview dashboard",
        languages: ["C#", "TypeScript", "SQL"],
        techStack: ["ASP.NET Core 9", "React", "TypeScript", "PostgreSQL", "Entity Framework Core", "Docker Compose", "xUnit", "GitHub Actions"],
        features: [
            "Built a full-stack banking ledger with ASP.NET Core API, React/TypeScript client, PostgreSQL storage, and Docker Compose local setup",
            "Implemented double-entry ledger operations for deposits, withdrawals, and transfers using immutable debit and credit entries",
            "Added idempotency-key handling so exact retries return the original result while conflicting reused keys are rejected",
            "Protected customer, admin, and auditor workflows with signed JWT authentication, ownership checks, and role-based policies",
            "Created reconciliation tools to detect unbalanced transactions, missing entries, cached balance mismatches, and invalid negative balances",
            "Used PostgreSQL xmin concurrency tokens and integration tests to prevent concurrent double-spend scenarios",
            "Added audit logs, transaction reversals, account limits, monthly JSON/CSV statements, health checks, Swagger, CI, and production-style Docker/Nginx artifacts"
        ],
        github: { label: "Repository coming soon" },
        images: [
            "assets/images/projects/bank-ledger/overview.webp",
            "assets/images/projects/bank-ledger/transactions.webp",
            "assets/images/projects/bank-ledger/statements.webp",
            "assets/images/projects/bank-ledger/login.webp"
        ]
    },

    {
        id: "market-replay-lab",
        title: "Market Replay Lab",
        summary: "Stock replay workstation for practicing paper trades, alerts, strategy ideas, and post-session review against cached OHLCV data.",
        categories: ["finance-data", "tools-systems"],
        image: "assets/images/projects/market-replay-terminal/replay.webp",
        imageAlt: "Market Replay Lab replay terminal interface",
        languages: ["TypeScript", "Python"],
        techStack: ["React", "TypeScript", "FastAPI", "SQLite", "yfinance", "Vite"],
        features: [
            "Built a terminal-style replay workflow for loading symbols, stepping through historical OHLCV data, and practicing fake trades",
            "Implemented a React + TypeScript frontend with replay chart, tape, command bar, event log, and paper trading controls",
            "Created a FastAPI backend with SQLite persistence, seeded demo data, yfinance imports, CSV imports, and cached data modes",
            "Added portfolio scoring, return, P&L, trade reasoning notes, challenge goals, replay bookmarks, and local review snapshots",
            "Developed Strategy Lab tools for event scans, bot tests, stress scenarios, scenario building, notes, and downloadable reports",
            "Added workspace backup export/import for settings, alerts, presets, journal notes, and replay history"
        ],
        github: { label: "Repository coming soon" },
        images: [
            "assets/images/projects/market-replay-terminal/replay.webp",
            "assets/images/projects/market-replay-terminal/portfolio.webp",
            "assets/images/projects/market-replay-terminal/stratlab.webp",
            "assets/images/projects/market-replay-terminal/data.webp"
        ]
    },
    {
        id: "neural-network-from-scratch",
        title: "Neural Network from Scratch",
        summary: "NumPy neural network that grows into an MNIST classifier with training visualizations, experiments, and an installable CLI.",
        categories: ["finance-data", "tools-systems"],
        image: "assets/images/projects/neural-network-from-scratch/learn1.webp",
        imageAlt: "Neural network training visualization",
        languages: ["Python"],
        techStack: ["Python", "NumPy", "Matplotlib", "Streamlit"],
        features: [
            "Implemented a modular neural network from scratch using pure NumPy, including dense layers, activations, loss, and backpropagation",
            "Built a reusable NeuralNetwork class that supports architectures defined through CLI flags",
            "Added MNIST loading, preprocessing, and training pipeline with automatic data download",
            "Integrated Matplotlib visualizations for loss and accuracy plots after training",
            "Developed a CLI with argparse so the tool can be installed and run from the terminal",
            "Added experiment mode for comparing activations, learning rates, and hyperparameters"
        ],
        github: { url: "https://github.com/wrgdevs/nn-from-scratch-cli", label: "View on GitHub" },
        images: [
            "assets/images/projects/neural-network-from-scratch/learn1.webp",
            "assets/images/projects/neural-network-from-scratch/learn2.webp",
            "assets/images/projects/neural-network-from-scratch/learn3.webp"
        ]
    },
    {
        id: "procedural-dungeon-map-generator",
        title: "Procedural Dungeon Map Generator",
        summary: "Real-time procedural dungeon system with multiple algorithms and live analytics.",
        categories: ["game-graphics", "simulation"],
        image: "assets/images/projects/procedural-dungeon-map-generator/dun1.webp",
        imageAlt: "Procedural dungeon map visualization",
        languages: ["C++"],
        techStack: ["C++17/20", "SDL2", "SDL2_ttf", "nlohmann::json", "Multithreading"],
        features: [
            "Implemented five generation algorithms including BSP, Cellular Automata, Drunkard's Walk, Recursive Backtracker, and Random Rooms",
            "Built live SDL2 renderer with pan, zoom, and overlay analytics",
            "Added real-time map statistics for floor coverage, connectivity, and largest region",
            "Enabled keyboard-controlled parameter tweaking and instant algorithm switching",
            "Created JSON export system using nlohmann::json for map persistence"
        ],
        github: { url: "https://github.com/wrgdevs/dungeonMapGen", label: "View on GitHub" },
        images: [
            "assets/images/projects/procedural-dungeon-map-generator/dun1.webp",
            "assets/images/projects/procedural-dungeon-map-generator/dun2.webp",
            "assets/images/projects/procedural-dungeon-map-generator/dun3.webp"
        ]
    },
    {
        id: "ecosystem-simulation",
        title: "Ecosystem Simulation",
        summary: "Real-time 2D ecosystem with plants, prey, and predators showing emergent behavior.",
        categories: ["simulation"],
        image: "assets/images/projects/ecosystem-simulation/eco1.webp",
        imageAlt: "Ecosystem simulation screen",
        languages: ["C++"],
        techStack: ["C++17", "SDL2", "SDL2_ttf", "Custom ECS", "Multithreading"],
        features: [
            "Developed interactive SDL2 visualization with dynamic HUD and mouse-over info",
            "Built a multithreaded simulation architecture using a custom thread pool and job system",
            "Built species entities with energy, metabolism, vision, speed, and reproduction traits",
            "Implemented emergent flocking and clustering behaviors",
            "Added heatmaps and density overlays for population analysis",
            "Created trail rendering and dynamic camera system using SDL2"
        ],
        github: { url: "https://github.com/wrgdevs/EcoSim", label: "View on GitHub" },
        images: [
            "assets/images/projects/ecosystem-simulation/eco1.webp",
            "assets/images/projects/ecosystem-simulation/eco2.webp",
            "assets/images/projects/ecosystem-simulation/eco3.webp"
        ]
    },
    {
        id: "monte-carlo-portfolio-simulator",
        title: "Monte Carlo Portfolio Simulator",
        summary: "Advanced risk analysis engine with historical data and an interactive UI.",
        categories: ["finance-data", "simulation"],
        image: "assets/images/projects/monte-carlo-portfolio-simulator/Monte1.webp",
        imageAlt: "Monte Carlo portfolio simulator dashboard",
        languages: ["Python"],
        techStack: ["Python", "NumPy", "pandas", "yfinance", "Matplotlib", "Streamlit"],
        features: [
            "Built vectorized Geometric Brownian Motion simulation supporting millions of paths",
            "Implemented automated historical data retrieval using yfinance",
            "Calculated risk metrics including VaR, CVaR, Sharpe Ratio, and max drawdown",
            "Created synchronized charts with confidence bands and histograms",
            "Developed web UI with live parameter sliders"
        ],
        github: { url: "https://github.com/wrgdevs/monte-carlo-portfolio-simulator", label: "View on GitHub" },
        images: [
            "assets/images/projects/monte-carlo-portfolio-simulator/Monte1.webp",
            "assets/images/projects/monte-carlo-portfolio-simulator/Monte2.webp",
            "assets/images/projects/monte-carlo-portfolio-simulator/Monte3.webp",
            "assets/images/projects/monte-carlo-portfolio-simulator/Monte4.webp"
        ]
    },
    {
        id: "steam-game-analytics",
        title: "Steam Game Analytics",
        summary: "Offline analytics platform for 42k+ Steam games with CLI tooling and a Streamlit dashboard.",
        categories: ["finance-data"],
        image: "assets/images/projects/steam-game-analytics/Ana1.webp",
        imageAlt: "Steam game analytics dashboard",
        languages: ["Python"],
        techStack: ["Python", "Pandas", "NumPy", "scikit-learn", "rapidfuzz", "Click", "Streamlit", "Matplotlib"],
        features: [
            "Developed robust data cleaning pipeline for messy Steam data",
            "Built 14+ CLI commands for market analysis",
            "Implemented content-based recommendation engine using TF-IDF and cosine similarity",
            "Added fuzzy title search across 42k games",
            "Produced Matplotlib visualizations and Streamlit dashboard"
        ],
        github: { label: "Repository coming soon" },
        images: [
            "assets/images/projects/steam-game-analytics/Ana1.webp",
            "assets/images/projects/steam-game-analytics/Ana2.webp",
            "assets/images/projects/steam-game-analytics/Ana3.webp"
        ]
    },
    {
        id: "two-d-game-editor",
        title: "2D Game Editor",
        summary: "Custom 2D level editor with real-time feedback and structured data handling.",
        categories: ["game-graphics", "tools-systems"],
        image: "assets/images/projects/2d-game-editor/Menu.webp",
        imageAlt: "2D game editor menu",
        languages: ["C++"],
        techStack: ["C++", "SDL2", "ImGui", "Lua", "JSON"],
        features: [
            "Built save and load workflows with JSON serialization for map import and export",
            "Implemented real-time tile editing with immediate visual feedback using SDL2",
            "Developed a smooth camera system with zoom and pan controls",
            "Created grid snapping and spatial tools for clean level design",
            "Added in-editor physics preview using AABB collision and raycasting",
            "Integrated ImGui for real-time UI and parameter adjustments",
            "Added Lua scripting support for flexible level behavior"
        ],
        github: { url: "https://github.com/chilly-nap/Hooked-on-Speed", label: "View on GitHub (older version)" },
        images: [
            "assets/images/projects/2d-game-editor/Menu.webp",
            "assets/images/projects/2d-game-editor/Game.webp"
        ]
    },
    {
        id: "tactical-rpg",
        title: "Tactical RPG",
        summary: "Chess-inspired grid-based tactical RPG with modular classes.",
        categories: ["game-graphics"],
        image: "assets/images/projects/tactical-rpg/Chess.webp",
        imageAlt: "Tactical RPG board",
        languages: ["C#"],
        techStack: ["C#", "Unity Engine"],
        features: [
            "Implemented grid movement validation with chess-style rule enforcement",
            "Built class-specific abilities such as teleport, shield blocking, and area spells",
            "Developed a modular character system with customizable stats and progression",
            "Created turn-based gameplay logic with clean action and state management",
            "Designed a scalable board system supporting variable map sizes"
        ],
        github: { label: "Repository coming soon" },
        images: ["assets/images/projects/tactical-rpg/Chess.webp"]
    },
    {
        id: "shogi-learning-app",
        title: "Shogi Learning App",
        summary: "Interactive Shogi tutor with tutorials, puzzles, and progress tracking.",
        categories: ["tools-systems"],
        image: "assets/images/projects/shogi-learning-app/Tutorial.webp",
        imageAlt: "Shogi learning app tutorial screen",
        languages: ["Java"],
        techStack: ["Java", "Swing", "JUnit"],
        features: [
            "Built step-by-step tutorial system covering rules, piece movement, and board setup",
            "Created interactive GUI to visualize piece movement and captures using Swing",
            "Designed progressive puzzle challenges to reinforce learning concepts",
            "Implemented progress tracking and milestones",
            "Added modular lesson structure for easy content expansion"
        ],
        github: { label: "Repository coming soon" },
        images: [
            "assets/images/projects/shogi-learning-app/Teach.webp",
            "assets/images/projects/shogi-learning-app/Tutorial.webp"
        ]
    },
    {
        id: "chip8-emulator",
        title: "CHIP-8 Emulator",
        summary: "Low-level CHIP-8 emulator with accurate instruction handling and custom graphics.",
        categories: ["tools-systems", "game-graphics"],
        image: "assets/images/projects/chip8-emulator/game1.webp",
        imageAlt: "CHIP-8 emulator game screen",
        languages: ["C++"],
        techStack: ["C++", "SDL2"],
        features: [
            "Recreated CHIP-8 architecture including memory, registers, stack, and program counter",
            "Implemented instruction set interpreter for opcode execution",
            "Built real-time 64x32 monochrome display rendering with SDL2",
            "Added hexadecimal keypad input mapping to keyboard controls",
            "Developed stack system supporting subroutine calls and returns"
        ],
        github: { label: "Repository coming soon" },
        images: ["assets/images/projects/chip8-emulator/game1.webp"]
    }
];

const HEADER_TITLE = "WELCOME TO MY PORTFOLIO";
const HEADER_SUBTITLE = "WEI RONG GAO";
