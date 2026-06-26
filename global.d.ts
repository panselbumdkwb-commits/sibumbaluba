// Deklarasi global agar process.env tersedia tanpa @types/node
declare const process: {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    [key: string]: string | undefined
  }
}
