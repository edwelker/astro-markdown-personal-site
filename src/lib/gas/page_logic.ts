import { filterGasData } from '../gas-filter';
import { calculateDistances } from '../gas-distance';
import { sortGasData } from '../gas-sort';

export function formatPrice(val: any) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
  return isNaN(num) ? String(val) : num.toFixed(2);
}

export function initGasPage() {
    const tableBody = document.getElementById('gas-table-body');
    // Exit if the main table element isn't on the page. This makes the script
    // more robust in case it's loaded on a page without the gas table.
    if (!tableBody) {
      return;
    }

    const dataElement = document.getElementById('gas-data');
    if (!dataElement || !dataElement.textContent) return;

    const initialData = JSON.parse(dataElement.textContent);
    console.log("Gas script initialized. Total rows:", initialData.length);

    let sortCol = 'Net';
    let sortAsc = true;
    let filterQuery = "";
    let userCoords: any = null;
    let distances: any = {}; // Keyed by Address: { duration: seconds, distance: miles }

    const filterInput = document.getElementById('gas-filter') as HTMLInputElement;
    const distanceBtn = document.getElementById('sort-distance') as HTMLButtonElement;
    const distanceStatus = document.getElementById('distance-status');
    const headers = document.querySelectorAll('th[data-sort]');

    async function calculateAllDistances() {
      console.log("UI: calculateAllDistances triggered");
      
      const uiCallbacks = {
        setStatus: (text: string, show: boolean) => {
          if (distanceStatus) {
            distanceStatus.style.display = show ? 'block' : 'none';
            if (text) distanceStatus.textContent = text;
          }
        },
        setButtonState: (text: string, disabled: boolean) => {
          if (distanceBtn) {
            distanceBtn.textContent = text;
            distanceBtn.disabled = disabled;
          }
        },
        alert: (message: string) => alert(message),
        updateTable: updateTable
      };

      const result = await calculateDistances({
        initialData,
        distances,
        userCoords,
        uiCallbacks
      });

      if (result) {
        distances = result.newDistances;
        userCoords = result.newUserCoords;
        // Final table update to ensure it reflects the final state after all batches.
        updateTable(); 
      }
    }

    function renderTable(data: any[]) {
      if (!tableBody) return;
      tableBody.innerHTML = data.map(row => {
        const d = distances[row.Address];
        const displayStr = d ? `${Math.round(d.duration / 60)}m (${d.distance.toFixed(1)}mi)` : '—';

        const streetRaw = (row.Address || "").split(',')[0].replace(/^\d+\S*\s+/, "");
        const street = streetRaw.toLowerCase().split(/\s+/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const city = (row.City || '').split('/')[0].trim();
        const displayLocation = `<strong>${row.Station || ''}</strong>: <span class="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">${street}, ${city}</span>`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${row.Address}, ${row.City} ${row.Zip}`)}`;

        return `
        <tr
          class="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          data-lat="${row.lat || ''}"
          data-lng="${row.lng || ''}"
        >
          <td class="px-2 py-3 font-medium">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline block">
              ${displayLocation}
            </a>
          </td>
          <td class="px-2 py-3 text-right whitespace-nowrap">${formatPrice(row.Base)}</td>
          <td class="hidden sm:table-cell px-2 py-3 text-right whitespace-nowrap">${row.Discount || ''}</td>
          <td class="px-2 py-3 text-right whitespace-nowrap font-bold">${formatPrice(row.Net)}</td>
          <td class="px-2 py-3 text-right whitespace-nowrap ${d ? '' : 'text-neutral-400 italic'}">${displayStr}</td>
        </tr>
      `}).join('');
    }

    function updateTable() {
      // Filter
      let filtered = filterGasData(initialData, filterQuery);

      // Sort
      if (sortCol) {
        sortGasData(filtered, { sortCol, sortAsc, distances });
      }

      // Update Headers
      headers.forEach(th => {
        const col = th.getAttribute('data-sort');
        const label = th.getAttribute('data-label');
        let arrow = ' ↕';
        if (col === sortCol) {
          arrow = sortAsc ? ' ↑' : ' ↓';
        }
        if (label) th.textContent = label + arrow;
      });

      renderTable(filtered);
    }

    headers.forEach(th => {
      th.addEventListener('click', () => {
        const column = th.getAttribute('data-sort');
        console.log("Header clicked:", column);
        if (column === 'Time' && !userCoords) {
          calculateAllDistances();
          return;
        }
        if (sortCol === column) {
          sortAsc = !sortAsc;
        } else {
          sortCol = column;
          sortAsc = true;
        }
        updateTable();
      });
    });

    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
        filterQuery = (e.target as HTMLInputElement).value.toLowerCase();
        updateTable();
        });
    }

    if (distanceBtn) {
        distanceBtn.addEventListener('click', () => {
        console.log("Button clicked");
        calculateAllDistances();
        });
    }
}
