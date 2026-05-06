import os
from supabase import create_client

url = "https://tfsntzwwzhxybqgbxmag.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc250end3emh4eWJxZ2J4bWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgwNTI5OSwiZXhwIjoyMDkzMzgxMjk5fQ.m0rT8Pavv3HO2aXFSNrvn9I54SQBuUM5JVR5syp-tgA"

supabase = create_client(url, key)

res = supabase.table("profiles").select("id, full_name, role").limit(5).execute()
print(res.data)
