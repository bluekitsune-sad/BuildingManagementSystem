export const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400, max-age=0',
}

export function withCache(data, options = {}) {
  return new Response(
    JSON.stringify(data),
    {
      status: options.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...cacheHeaders,
      },
    }
  )
}

export function cacheResponse(NextResponse, data, options = {}) {
  const response = NextResponse.json(data, { status: options.status || 200 })
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
