document.addEventListener("DOMContentLoaded", () => {

    const geoBox = document.getElementById("geo-location");

    if (!navigator.geolocation) {
        geoBox.textContent = "La geolocalización no está soportada";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            // Crear mapa siempre
            const map = L.map('map').setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);
            L.marker([lat, lon]).addTo(map);

            try {
                // API estable sin CORS
                const res = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`
                );
                const data = await res.json();

                const city = data.city || data.locality || "Ciudad desconocida";
                const country = data.countryName || "";

                geoBox.textContent = `${city}, ${country}`;

            } catch (e) {
                geoBox.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
            }
        },

        () => {
            geoBox.textContent = "Permiso denegado";
        }
    );
});
