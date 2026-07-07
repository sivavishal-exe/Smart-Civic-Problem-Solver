/**
 * Supabase Administrative Seeding Script
 * 
 * Instructions:
 * 1. Run this script in your terminal by passing the service_role key as an environment variable:
 * 
 *    On Windows (PowerShell):
 *    $env:SUPABASE_SERVICE_KEY="your_service_role_key_here"; node scratch/seedSupabase.js
 * 
 *    On macOS/Linux/Git Bash:
 *    SUPABASE_SERVICE_KEY="your_service_role_key_here" node scratch/seedSupabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Read configuration from environment variables
const supabaseUrl = "https://ukybicwzzzvqblznfmxa.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error("❌ Error: SUPABASE_SERVICE_KEY environment variable is not defined!");
  console.log("Please define it when running the script. Example (PowerShell):");
  console.log('  $env:SUPABASE_SERVICE_KEY="sb_secret_I_..."; node scratch/seedSupabase.js');
  process.exit(1);
}

// Initialize administrative client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Seed data
const seedIssues = [
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
    officerAssigned: "A. Pitchai (Ward 3 Officer)",
    photoUrlBefore: "/road_before.jpg",
    photoUrlAfter: "/road_after.jpg",
    updates: [
      { status: "Reported", date: "2026-06-25", note: "Issue logged by citizen with 14 upvotes/merges." },
      { status: "Assigned", date: "2026-06-26", note: "Assigned to A. Pitchai (Ward 3 Officer) for site inspection." },
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
    officerAssigned: "V. Lakshmi (Ward 8 Officer)",
    photoUrlBefore: "https://images.unsplash.com/photo-1542013936693-8848e5742383?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-03", note: "Water leakage reported near GH junction." },
      { status: "Assigned", date: "2026-07-04", note: "Assigned to V. Lakshmi (Ward 8 Officer) for urgent fix." },
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
    officerAssigned: "N. Pandian (Ward 12 Officer)",
    photoUrlBefore: "https://images.unsplash.com/photo-1509021436665-8f37bc706596?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-04", note: "Citizen reported dark street due to non-functioning lamps." },
      { status: "Assigned", date: "2026-07-05", note: "Assigned to N. Pandian (Ward 12 Officer). Work order issued to contractor." }
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
    officerAssigned: "P. Karthik (Ward 7 Officer)",
    photoUrlBefore: "https://images.unsplash.com/photo-1588714082743-139a062e0d0a?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-05", note: "Stray cows reported on main road blocking transit." },
      { status: "Assigned", date: "2026-07-05", note: "Assigned to P. Karthik (Ward 7 Officer) for relocation." },
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
    officerAssigned: "T. Saravanan (Ward 15 Officer)",
    photoUrlBefore: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80",
    photoUrlAfter: "",
    updates: [
      { status: "Reported", date: "2026-07-07", note: "Urgent: Dangerously hanging wire reported by multiple residents." },
      { status: "Assigned", date: "2026-07-07", note: "Assigned to TNEB coordination team and T. Saravanan (Ward 15 Officer) for barricading." }
    ],
    duplicates: [
      { id: "DUP-701", reportedDate: "2026-07-07", phone: "9845120033", note: "Very risky for school kids passing by" }
    ]
  }
];

// Helper to translate camelCase issues object to snake_case row
const mapIssueToDb = (issue) => ({
  id: issue.id,
  category: issue.category,
  description: issue.description,
  lat: issue.location.lat,
  lng: issue.location.lng,
  address: issue.location.address,
  ward: issue.location.ward,
  status: issue.status,
  reported_date: issue.reportedDate,
  days_open: issue.daysOpen,
  duplicate_count: issue.duplicateCount,
  reported_by_phone: issue.reportedByPhone,
  officer_assigned: issue.officerAssigned,
  photo_url_before: issue.photoUrlBefore,
  photo_url_after: issue.photoUrlAfter
});

async function runSeeder() {
  console.log("🚀 Starting Supabase Administrative Seeding script...");

  for (let issue of seedIssues) {
    try {
      console.log(`Writing issue ${issue.id} to Supabase...`);
      
      // 1. Insert main issue row
      const { error: issueErr } = await supabase
        .from('issues')
        .insert(mapIssueToDb(issue));
      
      if (issueErr) throw issueErr;

      // 2. Insert updates
      if (issue.updates && issue.updates.length > 0) {
        const updateRows = issue.updates.map(u => ({
          issue_id: issue.id,
          status: u.status,
          date: u.date,
          note: u.note
        }));
        const { error: updErr } = await supabase.from('updates').insert(updateRows);
        if (updErr) console.error(`Error inserting updates for ${issue.id}:`, updErr);
      }

      // 3. Insert duplicates
      if (issue.duplicates && issue.duplicates.length > 0) {
        const dupRows = issue.duplicates.map(d => ({
          issue_id: issue.id,
          reported_date: d.reportedDate,
          phone: d.phone,
          note: d.note
        }));
        const { error: dupErr } = await supabase.from('duplicates').insert(dupRows);
        if (dupErr) console.error(`Error inserting duplicates for ${issue.id}:`, dupErr);
      }

      console.log(`✅ Successfully seeded issue ${issue.id}`);
    } catch (err) {
      console.error(`❌ Failed to seed issue ${issue.id}:`, err.message);
    }
  }

  console.log("✨ Seeding finished!");
  process.exit(0);
}

runSeeder();
