import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isKeyConfigured = supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

if (!isKeyConfigured) {
  console.warn(
    "⚠️ Supabase Anon Key is not configured yet. The application will run in Mock/Offline demo mode using local seed data. " +
    "To enable full live database integration, replace VITE_SUPABASE_ANON_KEY in your .env file with your actual Supabase Anon key."
  );
}

export const isSupabaseReady = isKeyConfigured;

// Initialize client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Map database row into frontend issue object format
export const mapDbToIssue = (dbIssue) => {
  if (!dbIssue) return null;
  return {
    id: dbIssue.id,
    category: dbIssue.category,
    description: dbIssue.description,
    location: {
      lat: dbIssue.lat,
      lng: dbIssue.lng,
      address: dbIssue.address,
      ward: dbIssue.ward
    },
    status: dbIssue.status,
    reportedDate: dbIssue.reported_date || dbIssue.reportedDate,
    daysOpen: dbIssue.days_open !== undefined ? dbIssue.days_open : dbIssue.daysOpen,
    duplicateCount: dbIssue.duplicate_count !== undefined ? dbIssue.duplicate_count : dbIssue.duplicateCount,
    reportedByPhone: dbIssue.reported_by_phone || dbIssue.reportedByPhone,
    officerAssigned: dbIssue.officer_assigned || dbIssue.officerAssigned,
    photoUrlBefore: dbIssue.photo_url_before || dbIssue.photoUrlBefore,
    photoUrlAfter: dbIssue.photo_url_after || dbIssue.photoUrlAfter,
    updates: (dbIssue.updates || [])
      .map(u => ({
        status: u.status,
        date: u.date,
        note: u.note
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    duplicates: (dbIssue.duplicates || [])
      .map(d => ({
        id: d.id,
        reportedDate: d.reported_date || d.reportedDate,
        phone: d.phone,
        note: d.note
      }))
      .sort((a, b) => new Date(a.reportedDate) - new Date(b.reportedDate))
  };
};

// Map frontend issue object format into database row format
export const mapIssueToDb = (issue) => {
  if (!issue) return null;
  return {
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
  };
};
