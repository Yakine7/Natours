/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken =
        "pk.eyJ1IjoieWFraW5lIiwiYSI6ImNsbzIyam5lYjBlcmsya21zOHd5YmtkNzEifQ.S8TY_W5xOIggsy7addGb8Q";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/yakine/clo23wn6i004n01pgg3sc9unu",
        scrollZoom: false,
        // center: [-118.113491, 34.111745],
        // zoom: 5,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        // Add marker
        const el = document.createElement("div");
        el.className = "marker";

        new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
            .addTo(map);

        // Extends map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100,
        },
    });
};
