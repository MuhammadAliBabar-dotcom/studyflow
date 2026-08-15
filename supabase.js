const SUPABASE_URL = "https://mgolcrdiugbegcvljhzm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__eopUqWge5RDYarxvvgBGg_sgzR0mO0";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);