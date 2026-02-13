document.addEventListener("DOMContentLoaded", () => {

    const geoBox = document.getElementById("geo-location");

    // Comprobación básica: si el navegador no soporta geolocalización, se muestra un mensaje
    if (!navigator.geolocation) {
        geoBox.textContent = "La geolocalización no está soportada";
        return;
    }

    // Petición de ubicación al navegador y manejo de la respuesta
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            try {
                // Petición a la API de OpenStreetMap para convertir coordenadas en ciudad y país
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                );
                const data = await res.json();

                // Selección del nombre de la ciudad según lo que devuelva la API
                const city =
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    "Ciudad desconocida";

                const country = data.address.country || "";

                // Mostrar la ubicación en pantalla
                geoBox.textContent = `${city}, ${country}`;
            } catch (e) {
                // Error al consultar la API
                geoBox.textContent = "No se pudo obtener la ubicación";
            }
        },
        () => {
            // Caso en el que el usuario niega el permiso
            geoBox.textContent = "Permiso denegado";
        }
    );
});