// Auto-generated bespoke internship curricula for ARC LABS.
// Card visuals (colour, tools, descriptions, icons) are supplied by the Programs page;
// only the day-by-day syllabus below is internship-specific. A 20-step plan per track is
// sliced into focused 10-, 15- and 20-day internships.

const META = {
  "iot": {
    "certBase": "IoT",
    "audience": "Diploma, B.Tech & early-career learners",
    "outcomes": [
      "Build a complete connected IoT product",
      "Work fluently with ESP32 & sensors",
      "Stream and visualise live cloud data",
      "Implement device-to-cloud security",
      "Ship a documented capstone project",
      "Earn an ARC LABS IoT Internship Certificate"
    ]
  },
  "embedded": {
    "certBase": "Embedded Systems",
    "audience": "ECE/EEE/CSE students & makers",
    "outcomes": [
      "Write bare-metal & RTOS firmware",
      "Drive peripherals over GPIO, I2C & SPI",
      "Debug with logic analysers & GDB",
      "Design a small real-time product",
      "Apply firmware testing practices",
      "Earn an ARC LABS Embedded Internship Certificate"
    ]
  },
  "iiot": {
    "certBase": "Industrial IoT",
    "audience": "Engineering students & working professionals",
    "outcomes": [
      "Connect industrial machines (PLC/Modbus)",
      "Build SCADA & OPC-UA dashboards",
      "Apply predictive-maintenance basics",
      "Design an OT/IT data pipeline",
      "Deploy an edge-to-cloud IIoT solution",
      "Earn an ARC LABS IIoT Internship Certificate"
    ]
  },
  "robotics": {
    "certBase": "Robotics",
    "audience": "Diploma, B.Tech & robotics enthusiasts",
    "outcomes": [
      "Build and wire a mobile robot",
      "Program motion & sensor feedback",
      "Work with ROS nodes & topics",
      "Add computer-vision navigation",
      "Complete an autonomous robot project",
      "Earn an ARC LABS Robotics Internship Certificate"
    ]
  },
  "iort": {
    "certBase": "IoRT",
    "audience": "B.Tech students with IoT or robotics basics",
    "outcomes": [
      "Connect robots to the cloud",
      "Stream telemetry & remote commands",
      "Coordinate multi-robot communication",
      "Build cloud-controlled autonomy",
      "Deliver an IoRT capstone system",
      "Earn an ARC LABS IoRT Internship Certificate"
    ]
  },
  "aiot": {
    "certBase": "AIoT",
    "audience": "B.Tech students & ML beginners",
    "outcomes": [
      "Run TinyML models on microcontrollers",
      "Collect & label edge sensor data",
      "Deploy on-device inference",
      "Build anomaly & gesture detection",
      "Ship an intelligent sensing project",
      "Earn an ARC LABS AIoT Internship Certificate"
    ]
  },
  "aiort": {
    "certBase": "AIoRT",
    "audience": "Final-year & advanced learners",
    "outcomes": [
      "Fuse AI, IoT & robotics into one system",
      "Run vision-guided manipulation",
      "Use ROS2 with cloud intelligence",
      "Implement autonomous decision-making",
      "Deliver an AIoRT capstone at scale",
      "Earn an ARC LABS AIoRT Internship Certificate"
    ]
  },
  "advanced-iot": {
    "certBase": "Advanced IoT",
    "audience": "Advanced students & professionals",
    "outcomes": [
      "Architect production IoT systems",
      "Implement OTA, security & fleet mgmt",
      "Build scalable data pipelines",
      "Apply edge computing patterns",
      "Deploy a production-grade solution",
      "Earn an ARC LABS Advanced IoT Internship Certificate"
    ]
  }
};

const PLANS = {
  "iot": [
    {
      "title": "Orientation & IoT Landscape",
      "desc": "Map the IoT stack and set up your toolchain.",
      "topics": [
        "What IoT is and real deployments",
        "Architecture: device, gateway, cloud, app",
        "Lab setup: Arduino IDE & ESP32 toolchain",
        "Your internship project brief"
      ]
    },
    {
      "title": "Microcontroller Foundations",
      "desc": "Get hands-on with the ESP32 board.",
      "topics": [
        "ESP32 pinout, GPIO & power",
        "Digital read/write & serial debugging",
        "Blink, button & buzzer drills",
        "Reading the datasheet"
      ]
    },
    {
      "title": "Analog & Digital Sensors",
      "desc": "Interface the most-used sensors.",
      "topics": [
        "DHT11/22 temperature & humidity",
        "LDR, soil moisture & potentiometer",
        "ADC resolution & calibration",
        "Sensor wiring best practices"
      ]
    },
    {
      "title": "Actuators & Outputs",
      "desc": "Make the physical world respond.",
      "topics": [
        "LEDs, relays & motor drivers",
        "Servo control with PWM",
        "Driving loads safely",
        "Mini build: automatic night lamp"
      ]
    },
    {
      "title": "Buses: I2C & SPI",
      "desc": "Talk to smart modules.",
      "topics": [
        "I2C addressing & scanning",
        "OLED display over I2C",
        "SPI basics & SD card",
        "Combining multiple modules"
      ]
    },
    {
      "title": "Wi-Fi & Connectivity",
      "desc": "Get your device online.",
      "topics": [
        "Wi-Fi provisioning on ESP32",
        "HTTP GET/POST requests",
        "JSON payloads",
        "Handling reconnects"
      ]
    },
    {
      "title": "MQTT Messaging",
      "desc": "Publish/subscribe the IoT way.",
      "topics": [
        "MQTT broker concepts",
        "Topics, QoS & retained messages",
        "Publishing sensor data",
        "Subscribing to control a device"
      ]
    },
    {
      "title": "Cloud Dashboards",
      "desc": "See your data live.",
      "topics": [
        "ThingSpeak / Adafruit IO setup",
        "Charts, gauges & feeds",
        "Field mapping & API keys",
        "Live Smart-Room monitor"
      ]
    },
    {
      "title": "Mobile & Remote Control",
      "desc": "Control from anywhere.",
      "topics": [
        "Blynk / web app control",
        "Buttons, sliders & notifications",
        "Two-way device control",
        "Latency & UX considerations"
      ]
    },
    {
      "title": "Checkpoint Build & Review",
      "desc": "Consolidate week one into a working node.",
      "topics": [
        "Integrate sensors + cloud + control",
        "Code clean-up & structure",
        "Demo & peer review",
        "Plan the capstone scope"
      ]
    },
    {
      "title": "Data Storage & APIs",
      "desc": "Persist and serve your data.",
      "topics": [
        "Time-series storage basics",
        "REST APIs for IoT",
        "Querying historical data",
        "Rate limits & retries"
      ]
    },
    {
      "title": "Edge Logic & Automation",
      "desc": "Make devices act on their own.",
      "topics": [
        "Threshold & rule engines",
        "Local vs cloud automation",
        "Scheduling & timers",
        "Alerts & escalations"
      ]
    },
    {
      "title": "Power & Reliability",
      "desc": "Build something that lasts.",
      "topics": [
        "Deep sleep & battery life",
        "Brown-out & watchdogs",
        "Robust error handling",
        "Field-readiness checklist"
      ]
    },
    {
      "title": "IoT Security Essentials",
      "desc": "Lock it down.",
      "topics": [
        "TLS for device comms",
        "Secrets & credential handling",
        "OTA-safe practices",
        "Common IoT attack surfaces"
      ]
    },
    {
      "title": "Protocols Beyond Wi-Fi",
      "desc": "Pick the right radio.",
      "topics": [
        "BLE basics",
        "LoRa & long-range IoT",
        "Trade-offs: range/power/data",
        "When to use what"
      ]
    },
    {
      "title": "Edge + Raspberry Pi",
      "desc": "Add a gateway.",
      "topics": [
        "Pi setup & GPIO",
        "Node-RED flows",
        "Bridging MQTT to cloud",
        "Local dashboards"
      ]
    },
    {
      "title": "Capstone Design Sprint",
      "desc": "Lock your project architecture.",
      "topics": [
        "Requirements & block diagram",
        "Bill of materials",
        "Data & control flow design",
        "Milestones & risks"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Bring the hardware to life.",
      "topics": [
        "Assemble & wire the system",
        "Firmware for all sensors",
        "Cloud connection",
        "Iterative testing"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Polish and harden.",
      "topics": [
        "Automation & alerts",
        "UI/dashboard finishing",
        "Stress test & bug fixes",
        "Documentation & README"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Present like an engineer.",
      "topics": [
        "Final integration check",
        "Live demo & Q&A",
        "Project report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "embedded": [
    {
      "title": "Embedded Mindset & Setup",
      "desc": "Understand embedded vs general computing.",
      "topics": [
        "Microcontroller anatomy",
        "Toolchain: Keil/PlatformIO/CubeMX",
        "Flashing & debugging basics",
        "Internship project brief"
      ]
    },
    {
      "title": "GPIO & Digital I/O",
      "desc": "Control pins at the register level.",
      "topics": [
        "Reading the reference manual",
        "Direct register vs HAL",
        "Buttons, debouncing & LEDs",
        "Bitwise operations refresher"
      ]
    },
    {
      "title": "Timers & Interrupts",
      "desc": "Respond in real time.",
      "topics": [
        "Timer peripherals",
        "Interrupt service routines",
        "Debounce via timer",
        "Priorities & latency"
      ]
    },
    {
      "title": "PWM & Analog",
      "desc": "Shape signals and read the world.",
      "topics": [
        "PWM generation",
        "Motor & LED dimming",
        "ADC sampling & DMA",
        "Noise & filtering"
      ]
    },
    {
      "title": "Serial Comms: UART",
      "desc": "Talk to a PC and modules.",
      "topics": [
        "UART framing & baud",
        "printf-style debugging",
        "Ring buffers",
        "Protocol design basics"
      ]
    },
    {
      "title": "I2C Devices",
      "desc": "Chain smart sensors.",
      "topics": [
        "I2C protocol deep dive",
        "Sensor & EEPROM access",
        "Bus scanning & errors",
        "Multi-device handling"
      ]
    },
    {
      "title": "SPI & Displays",
      "desc": "High-speed peripherals.",
      "topics": [
        "SPI modes & timing",
        "TFT/OLED rendering",
        "SD card logging",
        "Throughput tuning"
      ]
    },
    {
      "title": "State Machines",
      "desc": "Structure firmware cleanly.",
      "topics": [
        "Finite state machines",
        "Event-driven design",
        "Non-blocking patterns",
        "Checkpoint mini-project"
      ]
    },
    {
      "title": "Intro to RTOS",
      "desc": "Run many tasks at once.",
      "topics": [
        "Why an RTOS",
        "Tasks, priorities & scheduling",
        "FreeRTOS setup",
        "Delays vs blocking"
      ]
    },
    {
      "title": "RTOS Sync",
      "desc": "Coordinate safely.",
      "topics": [
        "Queues & semaphores",
        "Mutexes & race conditions",
        "Inter-task messaging",
        "Stack sizing"
      ]
    },
    {
      "title": "Low Power Design",
      "desc": "Make it sip energy.",
      "topics": [
        "Sleep modes",
        "Wake sources",
        "Clock gating",
        "Measuring current"
      ]
    },
    {
      "title": "Robust Firmware",
      "desc": "Survive the real world.",
      "topics": [
        "Watchdog timers",
        "Fault handlers",
        "Error logging",
        "Brown-out handling"
      ]
    },
    {
      "title": "Comms to the Outside",
      "desc": "Add connectivity.",
      "topics": [
        "UART-to-Wi-Fi modules",
        "Sending sensor data",
        "Command parsing",
        "Framing & checksums"
      ]
    },
    {
      "title": "Firmware Testing",
      "desc": "Trust your code.",
      "topics": [
        "Unit testing with Unity",
        "Mocking hardware",
        "Assertions & coverage",
        "CI basics"
      ]
    },
    {
      "title": "Bootloaders & OTA",
      "desc": "Update in the field.",
      "topics": [
        "Memory layout & linker",
        "Bootloader concepts",
        "OTA update flow",
        "Rollback safety"
      ]
    },
    {
      "title": "Peripherals Capstone Prep",
      "desc": "Design your device.",
      "topics": [
        "Requirements & schematic",
        "Peripheral map",
        "Task & timing budget",
        "Risk list"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Stand up the platform.",
      "topics": [
        "Board bring-up",
        "Driver layer",
        "RTOS task skeleton",
        "Smoke tests"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Implement features.",
      "topics": [
        "Sensor + actuator logic",
        "Comms integration",
        "Power tuning",
        "Iterative debugging"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Stabilise & test.",
      "topics": [
        "Edge-case handling",
        "Test suite run",
        "Performance profiling",
        "Docs & schematic finalise"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Ship and present.",
      "topics": [
        "Final integration",
        "Live demo & code walk",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "iiot": [
    {
      "title": "OT meets IT",
      "desc": "See how factories go digital.",
      "topics": [
        "OT vs IT worlds",
        "IIoT reference architecture",
        "Industrial protocols overview",
        "Internship project brief"
      ]
    },
    {
      "title": "Industrial Sensors",
      "desc": "Measure the plant floor.",
      "topics": [
        "Temperature, vibration & current",
        "4-20mA & industrial signals",
        "Signal conditioning",
        "Wiring & isolation safety"
      ]
    },
    {
      "title": "Microcontroller Gateways",
      "desc": "Build the edge node.",
      "topics": [
        "ESP32/industrial MCU",
        "Reading multiple sensors",
        "Local buffering",
        "Edge timestamping"
      ]
    },
    {
      "title": "Modbus Fundamentals",
      "desc": "The factory lingua franca.",
      "topics": [
        "Modbus RTU vs TCP",
        "Registers & function codes",
        "Reading a Modbus device",
        "Polling strategies"
      ]
    },
    {
      "title": "PLC Basics",
      "desc": "Talk to controllers.",
      "topics": [
        "What a PLC does",
        "Ladder logic intro",
        "PLC I/O mapping",
        "Connecting MCU to PLC data"
      ]
    },
    {
      "title": "OPC-UA",
      "desc": "Standardised industrial data.",
      "topics": [
        "OPC-UA model",
        "Nodes & address space",
        "Client subscription",
        "Security modes"
      ]
    },
    {
      "title": "MQTT for Industry",
      "desc": "Move data reliably.",
      "topics": [
        "Sparkplug B concepts",
        "Topic namespaces",
        "QoS for OT",
        "Store-and-forward"
      ]
    },
    {
      "title": "SCADA Dashboards I",
      "desc": "Visualise operations.",
      "topics": [
        "SCADA concepts",
        "Tags & trends",
        "Building a live dashboard",
        "Checkpoint review"
      ]
    },
    {
      "title": "SCADA Dashboards II",
      "desc": "Alarms & control.",
      "topics": [
        "Alarm thresholds",
        "Operator controls",
        "Historical trends",
        "Role-based access"
      ]
    },
    {
      "title": "Time-Series Data",
      "desc": "Store the firehose.",
      "topics": [
        "InfluxDB/Timescale basics",
        "Downsampling & retention",
        "Querying machine data",
        "Grafana panels"
      ]
    },
    {
      "title": "Edge Computing",
      "desc": "Decide at the edge.",
      "topics": [
        "Edge vs cloud trade-offs",
        "Local rule engines",
        "Node-RED industrial flows",
        "Offline resilience"
      ]
    },
    {
      "title": "Predictive Maintenance I",
      "desc": "From data to insight.",
      "topics": [
        "Vibration & thermal signatures",
        "Feature extraction",
        "Baselines & thresholds",
        "Failure modes"
      ]
    },
    {
      "title": "Predictive Maintenance II",
      "desc": "Simple ML for PdM.",
      "topics": [
        "Anomaly detection basics",
        "Training on machine data",
        "Alerting on drift",
        "Maintenance workflows"
      ]
    },
    {
      "title": "Networking & Security",
      "desc": "Keep OT safe.",
      "topics": [
        "Industrial networks & VLANs",
        "Firewalls & DMZ",
        "Secure remote access",
        "OT security standards"
      ]
    },
    {
      "title": "Energy & Asset Monitoring",
      "desc": "Track what matters.",
      "topics": [
        "Energy metering",
        "OEE basics",
        "Asset KPIs",
        "Reporting"
      ]
    },
    {
      "title": "Capstone Design",
      "desc": "Architect an IIoT line.",
      "topics": [
        "Use-case & data flow",
        "Protocol selection",
        "Edge-to-cloud diagram",
        "Risk & safety"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Wire the edge.",
      "topics": [
        "Sensor & Modbus integration",
        "Gateway firmware",
        "Data to broker",
        "Validation"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Dashboards & rules.",
      "topics": [
        "SCADA/Grafana build",
        "Alarms & automation",
        "Historian setup",
        "Testing"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Predictive layer.",
      "topics": [
        "PdM model integration",
        "End-to-end test",
        "Documentation",
        "Demo rehearsal"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Present the solution.",
      "topics": [
        "Final integration",
        "Live demo & Q&A",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "robotics": [
    {
      "title": "Robotics Foundations",
      "desc": "Meet your robot kit.",
      "topics": [
        "Robot types & components",
        "Chassis, motors & wheels",
        "Tool & software setup",
        "Internship project brief"
      ]
    },
    {
      "title": "Motors & Drivers",
      "desc": "Make it move.",
      "topics": [
        "DC motors & gear ratios",
        "L298N/L293D drivers",
        "PWM speed control",
        "Direction & H-bridge"
      ]
    },
    {
      "title": "Microcontroller Control",
      "desc": "Brain of the bot.",
      "topics": [
        "Arduino/ESP32 motor control",
        "Pin mapping",
        "Basic movement routines",
        "Serial tele-op"
      ]
    },
    {
      "title": "Sensors for Robots",
      "desc": "Sense the surroundings.",
      "topics": [
        "Ultrasonic distance",
        "IR & line sensors",
        "Encoders",
        "Reading multiple sensors"
      ]
    },
    {
      "title": "Line Following",
      "desc": "Your first behaviour.",
      "topics": [
        "Sensor array logic",
        "Bang-bang control",
        "Tuning thresholds",
        "Track testing"
      ]
    },
    {
      "title": "Obstacle Avoidance",
      "desc": "React to the world.",
      "topics": [
        "Ultrasonic scanning",
        "Decision logic",
        "Servo-mounted sensing",
        "Mini build: roaming bot"
      ]
    },
    {
      "title": "PID Control",
      "desc": "Move smoothly.",
      "topics": [
        "Why PID",
        "Tuning P, I, D",
        "Encoder-based speed PID",
        "Straight-line driving"
      ]
    },
    {
      "title": "Kinematics Basics",
      "desc": "Know where you are.",
      "topics": [
        "Differential drive math",
        "Odometry",
        "Heading & turns",
        "Checkpoint review"
      ]
    },
    {
      "title": "Intro to ROS",
      "desc": "Industry robotics framework.",
      "topics": [
        "ROS concepts: nodes & topics",
        "Workspace & packages",
        "Publishers & subscribers",
        "roslaunch basics"
      ]
    },
    {
      "title": "ROS Messaging",
      "desc": "Wire up the system.",
      "topics": [
        "Custom messages",
        "Services & parameters",
        "rqt & rosbag",
        "Visualising in RViz"
      ]
    },
    {
      "title": "Simulation",
      "desc": "Test without breaking things.",
      "topics": [
        "Gazebo basics",
        "URDF robot model",
        "Spawning & control",
        "Sensor simulation"
      ]
    },
    {
      "title": "Teleoperation & Safety",
      "desc": "Drive responsibly.",
      "topics": [
        "Joystick/keyboard control",
        "E-stop & limits",
        "Watchdogs",
        "Logging runs"
      ]
    },
    {
      "title": "Computer Vision I",
      "desc": "Give the robot eyes.",
      "topics": [
        "Camera setup",
        "OpenCV basics",
        "Colour & shape detection",
        "Thresholding"
      ]
    },
    {
      "title": "Computer Vision II",
      "desc": "Vision-guided motion.",
      "topics": [
        "Object tracking",
        "Following a target",
        "Frame-to-motion mapping",
        "Latency handling"
      ]
    },
    {
      "title": "Mapping & Navigation",
      "desc": "Find a path.",
      "topics": [
        "Occupancy grids",
        "Path-planning intro",
        "Waypoint following",
        "Obstacle replanning"
      ]
    },
    {
      "title": "Capstone Design",
      "desc": "Plan the autonomous bot.",
      "topics": [
        "Behaviour spec",
        "Hardware & sensor map",
        "Software architecture",
        "Risks & test plan"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Assemble & drive.",
      "topics": [
        "Mechanical build",
        "Motor & sensor wiring",
        "Base control software",
        "Smoke tests"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Add autonomy.",
      "topics": [
        "Navigation/vision logic",
        "ROS integration",
        "Behaviour tuning",
        "Iterative testing"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Refine & validate.",
      "topics": [
        "Edge-case handling",
        "Field testing",
        "Documentation",
        "Demo rehearsal"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Show your robot.",
      "topics": [
        "Final integration",
        "Live autonomous demo",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "iort": [
    {
      "title": "IoRT Foundations",
      "desc": "Where robots meet the internet.",
      "topics": [
        "IoRT concept & use-cases",
        "System architecture",
        "Cloud + robot stack",
        "Internship project brief"
      ]
    },
    {
      "title": "Robot & MCU Refresher",
      "desc": "Set the base platform.",
      "topics": [
        "Mobile robot bring-up",
        "Motor & sensor control",
        "ESP32/Pi roles",
        "Tele-op baseline"
      ]
    },
    {
      "title": "Connectivity Layer",
      "desc": "Get the robot online.",
      "topics": [
        "Wi-Fi on the robot",
        "HTTP & WebSocket",
        "JSON command schema",
        "Reconnect handling"
      ]
    },
    {
      "title": "MQTT for Robots",
      "desc": "Lightweight robot messaging.",
      "topics": [
        "Telemetry topics",
        "Command topics",
        "QoS & retained state",
        "Last-will & presence"
      ]
    },
    {
      "title": "Remote Monitoring",
      "desc": "Watch from afar.",
      "topics": [
        "Streaming sensor data",
        "Live dashboard",
        "Battery & health telemetry",
        "Alerts"
      ]
    },
    {
      "title": "Remote Control",
      "desc": "Command over the cloud.",
      "topics": [
        "Cloud-to-robot commands",
        "Safety & timeouts",
        "Latency mitigation",
        "Manual override"
      ]
    },
    {
      "title": "Camera Streaming",
      "desc": "See what the robot sees.",
      "topics": [
        "MJPEG/WebRTC basics",
        "Pi camera setup",
        "Streaming to dashboard",
        "Bandwidth trade-offs"
      ]
    },
    {
      "title": "Cloud Services",
      "desc": "Back-end for robots.",
      "topics": [
        "Device registry",
        "Data storage",
        "APIs for control",
        "Checkpoint review"
      ]
    },
    {
      "title": "ROS + Cloud Bridge",
      "desc": "Connect ROS to the internet.",
      "topics": [
        "rosbridge & websockets",
        "Publishing ROS to cloud",
        "Cloud commands to ROS",
        "Security of the bridge"
      ]
    },
    {
      "title": "Autonomy + Cloud",
      "desc": "Smarter remote behaviour.",
      "topics": [
        "Cloud-triggered missions",
        "Waypoint dispatch",
        "Status reporting",
        "Failure recovery"
      ]
    },
    {
      "title": "Multi-Robot Basics",
      "desc": "More than one bot.",
      "topics": [
        "Addressing & namespaces",
        "Shared broker topics",
        "Coordination patterns",
        "Conflict handling"
      ]
    },
    {
      "title": "Swarm Communication",
      "desc": "Make them cooperate.",
      "topics": [
        "Broadcast vs targeted msgs",
        "Simple task allocation",
        "State sharing",
        "Sync challenges"
      ]
    },
    {
      "title": "Edge Intelligence",
      "desc": "Decide locally, report globally.",
      "topics": [
        "On-robot rules",
        "Edge vs cloud split",
        "Caching & offline mode",
        "Data thinning"
      ]
    },
    {
      "title": "Security for IoRT",
      "desc": "Protect connected robots.",
      "topics": [
        "TLS & auth tokens",
        "Command authorisation",
        "Threats to robots",
        "Safe defaults"
      ]
    },
    {
      "title": "Fleet Dashboard",
      "desc": "One view, many robots.",
      "topics": [
        "Fleet status board",
        "Map of robots",
        "Remote command panel",
        "Health KPIs"
      ]
    },
    {
      "title": "Capstone Design",
      "desc": "Architect a cloud robot.",
      "topics": [
        "Mission spec",
        "Comms & data design",
        "Autonomy + cloud split",
        "Risk plan"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Robot + cloud link.",
      "topics": [
        "Robot bring-up",
        "Telemetry & command path",
        "Dashboard connect",
        "Validation"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Autonomy & streaming.",
      "topics": [
        "Navigation/vision",
        "Camera stream",
        "Cloud missions",
        "Testing"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Harden the system.",
      "topics": [
        "Multi-robot/edge polish",
        "End-to-end test",
        "Documentation",
        "Demo rehearsal"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Present cloud-connected robotics.",
      "topics": [
        "Final integration",
        "Live remote demo",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "aiot": [
    {
      "title": "AIoT Foundations",
      "desc": "AI that runs on tiny hardware.",
      "topics": [
        "What AIoT/TinyML is",
        "On-device vs cloud AI",
        "Toolchain setup",
        "Internship project brief"
      ]
    },
    {
      "title": "Edge Hardware",
      "desc": "Pick your AI board.",
      "topics": [
        "ESP32 / Arduino Nano 33 / Pi",
        "Sensors for ML",
        "Compute & memory limits",
        "Power considerations"
      ]
    },
    {
      "title": "Data Collection",
      "desc": "Good models need good data.",
      "topics": [
        "Designing a dataset",
        "Sampling sensor signals",
        "Logging & labelling",
        "Data quality"
      ]
    },
    {
      "title": "ML Refresher",
      "desc": "Just enough theory.",
      "topics": [
        "Features & labels",
        "Train/validation/test",
        "Overfitting & metrics",
        "Classification vs regression"
      ]
    },
    {
      "title": "Edge Impulse I",
      "desc": "Build without heavy code.",
      "topics": [
        "Project & devices",
        "Data acquisition",
        "Feature blocks",
        "Checkpoint dataset"
      ]
    },
    {
      "title": "Edge Impulse II",
      "desc": "Train & evaluate.",
      "topics": [
        "Model architecture",
        "Training & tuning",
        "Confusion matrix",
        "On-device performance estimate"
      ]
    },
    {
      "title": "Deploy to Device",
      "desc": "Run AI on the MCU.",
      "topics": [
        "Exporting the model",
        "TFLite Micro basics",
        "Inference loop",
        "Latency & memory"
      ]
    },
    {
      "title": "Motion Classification",
      "desc": "Sense how things move.",
      "topics": [
        "Accelerometer data",
        "Gesture/activity detection",
        "Windowing",
        "Live demo"
      ]
    },
    {
      "title": "Audio & Keyword Spotting",
      "desc": "Listen at the edge.",
      "topics": [
        "Audio sampling & MFCC",
        "Keyword model",
        "False-trigger tuning",
        "On-device test"
      ]
    },
    {
      "title": "Vision at the Edge",
      "desc": "Tiny image models.",
      "topics": [
        "Camera capture",
        "Image classification",
        "Quantisation",
        "Throughput trade-offs"
      ]
    },
    {
      "title": "Anomaly Detection",
      "desc": "Spot the unusual.",
      "topics": [
        "Normal vs abnormal",
        "Threshold & autoencoder ideas",
        "Sensor drift",
        "Alerting"
      ]
    },
    {
      "title": "Sensor Fusion",
      "desc": "Combine signals.",
      "topics": [
        "Multi-sensor features",
        "Fusion strategies",
        "Robustness",
        "Edge constraints"
      ]
    },
    {
      "title": "Connect to Cloud",
      "desc": "Report intelligent results.",
      "topics": [
        "MQTT for inferences",
        "Dashboards for AI events",
        "Edge+cloud split",
        "Privacy basics"
      ]
    },
    {
      "title": "Optimisation",
      "desc": "Make models fit.",
      "topics": [
        "Quantisation & pruning",
        "Model size vs accuracy",
        "Profiling on device",
        "Energy budget"
      ]
    },
    {
      "title": "MLOps for Edge",
      "desc": "Keep models fresh.",
      "topics": [
        "Data feedback loop",
        "Versioning models",
        "OTA model updates",
        "Monitoring drift"
      ]
    },
    {
      "title": "Capstone Design",
      "desc": "Plan an intelligent device.",
      "topics": [
        "Problem & data plan",
        "Model & hardware choice",
        "Edge+cloud design",
        "Risk list"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Collect & train.",
      "topics": [
        "Dataset capture",
        "Model training",
        "Evaluation",
        "Iterate"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Deploy & integrate.",
      "topics": [
        "On-device inference",
        "Sensor + action logic",
        "Cloud reporting",
        "Testing"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Tune & validate.",
      "topics": [
        "Accuracy & latency tuning",
        "Field test",
        "Documentation",
        "Demo rehearsal"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Show intelligent sensing.",
      "topics": [
        "Final integration",
        "Live inference demo",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "aiort": [
    {
      "title": "AIoRT Foundations",
      "desc": "AI + IoT + Robotics, combined.",
      "topics": [
        "The AIoRT stack",
        "Reference architecture",
        "Tooling & ROS2 setup",
        "Internship project brief"
      ]
    },
    {
      "title": "Robot Platform Bring-up",
      "desc": "Stand up the robot.",
      "topics": [
        "ROS2 nodes & topics",
        "Drive & sensor control",
        "Tele-op baseline",
        "Health telemetry"
      ]
    },
    {
      "title": "Cloud Connectivity",
      "desc": "Link robot to cloud.",
      "topics": [
        "MQTT/ROS2 bridge",
        "Telemetry & commands",
        "Device registry",
        "Reconnect & safety"
      ]
    },
    {
      "title": "Computer Vision I",
      "desc": "Perception with deep learning.",
      "topics": [
        "Camera pipeline",
        "YOLOv8 intro",
        "Object detection",
        "Running inference"
      ]
    },
    {
      "title": "Computer Vision II",
      "desc": "From detection to action.",
      "topics": [
        "Tracking detected objects",
        "Coordinate mapping",
        "Vision-to-motion",
        "Latency handling"
      ]
    },
    {
      "title": "Manipulation Basics",
      "desc": "Reach and grasp.",
      "topics": [
        "Arm/gripper control",
        "Inverse kinematics intro",
        "Pick sequence",
        "Safety limits"
      ]
    },
    {
      "title": "Vision-Guided Picking",
      "desc": "See it, grab it.",
      "topics": [
        "Detect target object",
        "Estimate pose",
        "Plan the grasp",
        "Closed-loop correction"
      ]
    },
    {
      "title": "Edge AI Acceleration",
      "desc": "Run models fast.",
      "topics": [
        "Edge GPU/accelerators",
        "Model optimisation",
        "On-robot inference",
        "Checkpoint review"
      ]
    },
    {
      "title": "Cloud Intelligence",
      "desc": "Brains in the cloud.",
      "topics": [
        "Offloading heavy AI",
        "Cloud inference APIs",
        "Edge+cloud arbitration",
        "Cost & latency"
      ]
    },
    {
      "title": "Autonomous Decisions",
      "desc": "Let the system choose.",
      "topics": [
        "Behaviour trees/state machines",
        "Sensor-driven decisions",
        "Goal management",
        "Recovery behaviours"
      ]
    },
    {
      "title": "Navigation Stack",
      "desc": "Move with purpose.",
      "topics": [
        "ROS2 Nav2 basics",
        "Mapping & localisation",
        "Path planning",
        "Dynamic obstacles"
      ]
    },
    {
      "title": "Multi-Robot Coordination",
      "desc": "Teamwork at scale.",
      "topics": [
        "Namespacing & discovery",
        "Task allocation",
        "Shared world state",
        "Conflict resolution"
      ]
    },
    {
      "title": "Fleet Intelligence",
      "desc": "Manage many smart robots.",
      "topics": [
        "Fleet dashboard",
        "Remote missions",
        "Telemetry analytics",
        "Alerts & KPIs"
      ]
    },
    {
      "title": "Reliability & Safety",
      "desc": "Engineer for trust.",
      "topics": [
        "Fail-safe design",
        "Watchdogs & e-stop",
        "Auth & secure comms",
        "Testing autonomy safely"
      ]
    },
    {
      "title": "Data & Continuous Learning",
      "desc": "Improve over time.",
      "topics": [
        "Logging for ML",
        "Dataset curation",
        "Model retraining",
        "OTA model deploy"
      ]
    },
    {
      "title": "Capstone Design",
      "desc": "Architect an AIoRT system.",
      "topics": [
        "Mission & perception plan",
        "AI + edge + cloud design",
        "Manipulation/navigation scope",
        "Risk plan"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Perception + platform.",
      "topics": [
        "Vision pipeline",
        "Robot control",
        "Cloud link",
        "Validation"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Autonomy + manipulation.",
      "topics": [
        "Decision logic",
        "Vision-guided action",
        "Navigation",
        "Testing"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Integrate & harden.",
      "topics": [
        "End-to-end runs",
        "Performance tuning",
        "Documentation",
        "Demo rehearsal"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Present AIoRT at work.",
      "topics": [
        "Final integration",
        "Live autonomous demo",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ],
  "advanced-iot": [
    {
      "title": "Production IoT Mindset",
      "desc": "Engineer for scale & reliability.",
      "topics": [
        "Prototype vs product",
        "Reference architecture",
        "Non-functional requirements",
        "Internship project brief"
      ]
    },
    {
      "title": "Hardware Selection",
      "desc": "Choose the right platform.",
      "topics": [
        "MCU/SoC trade-offs",
        "Connectivity options",
        "Power & thermal",
        "Certification basics"
      ]
    },
    {
      "title": "Firmware Architecture",
      "desc": "Structure for longevity.",
      "topics": [
        "Modular firmware",
        "HAL & abstraction",
        "Config management",
        "Logging strategy"
      ]
    },
    {
      "title": "Robust Connectivity",
      "desc": "Stay online anywhere.",
      "topics": [
        "Wi-Fi/cellular/LoRa",
        "Backoff & retries",
        "Offline buffering",
        "Connection state machine"
      ]
    },
    {
      "title": "MQTT at Scale",
      "desc": "Messaging that holds up.",
      "topics": [
        "Topic design",
        "QoS & retained state",
        "Broker clustering",
        "Backpressure"
      ]
    },
    {
      "title": "Device Provisioning",
      "desc": "Onboard fleets safely.",
      "topics": [
        "Identity & certificates",
        "Zero-touch provisioning",
        "Claiming & registry",
        "Checkpoint review"
      ]
    },
    {
      "title": "Security Deep Dive",
      "desc": "Defend the fleet.",
      "topics": [
        "TLS/mTLS",
        "Secure boot & storage",
        "Key rotation",
        "Threat modelling"
      ]
    },
    {
      "title": "OTA Updates",
      "desc": "Ship updates safely.",
      "topics": [
        "OTA pipeline",
        "Staged rollouts",
        "Rollback & A/B",
        "Update integrity"
      ]
    },
    {
      "title": "Data Pipelines I",
      "desc": "Move data reliably.",
      "topics": [
        "Ingestion at scale",
        "Stream vs batch",
        "Time-series storage",
        "Schema design"
      ]
    },
    {
      "title": "Data Pipelines II",
      "desc": "Turn data into value.",
      "topics": [
        "Stream processing",
        "Aggregations & rollups",
        "Dashboards & APIs",
        "Cost control"
      ]
    },
    {
      "title": "Edge Computing",
      "desc": "Process near the source.",
      "topics": [
        "Edge runtimes",
        "Local inference & rules",
        "Edge-cloud sync",
        "Resilience"
      ]
    },
    {
      "title": "Cloud IoT Platforms",
      "desc": "Use managed building blocks.",
      "topics": [
        "AWS IoT / Azure IoT",
        "Rules & device shadows",
        "Greengrass/edge modules",
        "Vendor trade-offs"
      ]
    },
    {
      "title": "Fleet Management",
      "desc": "Operate thousands of devices.",
      "topics": [
        "Fleet dashboards",
        "Remote config",
        "Health & alerts",
        "Grouping & policies"
      ]
    },
    {
      "title": "Observability",
      "desc": "Know what's happening.",
      "topics": [
        "Metrics, logs & traces",
        "Device health KPIs",
        "Alerting & on-call",
        "Incident response"
      ]
    },
    {
      "title": "Reliability Engineering",
      "desc": "Plan for failure.",
      "topics": [
        "Redundancy & failover",
        "Chaos & soak testing",
        "SLalerts & SLOs",
        "Capacity planning"
      ]
    },
    {
      "title": "Capstone Architecture",
      "desc": "Design a production system.",
      "topics": [
        "Requirements & SLAs",
        "End-to-end architecture",
        "Security & scaling plan",
        "Risk register"
      ]
    },
    {
      "title": "Capstone Build I",
      "desc": "Stand up the platform.",
      "topics": [
        "Device + provisioning",
        "Connectivity & security",
        "Pipeline skeleton",
        "Validation"
      ]
    },
    {
      "title": "Capstone Build II",
      "desc": "Scale features.",
      "topics": [
        "OTA & fleet mgmt",
        "Dashboards & APIs",
        "Edge logic",
        "Load testing"
      ]
    },
    {
      "title": "Capstone Build III",
      "desc": "Harden for production.",
      "topics": [
        "Observability",
        "Failover testing",
        "Documentation & runbook",
        "Demo rehearsal"
      ]
    },
    {
      "title": "Demo Day & Certification",
      "desc": "Present a production solution.",
      "topics": [
        "Final integration",
        "Live demo & architecture walk",
        "Report submission",
        "Certificate eligibility review"
      ]
    }
  ]
};

// Evenly sample n steps from the 20-step plan, always keeping the first and last
// so every duration still runs from foundations through to the capstone demo.
function pickSteps(plan, n) {
  if (n >= plan.length) return plan;
  const out = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i * (plan.length - 1)) / (n - 1));
    out.push(plan[idx]);
  }
  return out;
}

// Internship tiers are presented to learners as week ranges rather than raw day counts.
const WEEK_LABEL = { 10: "2-3 Weeks", 15: "3-4 Weeks", 20: "4-5 Weeks" };

function buildWorkshop(plan, meta, abbr, name, days) {
  const steps = pickSteps(plan, days);
  return {
    title: `${WEEK_LABEL[days]} ${abbr} Internship`,
    subtitle: `Hands-on ${name} internship with a guided capstone project`,
    audience: meta.audience,
    totalHours: `${days * 7} hrs`,
    sessions: `${days} sessions`,
    durationLabel: WEEK_LABEL[days],
    certification: `ARC LABS ${meta.certBase} Internship Certificate`,
    modules: steps.map((s, i) => ({
      day: `DAY ${i + 1}`,
      title: s.title,
      desc: s.desc,
      topics: s.topics,
      duration: "7 hrs",
    })),
    outcomes: meta.outcomes,
  };
}

export const INTERNSHIP_DURATIONS = [
  { days: 10, label: "Internship", color: "#00d4aa", top: "2-3", sub: "Weeks" },
  { days: 15, label: "Advanced", color: "#3b82f6", top: "3-4", sub: "Weeks" },
  { days: 20, label: "Pro", color: "#f59e0b", top: "4-5", sub: "Weeks" },
];

export const buildInternshipTechnologies = (technologies) => technologies.filter(
  (t) => PLANS[t.id]
).map((t) => {
  const meta = META[t.id];
  const plan = PLANS[t.id];
  return {
    ...t,
    workshops: {
      10: buildWorkshop(plan, meta, t.abbr, t.name, 10),
      15: buildWorkshop(plan, meta, t.abbr, t.name, 15),
      20: buildWorkshop(plan, meta, t.abbr, t.name, 20),
    },
  };
});
