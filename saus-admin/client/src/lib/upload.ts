// Uploads a file to the CMS media endpoint and returns its absolute public URL.
// Used by the News/Events/Campaigns editors to persist cover/banner/graphic images.
export async function uploadFile(file: File): Promise<string> {
  const token = localStorage.getItem('saus_token');
  const body = new FormData();
  body.append('file', file);
  const base = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:4400/api
  const res = await fetch(`${base}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) throw new Error('Upload failed');
  const j = await res.json();
  return j.url as string; // absolute URL from the media route
}
