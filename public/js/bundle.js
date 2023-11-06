(() => {
  // public/js/alerts.js
  var hideAlert = () => {
    const el = document.querySelector(".alert");
    if (el)
      el.parentElement.removeChild(el);
  };
  var showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout(hideAlert, 5e3);
  };

  // public/js/login.js
  var login = async (email, password) => {
    try {
      const res = await axios.post("/api/v1/users/login", {
        email,
        password
      });
      if (res.data.status === "success") {
        showAlert("success", "Logged in successfully");
        window.setTimeout(() => {
          location.assign("/");
        }, 1500);
      }
    } catch (err) {
      showAlert("error", err.response.data.message);
    }
  };
  var logout = async () => {
    try {
      const res = await axios.get("/api/v1/users/logout");
      if (res.data.status = "success")
        location.reload(true);
    } catch (err) {
      showAlert("error", "Error logging out! try again");
    }
  };

  // public/js/mapbox.js
  var displayMap = (locations) => {
    mapboxgl.accessToken = "pk.eyJ1IjoieWFraW5lIiwiYSI6ImNsbzIyam5lYjBlcmsya21zOHd5YmtkNzEifQ.S8TY_W5xOIggsy7addGb8Q";
    var map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/yakine/clo23wn6i004n01pgg3sc9unu",
      scrollZoom: false
      // center: [-118.113491, 34.111745],
      // zoom: 5,
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc) => {
      const el = document.createElement("div");
      el.className = "marker";
      new mapboxgl.Marker({
        element: el,
        anchor: "bottom"
      }).setLngLat(loc.coordinates).addTo(map);
      new mapboxgl.Popup({
        offset: 30
      }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`).addTo(map);
      bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 200,
        left: 100,
        right: 100
      }
    });
  };

  // public/js/updateSettings.js
  var updateSettings = async (data, type) => {
    try {
      const url = type === "password" ? "/api/v1/users/updateMyPassword" : "/api/v1/users/updateMe";
      const res = await axios.patch(url, data);
      if (res.data.status === "success") {
        showAlert("success", `${type.toUpperCase()} updated successfully`);
        window.setTimeout(() => {
          location.assign("/me");
        }, 1500);
      }
    } catch (err) {
      showAlert("error", err.response.data.message);
    }
  };

  // public/js/index.js
  var mapBox = document.getElementById("map");
  var loginForm = document.querySelector(".form--login");
  var logOutBtn = document.querySelector(".nav__el--logout");
  var userDataForm = document.querySelector(".form-user-data");
  var userPasswordForm = document.querySelector(".form-user-password");
  var savePasswordBtn = document.querySelector(".btn--save-password");
  var bookBtn = document.getElementById("book-tour");
  if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      login(email, password);
    });
  }
  if (logOutBtn)
    logOutBtn.addEventListener("click", logout);
  if (userDataForm)
    userDataForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append("name", document.getElementById("name").value);
      form.append("email", document.getElementById("email").value);
      form.append("photo", document.getElementById("photo").files[0]);
      updateSettings(form, "data");
    });
  if (userPasswordForm)
    userPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      savePasswordBtn.textContent = "Updating...";
      savePasswordBtn.disabled = true;
      const passwordCurrent = document.getElementById("password-current").value;
      const password = document.getElementById("password").value;
      const passwordConfirm = document.getElementById("password-confirm").value;
      await updateSettings(
        {
          passwordCurrent,
          password,
          passwordConfirm
        },
        "password"
      );
      savePasswordBtn.textContent = "Save password";
      savePasswordBtn.disabled = false;
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    });
  if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
      e.target.textContent = "Processing...";
      const { tourId } = e.target.dataset;
      window.location.href = `/api/v1/bookings/checkout-session/${tourId}`;
    });
  }
})();
