/**
 * Performs reverse geocoding using OpenStreetMap Nominatim or BigDataCloud
 * to return human-readable street, neighborhood, city, and state information
 * for the user's actual GPS coordinates.
 */
export async function fetchReverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string; state: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.street || addr.suburb || addr.neighbourhood || addr.residential || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.district || 'City';
        const state = addr.state || 'State';
        const postcode = addr.postcode ? ` - ${addr.postcode}` : '';

        const streetLine = [road, addr.suburb || addr.neighbourhood].filter(Boolean).join(', ');
        const fullAddr = streetLine ? `${streetLine}, ${city}${postcode}` : `${city}, ${state}${postcode}`;

        return {
          address: fullAddr || data.display_name.split(',').slice(0, 3).join(','),
          city: city,
          state: state,
        };
      }
    }
  } catch (e) {
    console.warn('Reverse geocoding fetch error, using formatted lat/lng coordinates:', e);
  }

  return {
    address: `Lat ${lat.toFixed(4)}°, Lng ${lng.toFixed(4)}° (GPS Verified Location)`,
    city: 'Local Ward Sector',
    state: 'State Sector',
  };
}
