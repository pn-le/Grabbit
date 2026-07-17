import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../lib/api'
import { useApp } from '../state/AppContext'
import { STORES, chainById } from '../data/stores'

function chainIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #0a0a0a;box-shadow:0 0 0 2px ${color}55"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export function MapScreen() {
  const { location } = useApp()
  const [dealCounts, setDealCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // one big page is enough for a per-store count overlay
    void api
      .getDeals({ sort: 'newest', page: 0, storeIds: [], categories: [], source: 'all' }, location)
      .then(async (first) => {
        const counts: Record<string, number> = {}
        let page = first
        let pageNo = 0
        for (;;) {
          for (const d of page.deals) counts[d.storeId] = (counts[d.storeId] ?? 0) + 1
          if (!page.hasMore || pageNo > 12) break
          pageNo += 1
          page = await api.getDeals(
            { sort: 'newest', page: pageNo, storeIds: [], categories: [], source: 'all' },
            location,
          )
        }
        setDealCounts(counts)
      })
  }, [location])

  return (
    <div className="relative h-[calc(100dvh-56px)]">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={12}
        className="h-full w-full"
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {STORES.map((s) => {
          const chain = chainById(s.chainId)
          const count = dealCounts[s.id] ?? 0
          return (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={chainIcon(chain.color)}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong>{s.name}</strong>
                  <br />
                  <span style={{ fontSize: 12 }}>{s.address}</span>
                  <br />
                  <span style={{ fontSize: 12 }}>
                    {count > 0 ? `🏷️ ${count} live deal${count === 1 ? '' : 's'}` : 'No live deals'}
                  </span>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      <div className="glass absolute right-3 bottom-20 left-3 z-[1000] rounded-2xl border border-edge p-3">
        <p className="text-xs text-neutral-400">
          {Object.values(dealCounts).reduce((a, b) => a + b, 0)} live deals across{' '}
          {Object.keys(dealCounts).length} stores near you ·{' '}
          <Link to="/" className="font-semibold text-sticker">
            View feed →
          </Link>
        </p>
      </div>
    </div>
  )
}
