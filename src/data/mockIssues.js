// Mock data for Smart Theni Civic Problem Solver

export const WARD_OFFICERS = {
  "Ward 2": "M. Murugan (Ward 2 Officer)",
  "Ward 3": "A. Pitchai (Ward 3 Officer)",
  "Ward 4": "K. Meena (Ward 4 Officer)",
  "Ward 5": "S. Rajesh (Ward 5 Officer)",
  "Ward 7": "P. Karthik (Ward 7 Officer)",
  "Ward 8": "V. Lakshmi (Ward 8 Officer)",
  "Ward 11": "R. Selvam (Ward 11 Officer)",
  "Ward 12": "N. Pandian (Ward 12 Officer)",
  "Ward 15": "T. Saravanan (Ward 15 Officer)",
};

export const CATEGORIES = {
  "Garbage": { label: "Garbage / குப்பை", severity: 4, color: "#94a3b8" },
  "Street Light": { label: "Street Light / தெருவிளக்கு", severity: 4, color: "#eab308" },
  "Drainage": { label: "Drainage / சாக்கடை", severity: 6, color: "#78350f" },
  "Road Damage": { label: "Road Damage / சாலை பழுது", severity: 6, color: "#475569" },
  "Water Leakage": { label: "Water Leakage / குடிநீர் கசிவு", severity: 7, color: "#0ea5e9" },
  "Stray Cattle": { label: "Stray Cattle / தெரு மாடுகள்", severity: 5, color: "#d97706" },
  "Public Safety": { label: "Public Safety / பொது பாதுகாப்பு", severity: 10, color: "#dc2626" },
  "Other": { label: "Other / இதர", severity: 3, color: "#64748b" }
};

export const STATUS_FLOW = ["Reported", "Assigned", "In Progress", "Solved"];

export const getSeverityWeight = (category) => {
  return CATEGORIES[category]?.severity || 3;
};

// Urgency score calculation
// urgency = (duplicate_count * 2) + category_severity_weight + days_open
export const calculateUrgencyScore = (issue) => {
  const duplicateCount = issue.duplicateCount || 0;
  const severityWeight = getSeverityWeight(issue.category);
  const daysOpen = issue.daysOpen || 0;
  return (duplicateCount * 2) + severityWeight + daysOpen;
};

// Distance helper (Haversine formula) to check for duplicate reports (within ~50m)
export const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

export const seedIssues = [
  {
    id: "THN-2026-001",
    category: "Road Damage",
    description: "Huge pothole at the main junction of Periyakulam Road near the bus stop. Damaging suspension and causing minor accidents for two-wheelers.",
    location: {
      lat: 10.0110,
      lng: 77.4735,
      address: "Periyakulam Road, near Old Bus Stand, Theni",
      ward: "Ward 3"
    },
    status: "Solved",
    reportedDate: "2026-06-25",
    daysOpen: 6,
    duplicateCount: 14,
    reportedByPhone: "9876543210",
    officerAssigned: WARD_OFFICERS["Ward 3"],
    photoUrlBefore: "/road_before.jpg",
    photoUrlAfter: "/road_after.jpg",
    updates: [
      { status: "Reported", date: "2026-06-25", note: "Issue logged by citizen with 14 upvotes/merges." },
      { status: "Assigned", date: "2026-06-26", note: `Assigned to ${WARD_OFFICERS["Ward 3"]} for site inspection.` },
      { status: "In Progress", date: "2026-06-28", note: "Road maintenance crew deployed. Patching work in progress." },
      { status: "Solved", date: "2026-07-01", note: "Pothole filled and leveled. Re-asphalted. Citizens confirmed the fix." }
    ],
    duplicates: [
      { id: "DUP-101", reportedDate: "2026-06-25", phone: "9443215566", note: "Very deep pothole, dangerous at night" },
      { id: "DUP-102", reportedDate: "2026-06-26", phone: "9003312211", note: "My bike tire got punctured here" }
    ]
  },
  {
    id: "THN-2026-002",
    category: "Garbage",
    description: "Massive pile of solid waste dumped near the residential street corner. Cows and dogs scattering it all over the place. Emitting foul smell.",
    location: {
      lat: 10.0195,
      lng: 77.4795,
      address: "Kamarajar Street Cross, Periyakulam Road, Theni",
      ward: "Ward 5"
    },
    status: "Reported",
    reportedDate: "2026-07-05",
    daysOpen: 2,
    duplicateCount: 3,
    reportedByPhone: "9123456789",
    officerAssigned: "",
    photoUrlBefore: "/garbage_before.jpg",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-05", note: "Issue reported by citizen. AI auto-detected Category: Garbage with 94% confidence." }
    ],
    duplicates: [
      { id: "DUP-201", reportedDate: "2026-07-06", phone: "9988776655", note: "Garbage not cleared for 5 days" }
    ]
  },
  {
    id: "THN-2026-003",
    category: "Water Leakage",
    description: "Municipal supply main pipe burst, clean drinking water leaking onto the road. Wasting thousands of liters every supply cycle.",
    location: {
      lat: 10.0055,
      lng: 77.4690,
      address: "Cumbum Road, opposite Government Hospital, Theni",
      ward: "Ward 8"
    },
    status: "In Progress",
    reportedDate: "2026-07-03",
    daysOpen: 4,
    duplicateCount: 8,
    reportedByPhone: "9445123456",
    officerAssigned: WARD_OFFICERS["Ward 8"],
    photoUrlBefore: "https://images.unsplash.com/photo-1542013936693-8848e5742383?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-03", note: "Water leakage reported near GH junction." },
      { status: "Assigned", date: "2026-07-04", note: `Assigned to ${WARD_OFFICERS["Ward 8"]} for urgent fix.` },
      { status: "In Progress", date: "2026-07-05", note: "Excavation completed. Pipe section replacement in progress." }
    ],
    duplicates: []
  },
  {
    id: "THN-2026-004",
    category: "Street Light",
    description: "Four consecutive street lights are not functioning. The entire residential street is Pitch-dark and unsafe for women and children at night.",
    location: {
      lat: 10.0080,
      lng: 77.4612,
      address: "Subramaniyapuram 2nd Street, Bodi Road, Theni",
      ward: "Ward 12"
    },
    status: "Assigned",
    reportedDate: "2026-07-04",
    daysOpen: 3,
    duplicateCount: 1,
    reportedByPhone: "9047123999",
    officerAssigned: WARD_OFFICERS["Ward 12"],
    photoUrlBefore: "https://images.unsplash.com/photo-1509021436665-8f37bc706596?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-04", note: "Citizen reported dark street due to non-functioning lamps." },
      { status: "Assigned", date: "2026-07-05", note: `Assigned to ${WARD_OFFICERS["Ward 12"]}. Work order issued to contractor.` }
    ],
    duplicates: []
  },
  {
    id: "THN-2026-005",
    category: "Drainage",
    description: "Drainage block causing dirty water to overflow onto the street. Creating mosquito breeding ground and heavy stench.",
    location: {
      lat: 10.0142,
      lng: 77.4712,
      address: "Allinagaram Pillayar Kovil Street, Theni",
      ward: "Ward 2"
    },
    status: "Reported",
    reportedDate: "2026-07-06",
    daysOpen: 1,
    duplicateCount: 0,
    reportedByPhone: "9789123456",
    officerAssigned: "",
    photoUrlBefore: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-06", note: "Stagnant drainage reported near Pillayar Kovil." }
    ],
    duplicates: []
  },
  {
    id: "THN-2026-006",
    category: "Stray Cattle",
    description: "About 6-7 stray cows sitting in the middle of the busy road, blocking traffic and causing sudden braking and near-misses.",
    location: {
      lat: 10.0125,
      lng: 77.4785,
      address: "N.R.T. Nagar Main Road, Theni",
      ward: "Ward 7"
    },
    status: "In Progress",
    reportedDate: "2026-07-05",
    daysOpen: 2,
    duplicateCount: 2,
    reportedByPhone: "8903124578",
    officerAssigned: WARD_OFFICERS["Ward 7"],
    photoUrlBefore: "https://images.unsplash.com/photo-1588714082743-139a062e0d0a?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-05", note: "Stray cows reported on main road blocking transit." },
      { status: "Assigned", date: "2026-07-05", note: `Assigned to ${WARD_OFFICERS["Ward 7"]} for relocation.` },
      { status: "In Progress", date: "2026-07-06", note: "Sanitary workers coordinating with cattle owners. Fines issued." }
    ],
    duplicates: []
  },
  {
    id: "THN-2026-007",
    category: "Public Safety",
    description: "High tension electrical wire snapped and is hanging dangerously low near the pedestrian walkway. High hazard of electrocution.",
    location: {
      lat: 10.0095,
      lng: 77.4750,
      address: "Nehruji Road, near Post Office, Theni",
      ward: "Ward 15"
    },
    status: "Assigned",
    reportedDate: "2026-07-07",
    daysOpen: 0,
    duplicateCount: 5,
    reportedByPhone: "9003344556",
    officerAssigned: WARD_OFFICERS["Ward 15"],
    photoUrlBefore: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-07", note: "Urgent: Dangerously hanging wire reported by multiple residents." },
      { status: "Assigned", date: "2026-07-07", note: `Assigned to TNEB coordination team and ${WARD_OFFICERS["Ward 15"]} for barricading.` }
    ],
    duplicates: [
      { id: "DUP-701", reportedDate: "2026-07-07", phone: "9845120033", note: "Very risky for school kids passing by" }
    ]
  },
  {
    id: "THN-2026-008",
    category: "Water Leakage",
    description: "Supply valve leaking at the end of Bungalow Street, water is pooling and making the road muddy.",
    location: {
      lat: 10.0160,
      lng: 77.4760,
      address: "Bungalow Street, Ward 4, Theni",
      ward: "Ward 4"
    },
    status: "Solved",
    reportedDate: "2026-06-20",
    daysOpen: 3,
    duplicateCount: 2,
    reportedByPhone: "7010234567",
    officerAssigned: WARD_OFFICERS["Ward 4"],
    photoUrlBefore: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=600&q=80",
    updates: [
      { status: "Reported", date: "2026-06-20", note: "Valve leak reported." },
      { status: "Assigned", date: "2026-06-21", note: `Assigned to ${WARD_OFFICERS["Ward 4"]} plumber.` },
      { status: "In Progress", date: "2026-06-22", note: "Gaskets and valve seals being replaced." },
      { status: "Solved", date: "2026-06-23", note: "Valve replaced, leakage completely arrested. Area cleaned." }
    ],
    duplicates: []
  },
  {
    id: "THN-2026-009",
    category: "Road Damage",
    description: "Asphalt washed away near the library corner due to recent rains, leaving dangerous loose gravel.",
    location: {
      lat: 10.0068,
      lng: 77.4715,
      address: "Subban Street, Ward 11, Theni",
      ward: "Ward 11"
    },
    status: "Reported",
    reportedDate: "2026-07-06",
    daysOpen: 1,
    duplicateCount: 1,
    reportedByPhone: "9003551122",
    officerAssigned: "",
    photoUrlBefore: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-06", note: "Loose gravel and broken road reported." }
    ],
    duplicates: []
  }
];

// Helper to simulate AI Classification
export const mockAIClassify = (fileName, description = "") => {
  const text = (fileName + " " + description).toLowerCase();
  
  if (text.includes("light") || text.includes("lamp") || text.includes("dark") || text.includes("மின்விளக்கு")) {
    return { category: "Street Light", confidence: 91 };
  }
  if (text.includes("drain") || text.includes("sewer") || text.includes("overflow") || text.includes("சாக்கடை")) {
    return { category: "Drainage", confidence: 89 };
  }
  if (text.includes("water") || text.includes("pipe") || text.includes("leak") || text.includes("குடிநீர்")) {
    return { category: "Water Leakage", confidence: 93 };
  }
  if (text.includes("road") || text.includes("pothole") || text.includes("gravel") || text.includes("சாலை")) {
    return { category: "Road Damage", confidence: 95 };
  }
  if (text.includes("cow") || text.includes("bull") || text.includes("cattle") || text.includes("stray") || text.includes("மாடு")) {
    return { category: "Stray Cattle", confidence: 88 };
  }
  if (text.includes("wire") || text.includes("electric") || text.includes("danger") || text.includes("பாதுகாப்பு")) {
    return { category: "Public Safety", confidence: 96 };
  }
  if (text.includes("garbage") || text.includes("trash") || text.includes("waste") || text.includes("plastic") || text.includes("குப்பை")) {
    return { category: "Garbage", confidence: 94 };
  }
  
  // Default fallback or randomized
  const categoriesList = Object.keys(CATEGORIES).filter(c => c !== "Other");
  const randomCat = categoriesList[Math.floor(Math.random() * categoriesList.length)];
  const randomConf = Math.floor(Math.random() * 25) + 70; // 70% to 94%
  return { category: randomCat, confidence: randomConf };
};
