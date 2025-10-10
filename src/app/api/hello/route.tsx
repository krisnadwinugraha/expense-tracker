import { NextResponse } from 'next/server'

export async function GET(request) {
  // This function handles GET requests to /api/hello
  return NextResponse.json({ message: 'Hello from the App Router backend!' })
}
