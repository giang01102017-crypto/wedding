/* Public Supabase configuration for the wedding invitation.
   The anon key is designed to be public — it is protected by Row Level Security
   on the database (see rsvp table policies). Never expose the service role key. */
window.__WEDDING_ENV__ = {
  SUPABASE_URL: "https://dlhsvxunwvfjgvvwxdtg.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaHN2eHVud3Zmamd2dnd4ZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzM3MTgsImV4cCI6MjA5ODgwOTcxOH0.ZhalZPOyGRNPqelq3OBF4vkDDa3isCJKVcQjVU_dcrQ"
};
