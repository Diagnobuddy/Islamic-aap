// ============ NEARBY MASJID MODULE (Google Places API) ============

let masjidMap = null;
let masjidUserLat = null;
let masjidUserLng = null;
let masjidMarkersLayer = null;

function renderMasjid() {
  document.getElementById('masjid').innerHTML = `
    <div class="card" style="padding:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div class="card-title" style="margin:0;"><span>🕌</span> Nearby Masjids</div>
        <button onclick="refreshMasjidSearch()" style="padding:6px 12px;border:none;background:var(--primary);color:white;border-radius:8px;cursor:pointer;font-family:inherit;font-size:0.8rem;">
          🔄 Refresh
        </button>
      </div>
      <div id="masjid-status" style="font-size:0.8rem;color:var(--text-muted);padding:6px 0;text-align:center;">
        📍 Loading map...
      </div>
      <div id="masjid-map" style="height:340px;border-radius:12px;margin-bottom:12px;border:1px solid var(--border);background:#e5e5e5;"></div>
      <div style="font-size:0.75rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
        Nearby Masjids List
      </div>
      <div id="masjid-list" style="max-height:400px;overflow-y:auto;background:var(--bg);border-radius:12px;">
        <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Loading...</div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    initMasjidMap();
  }, 100);
}

function initMasjidMap() {
  if (masjidMap) {
    try { masjidMap.remove(); } catch(e) {}
    masjidMap = null;
  }
  
  try {
    masjidMap = L.map('masjid-map').setView([28.6139, 77.2090], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(masjidMap);
    
    masjidMarkersLayer = L.layerGroup().addTo(masjidMap);
    
    setTimeout(() => { if (masjidMap) masjidMap.invalidateSize(); }, 200);
    
  } catch (e) {
    console.error('Map init error:', e);
    document.getElementById('masjid-status').textContent = '❌ Map failed to load';
    return;
  }
  
  if (navigator.geolocation) {
    document.getElementById('masjid-status').textContent = '📍 Getting your location...';
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        masjidUserLat = pos.coords.latitude;
        masjidUserLng = pos.coords.longitude;
        
        masjidMap.setView([masjidUserLat, masjidUserLng], 14);
        
        L.circleMarker([masjidUserLat, masjidUserLng], {
          radius: 10,
          fillColor: '#0B3D2E',
          color: 'white',
          weight: 3,
          opacity: 1,
          fillOpacity: 1
        }).addTo(masjidMap).bindPopup('<b>📍 आप यहाँ हैं</b>');
        
        fetchNearbyMasjids(masjidUserLat, masjidUserLng);
      },
      (err) => {
        console.error('Location error:', err);
        document.getElementById('masjid-status').textContent = '❌ Location access denied.';
        document.getElementById('masjid-list').innerHTML = '<div style="padding:20px;text-align:center;color:#DC2626;font-size:0.85rem;">Location चाहिए masjid ढूंढने के लिए।</div>';
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }
}

function refreshMasjidSearch() {
  if (masjidUserLat && masjidUserLng) {
    fetchNearbyMasjids(masjidUserLat, masjidUserLng);
  } else {
    initMasjidMap();
  }
}

async function fetchNearbyMasjids(lat, lng) {
  document.getElementById('masjid-status').textContent = '🔍 Searching masjids (5 km)...';
  document.getElementById('masjid-list').innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Searching...</div>';
  
  if (masjidMarkersLayer) masjidMarkersLayer.clearLayers();
  
  try {
    const { Place } = await google.maps.importLibrary("places");
    
    const request = {
      fields: ["displayName", "location", "formattedAddress"],
      locationRestriction: {
        center: { lat: lat, lng: lng },
        radius: 5000,
      },
      includedPrimaryTypes: ["mosque"],
      maxResultCount: 20,
      rankPreference: "DISTANCE",
    };
    
    const { places } = await Place.searchNearby(request);
    
    console.log('Google Places API returned:', places.length, 'masjids');
    
    displayMasjids(places, lat, lng);
    
  } catch (e) {
    console.error('Google Places error:', e);
    document.getElementById('masjid-status').textContent = '❌ Search failed: ' + e.message;
    document.getElementById('masjid-list').innerHTML = '<div style="padding:20px;text-align:center;color:#DC2626;font-size:0.85rem;">Error: ' + e.message + '</div>';
  }
}

function displayMasjids(places, userLat, userLng) {
  const status = document.getElementById('masjid-status');
  const list = document.getElementById('masjid-list');
  
  if (places.length === 0) {
    status.textContent = '⚠️ कोई masjid नहीं मिली';
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">इस area में कोई masjid नहीं मिली।</div>';
    return;
  }
  
  status.textContent = `✅ ${places.length} masjids मिलीं (5 km के अंदर)`;
  list.innerHTML = '';
  
  places.forEach((place, i) => {
    const mLat = place.location.lat();
    const mLng = place.location.lng();
    const name = place.displayName || 'Masjid';
    const address = place.formattedAddress || '';
    const distance = getDistance(userLat, userLng, mLat, mLng).toFixed(2);
    
    const marker = L.marker([mLat, mLng], {
      icon: L.divIcon({
        className: 'custom-masjid-marker',
        html: '<div style="font-size:22px;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,0.3);">🕌</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      })
    });
    
    marker.bindPopup(`
      <b>🕌 ${name}</b><br>
      <span style="font-size:0.75rem;color:#666;">${address}</span><br>
      <span style="font-size:0.8rem;color:#666;">${distance} km away</span><br>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${mLat},${mLng}" target="_blank" style="color:#D4AF37;font-weight:600;font-size:0.8rem;">Directions →</a>
    `);
    masjidMarkersLayer.addLayer(marker);
    
    const item = document.createElement('div');
    item.style.cssText = 'padding:12px;border-bottom:1px solid var(--border);cursor:pointer;';
    item.onmouseover = () => item.style.background = 'rgba(11,61,46,0.05)';
    item.onmouseout = () => item.style.background = 'transparent';
    item.innerHTML = `
      <div style="font-weight:600;color:var(--primary);font-size:0.9rem;">🕌 ${name}</div>
      ${address ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${address}</div>` : ''}
      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;display:flex;justify-content:space-between;align-items:center;">
        <span>📍 ${distance} km</span>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${mLat},${mLng}" target="_blank" style="color:var(--accent);text-decoration:none;font-weight:600;">Directions →</a>
      </div>
    `;
    
    item.onclick = (e) => {
      if (e.target.tagName === 'A') return;
      masjidMap.flyTo([mLat, mLng], 17);
      marker.openPopup();
    };
    
    list.appendChild(item);
  });
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function initMasjid() {
  renderMasjid();
}